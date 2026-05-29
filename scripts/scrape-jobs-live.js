// scripts/scrape-jobs-live.js
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs/za/search';

async function fetchJobs(page = 1) {
  const url = `${ADZUNA_BASE}/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=50`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results) throw new Error('Adzuna API error: ' + (data.error || ''));
  return data.results;
}

function extractProvince(locationName) {
  if (!locationName) return null;
  // e.g. "Sandton, Gauteng" -> "Gauteng"
  const parts = locationName.split(',').map(s => s.trim());
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

function extractCity(locationName) {
  if (!locationName) return null;
  const parts = locationName.split(',').map(s => s.trim());
  return parts[0] || null;
}

async function insertJob(job) {
  const sourceId = `adzuna-${job.id}`;

  // duplicate check by source_id first
  const { data: existing } = await supabase
    .from('opportunities')
    .select('id')
    .eq('source_id', sourceId)
    .maybeSingle();
  if (existing) return false;

  const locationName = job.location?.display_name || '';
  const province = extractProvince(locationName);
  const city = extractCity(locationName);

  const subcategory = job.category?.label || null;

  const salaryMin = job.salary_min;
  const salaryMax = job.salary_max;
  const salaryRange = (salaryMin && salaryMax) 
    ? `R${salaryMin} - R${salaryMax}` 
    : null;

  const closingDate = job.contract_time === 'permanent'
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from('opportunities').insert({
    title: job.title,
    body: job.description,
    category: 'job',
    subcategory: subcategory,
    company_name: job.company?.display_name || '',
    location_name: city,
    province: province,
    latitude: job.latitude || null,
    longitude: job.longitude || null,
    closing_date: closingDate,
    date_advertised: new Date(job.created).toISOString(),
    apply_url: job.redirect_url,
    salary_range: salaryRange,
    submission_type: null,           // not relevant for jobs
    source_id: sourceId,
    status: 'published',
    is_premium: false,
  });

  if (error) {
    console.error('Insert error:', error.message);
    return false;
  }
  return true;
}

(async () => {
  console.log('Starting live jobs scraper (Adzuna)...');
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.error('Missing Adzuna keys. Set ADZUNA_APP_ID and ADZUNA_APP_KEY env vars.');
    process.exit(1);
  }

  let totalInserted = 0;
  for (let page = 1; page <= 2; page++) { // first 2 pages (100 jobs)
    console.log(`Fetching page ${page}...`);
    try {
      const jobs = await fetchJobs(page);
      for (const job of jobs) {
        const inserted = await insertJob(job);
        if (inserted) {
          totalInserted++;
          console.log(`  Inserted: ${job.title}`);
        }
      }
    } catch (err) {
      console.error(`Page ${page} error:`, err.message);
      break;
    }
  }

  console.log(`Jobs scraper complete. Inserted ${totalInserted} new jobs.`);
})();