// scripts/debug-dump-table.js
const puppeteer = require('puppeteer');

const E_TENDERS_URL = 'https://www.etenders.gov.za/Home/opportunities?id=1';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(E_TENDERS_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('#tendeList tbody tr', { visible: true, timeout: 20000 });

  // Expand the first row
  await page.evaluate(() => {
    const btn = document.querySelector('#tendeList tbody tr .details-control');
    if (btn) btn.click();
  });

  // Wait
  await new Promise(r => setTimeout(r, 5000));

  // Dump all rows in tbody
  const tableBodyHTML = await page.evaluate(() => {
    const tbody = document.querySelector('#tendeList tbody');
    if (!tbody) return 'no tbody';
    const rows = tbody.querySelectorAll('tr');
    let result = `Found ${rows.length} rows\n`;
    rows.forEach((row, idx) => {
      result += `\nRow ${idx}: class="${row.className}" | innerHTML first 200 chars: ${row.innerHTML.substring(0, 200)}`;
    });
    return result;
  });

  console.log(tableBodyHTML);
  await browser.close();
})();