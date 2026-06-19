// scripts/scrape-jobs-live.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

const ADZUNA_COUNTRY = 'za'; // South Africa
const PAGES_PER_RUN = 3;
const RESULTS_PER_PAGE = 50;
const DEFAULT_OPEN_DAYS = 30; // Adzuna doesn't give a closing date, so we estimate one

function extractProvince(locationName) {
  if (!locationName) return null;

  const lower = locationName.toLowerCase().trim();

  const provinces = ['gauteng', 'western cape', 'kwazulu-natal', 'eastern cape', 'free state',
    'limpopo', 'mpumalanga', 'north west', 'northern cape'];
  if (provinces.includes(lower)) {
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  // "City, Province" format
  const parts = locationName.split(',').map(s => s.trim());
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (provinces.includes(lastPart)) {
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }
  }

  // City lookup (same map used by backfill-jobs.js, kept in sync)
  const CITY_PROVINCE_MAP = {
    'johannesburg': 'Gauteng', 'pretoria': 'Gauteng', 'sandton': 'Gauteng', 'midrand': 'Gauteng',
    'centurion': 'Gauteng', 'soweto': 'Gauteng', 'roodepoort': 'Gauteng', 'randburg': 'Gauteng',
    'cape town': 'Western Cape', 'stellenbosch': 'Western Cape', 'george': 'Western Cape',
    'durban': 'KwaZulu-Natal', 'pietermaritzburg': 'KwaZulu-Natal', 'umhlanga': 'KwaZulu-Natal',
    'port elizabeth': 'Eastern Cape', 'gqeberha': 'Eastern Cape', 'east london': 'Eastern Cape',
    'bloemfontein': 'Free State',
    'polokwane': 'Limpopo',
    'nelspruit': 'Mpumalanga', 'mbombela': 'Mpumalanga',
    'rustenburg': 'North West',
    'kimberley': 'Northern Cape',
  };

  for (const [city, province] of Object.entries(CITY_PROVINCE_MAP)) {
    if (lower.includes(city)) return province;
  }

  return null;
}

function buildAdzunaUrl(page) {
  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: String(RESULTS_PER_PAGE),
    sort_by: 'date',
    'content-type': 'application/json',
  });
  return `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/${page}?${params.toString()}`;
}

async function fetchAdzunaPage(page) {
  const url = buildAdzunaUrl(page);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Adzuna request failed (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return Array.isArray(data.results) ? data.results : [];
}

function mapAdzunaJob(job) {
  const locationName = job.location?.display_name || null;
  const createdAt = job.created ? new Date(job.created) : new Date();
  const closingDate = new Date(createdAt.getTime() + DEFAULT_OPEN_DAYS * 24 * 60 * 60 * 1000);

  return {
    title: job.title || 'Untitled role',
    body: job.description || job.title || '',
    category: 'job',
    subcategory: job.category?.label || null,
    company_name: job.company?.display_name || 'See listing',
    location_name: locationName,
    province: extractProvince(locationName),
    latitude: typeof job.latitude === 'number' ? job.latitude : null,
    longitude: typeof job.longitude === 'number' ? job.longitude : null,
    closing_date: closingDate.toISOString(),
    date_advertised: createdAt.toISOString(),
    apply_url: job.redirect_url || null,
    submission_type: 'Online',
    source_id: job.id ? `adzuna-${job.id}` : null,
    status: 'published',
    is_premium: false,
  };
}

async function insertJob(job) {
  if (!job.source_id) return false;

  const { data: existing, error: lookupError } = await supabase
    .from('opportunities')
    .select('id')
    .eq('source_id', job.source_id)
    .maybeSingle();

  if (lookupError) {
    console.error(`  Lookup error for ${job.source_id}: ${lookupError.message}`);
    return false;
  }
  if (existing) return false;

  const { error } = await supabase.from('opportunities').insert(job);
  if (error) {
    console.error(`  Insert error for ${job.title}: ${error.message}`);
    return false;
  }
  return true;
}

(async () => {
  console.log('Starting Adzuna jobs scraper...');

  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    console.error('Missing ADZUNA_APP_ID or ADZUNA_APP_KEY environment variables. Aborting.');
    process.exit(1);
  }
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. Aborting.');
    process.exit(1);
  }

  let inserted = 0;
  let seen = 0;

  for (let page = 1; page <= PAGES_PER_RUN; page++) {
    console.log(`Fetching Adzuna page ${page}...`);
    let results;
    try {
      results = await fetchAdzunaPage(page);
    } catch (err) {
      console.error(`  Failed to fetch page ${page}: ${err.message}`);
      continue;
    }

    if (results.length === 0) {
      console.log(`  No results on page ${page}, stopping pagination.`);
      break;
    }

    seen += results.length;

    for (const raw of results) {
      const job = mapAdzunaJob(raw);
      const ok = await insertJob(job);
      if (ok) {
        inserted++;
        console.log(`  Inserted: ${job.title} (${job.company_name})`);
      }
    }
  }

  console.log(`Jobs scraper complete. Saw ${seen} jobs, inserted ${inserted} new.`);
})();