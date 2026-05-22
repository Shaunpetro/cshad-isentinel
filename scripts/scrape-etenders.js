// scripts/scrape-etenders.js
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const E_TENDERS_URL = 'https://www.etenders.gov.za/Home/opportunities?id=1';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    console.log('Navigating to eTenders...');
    await page.goto(E_TENDERS_URL, { waitUntil: 'networkidle0', timeout: 30000 });

    // DataTable renders the table after page load. Wait for a row to appear.
    await page.waitForSelector('#tendeList tbody tr', { visible: true, timeout: 20000 });
    console.log('Table loaded. Extracting rows...');

    const rows = await page.evaluate(() => {
      const data = [];
      const table = document.querySelector('#tendeList');
      const bodyRows = table.querySelectorAll('tbody tr');
      for (const row of bodyRows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) continue;
        // Column indices: 0: checkbox, 1: Category, 2: Description (link), 3: eSubmission, 4: Advertised, 5: Closing, 6: bookmark
        const category = cells[1]?.innerText?.trim() || '';
        const descCell = cells[2];
        const link = descCell?.querySelector('a');
        const description = link?.innerText?.trim() || descCell?.innerText?.trim() || '';
        const detailUrl = link?.href || '';
        const eSubmission = cells[3]?.innerText?.trim() || '';
        const advertised = cells[4]?.innerText?.trim() || '';
        const closing = cells[5]?.innerText?.trim() || '';
        data.push({ category, description, detailUrl, eSubmission, advertised, closing });
      }
      return data;
    });

    console.log(`Found ${rows.length} tenders.`);

    for (const tender of rows) {
      console.log(`Processing: ${tender.description}`);
      let body = tender.description;
      let documents = [];
      let province = null;
      let companyName = tender.eSubmission; // eSubmission field sometimes contains organ/company

      if (tender.detailUrl) {
        try {
          await page.goto(tender.detailUrl, { waitUntil: 'networkidle0', timeout: 15000 });
          // Extract body from the main content or modal
          const pageData = await page.evaluate(() => {
            const bodyEl = document.querySelector('.modal-body') || document.querySelector('main') || document.body;
            const text = bodyEl?.innerText?.trim() || '';

            // Try to find province in the text
            const provinceMatch = text.match(/Province\s*[:\-]\s*(.+)/i);
            let province = null;
            if (provinceMatch) {
              province = provinceMatch[1].trim().split('\n')[0]; // take first line
            }

            // Extract document download links
            const docLinks = Array.from(document.querySelectorAll('a[href*="Download"]'));
            const docs = docLinks.map(link => ({
              name: link.innerText.trim(),
              url: link.href,
            }));

            return { text, province, docs };
          });

          body = pageData.text || tender.description;
          province = pageData.province;
          documents = pageData.docs;
        } catch (err) {
          console.error(`Error fetching detail for ${tender.description}:`, err.message);
        }
      }

      const { error } = await supabase
        .from('opportunities')
        .upsert({
          title: tender.description,
          body: body,
          category: 'tender',
          subcategory: tender.category,
          company_name: companyName,
          province: province,
          closing_date: parseDate(tender.closing),
          date_advertised: parseDate(tender.advertised),
          apply_url: tender.detailUrl,
          tender_docs: documents,
          is_premium: false, // we'll classify later
          submission_type: 'See tender document',
          status: 'published',
        }, { onConflict: 'title,company_name' });

      if (error) {
        console.error(`Upsert error for ${tender.description}:`, error.message);
      } else {
        console.log(`Upserted: ${tender.description}`);
      }

      // Be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    console.log('Scraping complete.');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  // eTenders uses formats like "21 May 2026" or "21/05/2026"
  // Try to parse with Date first
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString();

  // Try dd/MM/yyyy
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month - 1, day).toISOString();
    }
  }

  // Fallback
  console.warn('Could not parse date:', dateStr);
  return new Date().toISOString();
}