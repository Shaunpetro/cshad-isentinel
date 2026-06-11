// scripts/scrape-etenders.js
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const E_TENDERS_URL = 'https://www.etenders.gov.za/Home/opportunities?id=1';
const MAX_PAGES = 5;
const NAV_TIMEOUT = 60000;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse a date string from the detail row.
 * Uses ONLY the detail‑row dates (Date Published / Closing Date).
 * NO relative "in 21 days" fallback.
 */
function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString();

  // Remove ordinal suffixes and commas
  let clean = dateStr.replace(/(\d)(st|nd|rd|th)\b/gi, '$1').replace(/,/g, '').trim();

  // Extract time if present (e.g., " - 11:00")
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

  // dd/MM/yyyy fallback
  const parts = clean.split(/[\s\/]+/);
  if (parts.length === 3 && !isNaN(parts[0])) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day, hours, minutes).toISOString();
    }
  }

  // Last resort: today
  return new Date().toISOString();
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
    await page.goto(E_TENDERS_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.waitForSelector('#tendeList tbody tr', { visible: true, timeout: 20000 });

    let totalInserted = 0;
    let currentPage = 1;

    while (currentPage <= MAX_PAGES) {
      console.log(`Page ${currentPage}: expanding rows...`);

      const visibleTitles = await page.$$eval('#tendeList tbody tr td.sorting_1', cells =>
        cells.map(cell => cell.innerText.trim()).filter(Boolean)
      );

      console.log(`  Found ${visibleTitles.length} tenders`);

      for (const title of visibleTitles) {
        console.log(`    Processing: ${title}`);

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
          console.log('      Detail row did not appear');
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

              const docLinks = Array.from(next.querySelectorAll('a[href*="Download"]'));
              const docs = docLinks.map(link => ({
                name: link.innerText.trim(),
                url: link.href,
              }));

              return { ...data, docs, _fullBriefingHTML: fullBriefingHTML };
            }
          }
          return null;
        }, title);

        const basicInfo = await page.evaluate((t) => {
          const rows = document.querySelectorAll('#tendeList tbody tr');
          for (const r of rows) {
            if (r.querySelector('td.sorting_1')?.innerText.trim() === t) {
              const cells = r.querySelectorAll('td');
              return {
                category: cells[1]?.innerText?.trim() || '',
                eSubmission: cells[3]?.innerText?.trim() || '',
              };
            }
          }
          return null;
        }, title);

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

        if (!details) {
          console.log('      Could not extract details');
          continue;
        }

        // Use ONLY detail‑row dates
        const closingDate = details['Closing Date'] ? parseDate(details['Closing Date']) : new Date().toISOString();
        const advertisedDate = details['Date Published'] ? parseDate(details['Date Published']) : new Date().toISOString();

        const companyName = details['Organ Of State'] || basicInfo?.eSubmission || '';
        const sourceId = details['Tender Number'] || null;

        const briefingIsThere = details['Is there a briefing session?'];
        const briefingRequired = briefingIsThere && briefingIsThere.toLowerCase() !== 'no' && briefingIsThere.toLowerCase() !== 'n/a';
        const briefingMandatory = details['Is it compulsory?']?.toLowerCase() === 'yes';
        const briefingDateTime = details['Briefing Date and Time'] || 'N/A';
        const briefingVenue = details['Briefing Venue'] || 'N/A';
        let briefingDetails = null;

        if (briefingRequired) {
          const html = details._fullBriefingHTML || '';
          const urlMatch = html.match(/(https?:\/\/[^\s"<>]+)/i);
          const isDigital = /virtual|online|teams|zoom|meet|webinar/i.test(briefingVenue);
          if (isDigital || urlMatch) {
            const link = urlMatch ? urlMatch[0] : '';
            briefingDetails = `Date/Time: ${briefingDateTime}\nVenue: ${briefingVenue}${link ? `\nLink: ${link}` : ''}`;
          } else {
            briefingDetails = `Date/Time: ${briefingDateTime}\nVenue: ${briefingVenue}`;
          }
        }

        const submissionType = details['Tender Type'] || 'See tender document';
        const documents = details.docs || [];
        const body = details['Special Conditions']
          ? `${title}\n\nSpecial Conditions: ${details['Special Conditions']}`
          : title;

        // Duplicate check
        let duplicate = false;
        if (sourceId) {
          const { data: existing } = await supabase
            .from('opportunities')
            .select('id')
            .eq('source_id', sourceId)
            .maybeSingle();
          if (existing) duplicate = true;
        } else {
          const { data: existing } = await supabase
            .from('opportunities')
            .select('id')
            .eq('title', title)
            .eq('company_name', companyName)
            .maybeSingle();
          if (existing) duplicate = true;
        }

        if (duplicate) {
          console.log('      Skipping (duplicate)');
          continue;
        }

        const { error } = await supabase.from('opportunities').insert({
          title: title,
          body: body,
          category: 'tender',
          subcategory: basicInfo?.category || '',
          company_name: companyName,
          province: details['Province'] || null,
          closing_date: closingDate,
          date_advertised: advertisedDate,
          apply_url: E_TENDERS_URL,
          tender_docs: documents,
          is_premium: false,
          submission_type: submissionType,
          briefing_required: briefingRequired,
          briefing_mandatory: briefingMandatory,
          briefing_details: briefingDetails,
          status: 'published',
          source_id: sourceId,
        });

        if (error) {
          console.error(`      Insert error: ${error.message}`);
        } else {
          totalInserted++;
          console.log(`      Inserted`);
        }
      }

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

    console.log(`Scraping complete. Total new tenders: ${totalInserted}`);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();