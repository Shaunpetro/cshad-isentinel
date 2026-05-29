// scripts/debug-expand2.js
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

  // Find and click the first details-control
  await page.evaluate(() => {
    const btn = document.querySelector('#tendeList tbody tr .details-control');
    if (btn) btn.click();
  });

  console.log('Clicked. Waiting up to 10 seconds for child row...');
  let childFound = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    childFound = await page.evaluate(() => {
      const child = document.querySelector('#tendeList tbody tr.child');
      return !!child;
    });
    console.log(`  Attempt ${i + 1}: childFound = ${childFound}`);
    if (childFound) break;
  }

  if (childFound) {
    console.log('Child row appeared!');
    // Log its HTML
    const childHTML = await page.evaluate(() => {
      const child = document.querySelector('#tendeList tbody tr.child');
      return child ? child.innerHTML.substring(0, 500) : 'null';
    });
    console.log('Child row HTML snippet:', childHTML);
  } else {
    // Check if the row expanded at all
    const rowState = await page.evaluate(() => {
      const row = document.querySelector('#tendeList tbody tr');
      return row ? row.className : 'no row';
    });
    console.log('First row class:', rowState);
    // Check network
    console.log('Possible AJAX loading, but child never appeared in DOM.');
  }

  await page.screenshot({ path: 'debug-screenshot2.png' });
  console.log('Screenshot saved.');

  // Check for any AJAX requests by looking at the expanded row's next sibling
  const nextSibling = await page.evaluate(() => {
    const shown = document.querySelector('#tendeList tbody tr.shown');
    if (shown) {
      const next = shown.nextElementSibling;
      return next ? next.className : 'no next';
    }
    return 'no shown';
  });
  console.log('Next sibling of shown:', nextSibling);

  await browser.close();
})();