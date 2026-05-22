// supabase/functions/scrape-etenders/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const E_TENDERS_URL = 'https://www.etenders.gov.za/Home/opportunities?id=1';

interface TenderRow {
  tenderNumber: string;
  title: string;
  organ: string;
  province: string;
  closingDate: string;
  detailUrl: string;
}

async function fetchAndParse(): Promise<TenderRow[]> {
  const response = await fetch(E_TENDERS_URL);
  const html = await response.text();

  // Extract rows from the table with id "tendeList"
  const tableMatch = html.match(/<table[^>]*id="tendeList"[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    console.error('Could not find tendeList table');
    return [];
  }

  const tableHtml = tableMatch[1];
  const rowMatches = tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  const rows: TenderRow[] = [];

  for (const rowMatch of rowMatches) {
    const rowHtml = rowMatch[1];
    const cells = rowHtml.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
    if (cells.length < 5) continue; // skip header or incomplete rows

    // Typical eTenders columns (0-indexed):
    // 0: Tender Number, 1: Title (with link), 2: Organ, 3: Province, 4: Closing Date
    const tenderNumber = stripHtml(cells[0]);
    const titleCell = cells[1];
    const title = stripHtml(titleCell);
    const detailUrlMatch = titleCell.match(/href="([^"]+)"/);
    const detailUrl = detailUrlMatch
      ? 'https://www.etenders.gov.za' + detailUrlMatch[1]
      : '';
    const organ = stripHtml(cells[2]);
    const province = stripHtml(cells[3]);
    const closingDate = stripHtml(cells[4]);

    if (!tenderNumber || !title) continue;

    rows.push({ tenderNumber, title, organ, province, closingDate, detailUrl });
  }

  return rows;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

async function fetchDetail(detailUrl: string): Promise<{ body: string; documents: { name: string; url: string }[] } | null> {
  try {
    const response = await fetch(detailUrl);
    const html = await response.text();

    // Extract body text from the detail page (adjust selectors as needed)
    const bodyMatch = html.match(/<div[^>]*class="[^"]*modal-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const body = bodyMatch ? stripHtml(bodyMatch[1]) : '';

    // Extract document links
    const docMatches = html.matchAll(/<a[^>]*href="([^"]*Download[^"]*)"[^>]*>([^<]*)<\/a>/gi);
    const documents: { name: string; url: string }[] = [];
    for (const docMatch of docMatches) {
      documents.push({
        name: stripHtml(docMatch[2]),
        url: 'https://www.etenders.gov.za' + docMatch[1],
      });
    }

    return { body, documents };
  } catch (error) {
    console.error('Error fetching detail:', error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  try {
    console.log('Starting eTenders scrape...');
    const tenders = await fetchAndParse();
    console.log(`Found ${tenders.length} tenders`);

    let insertedCount = 0;
    for (const tender of tenders) {
      // Fetch detail for body and documents
      let body = tender.title;
      let documents: { name: string; url: string }[] = [];
      
      if (tender.detailUrl) {
        const detail = await fetchDetail(tender.detailUrl);
        if (detail) {
          body = detail.body || tender.title;
          documents = detail.documents;
        }
        // Small delay to be polite
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Upsert into opportunities table
      const { error } = await supabase
        .from('opportunities')
        .upsert({
          title: tender.title,
          body: body,
          category: 'tender',
          company_name: tender.organ,
          province: tender.province,
          location_name: tender.province, // Will be refined with geocoding later
          closing_date: parseDate(tender.closingDate),
          date_advertised: new Date().toISOString(),
          tender_docs: documents,
          is_premium: false, // Will be classified later
          submission_type: 'See tender document',
          status: 'published',
        }, { onConflict: 'title,company_name' });

      if (!error) insertedCount++;
    }

    return new Response(JSON.stringify({ success: true, inserted: insertedCount }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

function parseDate(dateStr: string): string {
  // eTenders uses dd/MM/yyyy format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00+02:00`;
  }
  return new Date().toISOString();
}