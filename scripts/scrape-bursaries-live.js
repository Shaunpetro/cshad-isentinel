// scripts/scrape-bursaries-live.js
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Bursaries.co.za (Puppeteer) ---
async function scrapeBursariesCoZa() {
  console.log('Scraping bursaries.co.za...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  try {
    await page.goto('https://bursaries.co.za/explore', { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('a[href^="/bursaries/"]', { timeout: 10000 });

    const bursaries = await page.$$eval('a[href^="/bursaries/"]', links =>
      links.map(link => {
        const title = link.querySelector('h3')?.innerText?.trim() || '';
        const funder = link.querySelector('p.text-\\[11px\\]')?.innerText?.trim() || '';
        const tags = Array.from(link.querySelectorAll('.flex.flex-wrap.gap-1.mt-0\\.5 span')).map(span => span.innerText.trim());
        const closingDiv = link.querySelector('.mt-auto');
        const closingSpan = closingDiv ? closingDiv.querySelector('span:last-child') : null;
        const closingText = closingSpan?.innerText?.trim() || '';
        const detailUrl = link.href;
        return { title, funder, tags, closingText, detailUrl };
      })
    );

    await browser.close();
    return bursaries;
  } catch (err) {
    console.error('bursaries.co.za error:', err);
    await browser.close();
    return [];
  }
}

// --- Allbursaries.co.za (Static fetch + cheerio) ---
async function scrapeAllBursaries() {
  console.log('Scraping allbursaries.co.za...');
  const bursaries = [];
  const urls = [
    'https://allbursaries.co.za/bursaries',
    'https://allbursaries.co.za/engineering',
    'https://allbursaries.co.za/medical',
    'https://allbursaries.co.za/accounting',
    'https://allbursaries.co.za/education-teaching',
    'https://allbursaries.co.za/agriculture',
    'https://allbursaries.co.za/general',
    'https://allbursaries.co.za/computer-science',
  ];

  for (const url of urls) {
    try {
      const html = await fetch(url).then(r => r.text());
      const $ = cheerio.load(html);

      $('.card').each((i, el) => {
        const title = $(el).find('h3 a').text().trim();
        if (!title) return;

        const funder = $(el).find('.text-sm.text-gray-500').first().text().trim();
        const category = $(el).find('.px-3.py-1.bg-primary-100').first().text().trim();
        const closingEl = $(el).find('.font-medium.text-red-600, .font-medium.text-blue-600, .font-medium.text-purple-600, .font-medium.text-teal-600').first();
        const closingText = closingEl.text().trim();
        const amount = $(el).find('.space-y-2 .flex.justify-between:nth-child(1) .font-medium').first().text().trim();
        const detailUrl = $(el).find('h3 a').attr('href');

        bursaries.push({
          title,
          funder,
          tags: category ? [category] : [],
          closingText,
          detailUrl: detailUrl ? (detailUrl.startsWith('http') ? detailUrl : `https://allbursaries.co.za${detailUrl}`) : '',
        });
      });
    } catch (err) {
      console.error(`Error scraping ${url}:`, err.message);
    }
  }

  return bursaries;
}

function parseClosingDate(text) {
  if (!text || text.includes('Unspecified') || text.includes('Closed')) return null;
  // Try "2026-01-31" format
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`).toISOString();
  }
  // Try "Closes June" or "5 days left"
  return null;
}

async function insertBursary(bursary, sourcePrefix) {
  const sourceId = `${sourcePrefix}-${bursary.detailUrl}`;

  // Dedup: check source_id first
  const { data: existing } = await supabase
    .from('opportunities')
    .select('id')
    .eq('source_id', sourceId)
    .maybeSingle();
  if (existing) return false;

  // Dedup: check title + company (case‑insensitive)
  const { data: duplicate } = await supabase
    .from('opportunities')
    .select('id')
    .ilike('title', bursary.title)
    .ilike('company_name', bursary.funder || '')
    .maybeSingle();
  if (duplicate) return false;

  const closingDate = parseClosingDate(bursary.closingText);

  const { error } = await supabase.from('opportunities').insert({
    title: bursary.title,
    body: `Funder: ${bursary.funder || 'N/A'}\n\nTags: ${bursary.tags.join(', ')}\n\nClosing: ${bursary.closingText}`,
    category: 'bursary',
    subcategory: bursary.tags[0] || null,
    company_name: bursary.funder || 'See website',
    closing_date: closingDate || new Date('2026-09-30').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: bursary.detailUrl,
    source_id: sourceId,
    status: 'published',
    is_premium: false,
    submission_type: null,
  });

  if (error) {
    console.error('Insert error:', error.message);
    return false;
  }
  return true;
}

(async () => {
  console.log('Starting combined bursaries scraper...');

  // Scrape both sources
  const bursariesCoZa = await scrapeBursariesCoZa();
  console.log(`Found ${bursariesCoZa.length} from bursaries.co.za`);

  const allBursaries = await scrapeAllBursaries();
  console.log(`Found ${allBursaries.length} from allbursaries.co.za`);

  let inserted = 0;

  // Insert bursaries.co.za
  for (const b of bursariesCoZa) {
    const ok = await insertBursary(b, 'bursariescoza');
    if (ok) {
      inserted++;
      console.log(`  Inserted: ${b.title}`);
    }
  }

  // Insert allbursaries.co.za
  for (const b of allBursaries) {
    const ok = await insertBursary(b, 'allbursaries');
    if (ok) {
      inserted++;
      console.log(`  Inserted: ${b.title}`);
    }
  }

  console.log(`Bursaries scraper complete. Inserted ${inserted} new bursaries.`);
})();