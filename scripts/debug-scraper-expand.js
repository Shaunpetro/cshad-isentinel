// scripts/debug-scraper-expand.js
const puppeteer = require('puppeteer');

const E_TENDERS_URL = 'https://www.etenders.gov.za/Home/opportunities?id=1';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(E_TENDERS_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('#tendeList tbody tr', { visible: true, timeout: 20000 });

  // Expand the very first row
  const firstTitle = await page.$eval('#tendeList tbody tr td.sorting_1', el => el.innerText.trim());
  console.log('First row title:', firstTitle);

  await page.evaluate((t) => {
    const cells = document.querySelectorAll('#tendeList tbody tr td.sorting_1');
    for (const cell of cells) {
      if (cell.innerText.trim() === t) {
        const row = cell.closest('tr');
        const btn = row.querySelector('.details-control');
        if (btn) btn.click();
        return;
      }
    }
  }, firstTitle);

  // Wait 8 seconds
  await new Promise(r => setTimeout(r, 8000));

  // Dump tbody innerHTML
  const tbodyHTML = await page.evaluate(() => {
    const tbody = document.querySelector('#tendeList tbody');
    return tbody ? tbody.innerHTML.substring(0, 3000) : 'no tbody';
  });
  console.log('tbody HTML snippet:');
  console.log(tbodyHTML);

  // Check for detail row specifically
  const detailExists = await page.evaluate((t) => {
    const rows = document.querySelectorAll('#tendeList tbody tr');
    for (const r of rows) {
      if (r.querySelector('td.sorting_1')?.innerText.trim() === t) {
        const next = r.nextElementSibling;
        return next && next.querySelector('td[colspan="7"]');
      }
    }
    return false;
  }, firstTitle);
  console.log('Detail row found:', detailExists);

  await browser.close();
})();