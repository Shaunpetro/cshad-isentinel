// scripts/debug-expand3.js
const puppeteer = require('puppeteer');

const E_TENDERS_URL = 'https://www.etenders.gov.za/Home/opportunities?id=1';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50
  });
  const page = await browser.newPage();
  await page.goto(E_TENDERS_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('#tendeList tbody tr', { visible: true, timeout: 20000 });

  // Click the first row's details-control
  await page.evaluate(() => {
    const btn = document.querySelector('#tendeList tbody tr .details-control');
    if (btn) btn.click();
  });

  console.log('Clicked. Waiting 15 seconds...');
  await new Promise(r => setTimeout(r, 15000));

  // Grab the entire outerHTML of the first row
  const rowHTML = await page.evaluate(() => {
    const row = document.querySelector('#tendeList tbody tr');
    return row ? row.outerHTML.substring(0, 3000) : 'no row';
  });
  console.log('First row HTML after 15s:');
  console.log(rowHTML);

  await page.screenshot({ path: 'debug-expand3.png', fullPage: false });
  console.log('Screenshot saved as debug-expand3.png');

  await browser.close();
})();