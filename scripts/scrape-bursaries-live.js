// scripts/scrape-bursaries-live.js
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// NOTE: deliberately not requiring 'node-fetch' here. node-fetch v3+ is ESM-only,
// and require()-ing it under CommonJS returns the module namespace object rather
// than the callable function, which makes every fetch(url) call throw
// "fetch is not a function". Node 18+ ships a native global fetch, which is what
// we use below instead.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Bursaries.co.za (Puppeteer, paginated) ---
async function scrapeBursariesCoZa() {
  console.log('Scraping bursaries.co.za...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  const allBursaries = [];

  try {
    await page.goto('https://bursaries.co.za/explore', { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('a[href^="/bursaries/"]', { timeout: 10000 });

    // Detect total page count from the pager (falls back to 1 if not found)
    const totalPages = await page.evaluate(() => {
      const bodyText = document.body.innerText || '';
      const match = bodyText.match(/(\d+)\s*\/\s*(\d+)/);
      return match ? parseInt(match[2], 10) : 1;
    });
    console.log(`  Detected ${totalPages} page(s) on bursaries.co.za`);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (pageNum > 1) {
        await page.goto(`https://bursaries.co.za/explore?page=${pageNum}`, { waitUntil: 'networkidle0', timeout: 60000 });
        await page.waitForSelector('a[href^="/bursaries/"]', { timeout: 10000 }).catch(() => {});
        await wait(500);
      }

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

      console.log(`  Page ${pageNum}: found ${bursaries.length} bursaries`);
      allBursaries.push(...bursaries.filter(b => b.title));
    }

    await browser.close();
    return allBursaries;
  } catch (err) {
    console.error('bursaries.co.za error:', err.message);
    await browser.close();
    return allBursaries;
  }
}

// --- Allbursaries.co.za (Static fetch + cheerio) ---
async function scrapeAllBursaries() {
  console.log('Scraping allbursaries.co.za...');
  const bursaries = [];
  // Note: '/bursaries' itself is a category-index/FAQ page with no listing cards,
  // so it's intentionally left out here. These category pages are where the
  // actual bursary cards live.
  const urls = [
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
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`  ${url} returned status ${res.status}`);
        continue;
      }
      const html = await res.text();
      const $ = cheerio.load(html);

      $('.card').each((i, el) => {
        const title = $(el).find('h3 a').text().trim();
        if (!title) return;

        const funder = $(el).find('.text-sm.text-gray-500').first().text().trim();
        const category = $(el).find('.px-3.py-1.bg-primary-100').first().text().trim();
        const closingEl = $(el).find('.font-medium.text-red-600, .font-medium.text-blue-600, .font-medium.text-purple-600, .font-medium.text-teal-600').first();
        const closingText = closingEl.text().trim();
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

/**
 * Parses real-world closing-date text from both sources, e.g.:
 *   "2026-01-31", "Closes 31 Aug 2026", "Closed (26 Feb 2026)",
 *   "Closes September", "Closes this month", "Closes Unspecified"
 * Returns an ISO string, or null if no concrete date can be extracted.
 */
function parseClosingDate(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('unspecified') || lower.includes('this month') || lower.includes('this week')) {
    return null;
  }

  // ISO format: 2026-01-31
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`).toISOString();
  }

  // "31 Aug 2026" / "26 Feb 2026" (with or without surrounding "Closes"/"Closed (...)")
  const dMonYMatch = text.match(/(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/);
  if (dMonYMatch) {
    const day = parseInt(dMonYMatch[1], 10);
    const monthKey = dMonYMatch[2].slice(0, 3).toLowerCase();
    const year = parseInt(dMonYMatch[3], 10);
    if (monthKey in MONTHS && !isNaN(day) && !isNaN(year)) {
      return new Date(year, MONTHS[monthKey], day).toISOString();
    }
  }

  // "Closes September" (month name only, no day/year) -> last day of that month, next
  // occurrence from now
  const monthOnlyMatch = text.match(/([A-Za-z]{3,})\b/);
  if (monthOnlyMatch) {
    const monthKey = monthOnlyMatch[1].slice(0, 3).toLowerCase();
    if (monthKey in MONTHS) {
      const now = new Date();
      let year = now.getFullYear();
      if (MONTHS[monthKey] < now.getMonth()) year += 1; // assume next year if month already passed
      // Last day of that month
      const lastDay = new Date(year, MONTHS[monthKey] + 1, 0);
      return lastDay.toISOString();
    }
  }

  return null;
}

async function insertBursary(bursary, sourcePrefix) {
  const sourceId = `${sourcePrefix}-${bursary.detailUrl}`;

  const { data: existing } = await supabase
    .from('opportunities')
    .select('id')
    .eq('source_id', sourceId)
    .maybeSingle();
  if (existing) return false;

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
    closing_date: closingDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
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

  const bursariesCoZa = await scrapeBursariesCoZa();
  console.log(`Found ${bursariesCoZa.length} from bursaries.co.za`);

  const allBursaries = await scrapeAllBursaries();
  console.log(`Found ${allBursaries.length} from allbursaries.co.za`);

  let inserted = 0;

  for (const b of bursariesCoZa) {
    const ok = await insertBursary(b, 'bursariescoza');
    if (ok) {
      inserted++;
      console.log(`  Inserted: ${b.title}`);
    }
  }

  for (const b of allBursaries) {
    const ok = await insertBursary(b, 'allbursaries');
    if (ok) {
      inserted++;
      console.log(`  Inserted: ${b.title}`);
    }
  }

  console.log(`Bursaries scraper complete. Inserted ${inserted} new bursaries.`);
})();