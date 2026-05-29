// scripts/backfill-details.js
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const E_TENDERS_URL = 'https://www.etenders.gov.za/Home/opportunities?id=1';
const NAV_TIMEOUT = 90000;   // 90 seconds
const MAX_RETRIES = 3;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const relDays = dateStr.match(/in\s+(\d+)\s+days?/i);
  if (relDays) {
    const days = parseInt(relDays[1], 10);
    const future = new Date();
    future.setDate(future.getDate() + days);
    return future.toISOString();
  }
  let clean = dateStr.replace(/(\d)(st|nd|rd|th)\b/gi, '$1').replace(/,/g, '').trim();
  const timeMatch = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  let hours = 0, minutes = 0;
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    if (timeMatch[3] && timeMatch[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (timeMatch[3] && timeMatch[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    clean = clean.substring(0, timeMatch.index).trim();
  }
  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    if (timeMatch) d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }
  const parts = clean.split(/[\s\/]+/);
  if (parts.length === 3 && !isNaN(parts[0])) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day, hours, minutes).toISOString();
    }
  }
  return null;
}

async function navigateWithRetry(page, url) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  Navigation attempt ${attempt}/${MAX_RETRIES}...`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.waitForSelector('#tendeList tbody tr', { visible: true, timeout: 20000 });
      console.log('  Navigation successful.');
      return;
    } catch (err) {
      console.warn(`  Attempt ${attempt} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        const delay = 10000 * attempt;
        console.log(`  Retrying in ${delay / 1000} seconds...`);
        await wait(delay);
      } else {
        throw new Error(`Failed to navigate after ${MAX_RETRIES} attempts: ${err.message}`);
      }
    }
  }
}

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(NAV_TIMEOUT);

  try {
    console.log('Navigating to eTenders...');
    await navigateWithRetry(page, E_TENDERS_URL);

    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('id, source_id, title')
      .is('source_id', null)
      .limit(500);

    if (error) {
      console.error('Fetch error:', error);
      return;
    }

    console.log(`Found ${opportunities.length} records to update`);

    let totalUpdated = 0;
    let currentPage = 1;
    const maxPages = 200;

    while (currentPage <= maxPages && totalUpdated < opportunities.length) {
      console.log(`Page ${currentPage}...`);

      const visibleTitles = await page.$$eval('#tendeList tbody tr td.sorting_1', cells =>
        cells.map(cell => cell.innerText.trim()).filter(Boolean)
      );

      for (const title of visibleTitles) {
        const match = opportunities.find(opp => opp.title === title);
        if (!match) continue;

        console.log(`Updating: ${title}`);

        // Expand row
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
        }, title);

        const detailAppeared = await page.waitForFunction(
          (t) => {
            const rows = document.querySelectorAll('#tendeList tbody tr');
            for (const r of rows) {
              if (r.querySelector('td.sorting_1')?.innerText.trim() === t) {
                const next = r.nextElementSibling;
                return next && next.querySelector('td[colspan="7"]');
              }
            }
            return false;
          },
          { timeout: 10000 },
          title
        ).catch(() => false);

        if (!detailAppeared) {
          console.log('  Detail row did not appear');
          await page.evaluate((t) => {
            const cells = document.querySelectorAll('#tendeList tbody tr td.sorting_1');
            for (const cell of cells) {
              if (cell.innerText.trim() === t) {
                const row = cell.closest('tr');
                const btn = row.querySelector('.details-control');
                if (btn) btn.click();
              }
            }
          }, title);
          await wait(300);
          continue;
        }

        await wait(500);

        // Extract detail data
        const details = await page.evaluate((t) => {
          const rows = document.querySelectorAll('#tendeList tbody tr');
          for (const r of rows) {
            if (r.querySelector('td.sorting_1')?.innerText.trim() === t) {
              const next = r.nextElementSibling;
              if (!next) return null;
              const nestedTable = next.querySelector('table');
              if (!nestedTable) return null;

              const detailRows = nestedTable.querySelectorAll('tr');
              const data = {};
              let fullBriefingHTML = '';

              for (const dRow of detailRows) {
                const cells = dRow.querySelectorAll('td');
                if (cells.length === 2) {
                  const label = cells[0].innerText.replace(/:\s*$/, '').trim();
                  const value = cells[1].innerText.trim();
                  data[label] = value;
                }
                if (dRow.innerText.includes('Briefing Date and Time')) {
                  fullBriefingHTML = dRow.innerHTML;
                }
              }

              return { ...data, _fullBriefingHTML: fullBriefingHTML };
            }
          }
          return null;
        }, title);

        // Close the row
        await page.evaluate((t) => {
          const cells = document.querySelectorAll('#tendeList tbody tr td.sorting_1');
          for (const cell of cells) {
            if (cell.innerText.trim() === t) {
              const row = cell.closest('tr');
              const btn = row.querySelector('.details-control');
              if (btn) btn.click();
            }
          }
        }, title);
        await wait(300);

        if (!details) continue;

        const updateData = {};
        if (details['Tender Number']) updateData.source_id = details['Tender Number'];
        if (details['Province']) updateData.province = details['Province'];
        if (details['Date Published']) {
          const parsed = parseDate(details['Date Published']);
          if (parsed) updateData.date_advertised = parsed;
        }
        if (details['Closing Date']) {
          const parsed = parseDate(details['Closing Date']);
          if (parsed) updateData.closing_date = parsed;
        }
        if (details['Tender Type']) updateData.submission_type = details['Tender Type'];

        const briefingIsThere = details['Is there a briefing session?'];
        if (briefingIsThere && briefingIsThere.toLowerCase() !== 'no' && briefingIsThere.toLowerCase() !== 'n/a') {
          updateData.briefing_required = true;
          updateData.briefing_mandatory = details['Is it compulsory?']?.toLowerCase() === 'yes';
          const dateTime = details['Briefing Date and Time'] || 'N/A';
          const venue = details['Briefing Venue'] || 'N/A';
          const html = details._fullBriefingHTML || '';
          const urlMatch = html.match(/(https?:\/\/[^\s"<>]+)/i);
          const isDigital = /virtual|online|teams|zoom|meet|webinar/i.test(venue);
          if (isDigital || urlMatch) {
            const link = urlMatch ? urlMatch[0] : '';
            updateData.briefing_details = `Date/Time: ${dateTime}\nVenue: ${venue}${link ? `\nLink: ${link}` : ''}`;
          } else {
            updateData.briefing_details = `Date/Time: ${dateTime}\nVenue: ${venue}`;
          }
        } else {
          updateData.briefing_required = false;
          updateData.briefing_mandatory = false;
          updateData.briefing_details = null;
        }

        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('opportunities')
            .update(updateData)
            .eq('id', match.id);
          if (updateError) {
            console.error(`  Update error: ${updateError.message}`);
          } else {
            totalUpdated++;
            console.log(`  Updated`);
          }
        }
      }

      // Paginate
      const isDisabled = await page.$('#tendeList_next.disabled');
      if (isDisabled) break;

      await page.click('#tendeList_next');
      await page.waitForFunction(() => {
        const info = document.querySelector('#tendeList_info');
        return info && info.innerText.includes('to');
      }, { timeout: 10000 }).catch(() => {});
      await wait(2000);
      currentPage++;
    }

    console.log(`Backfill complete. Updated ${totalUpdated} records.`);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();