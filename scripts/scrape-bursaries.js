// scripts/scrape-bursaries.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_BURSARIES = [
  {
    title: 'NSFAS 2027 Applications Now Open',
    body: 'The National Student Financial Aid Scheme (NSFAS) is now accepting applications for the 2027 academic year. NSFAS provides financial aid to eligible students at public universities and TVET colleges.\n\nEligibility:\n- South African citizen\n- Household income less than R350,000 per annum\n- Accepted or registered at a public institution\n\nCoverage:\n- Tuition fees\n- Accommodation\n- Books and learning materials\n- Living allowance\n\nClosing date: 30 September 2026',
    category: 'bursary',
    subcategory: 'General',
    company_name: 'NSFAS',
    location_name: 'South Africa',
    closing_date: new Date('2026-09-30').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: 'https://www.nsfas.org.za/apply',
    submission_type: 'Online',
    source_id: 'bursary-mock-001',
  },
  {
    title: 'Sasol Bursary Programme 2027',
    body: 'Sasol is offering comprehensive bursaries for students pursuing degrees in Engineering, Science, and Commerce.\n\nEligibility:\n- South African citizen\n- Grade 12 with 70%+ in Mathematics and Science\n- Accepted at a recognised university\n\nBenefits:\n- Full tuition\n- Accommodation\n- Meals and books\n- Mentorship programme\n\nClosing date: 15 August 2026',
    category: 'bursary',
    subcategory: 'Engineering',
    company_name: 'Sasol',
    location_name: 'Nationwide',
    closing_date: new Date('2026-08-15').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: 'https://www.sasolbursaries.com',
    submission_type: 'Online',
    source_id: 'bursary-mock-002',
  },
  {
    title: 'Allan Gray Orbis Fellowship 2027',
    body: 'The Allan Gray Orbis Foundation is looking for future leaders to join their fellowship programme. This is not just a bursary – it\'s a comprehensive entrepreneurial development programme.\n\nEligibility:\n- Grade 12 learners\n- 65%+ average\n- Demonstrated leadership potential\n- Entrepreneurial mindset\n\nBenefits:\n- Full tuition at partner universities\n- Mentorship\n- Entrepreneurial training\n- Access to the Allan Gray network',
    category: 'bursary',
    subcategory: 'Commerce',
    company_name: 'Allan Gray Orbis Foundation',
    location_name: 'Nationwide',
    closing_date: new Date('2026-07-31').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: 'https://www.allangrayorbis.org',
    submission_type: 'Online',
    source_id: 'bursary-mock-003',
  },
  {
    title: 'University of Pretoria Vice-Chancellor\'s Scholarship',
    body: 'The University of Pretoria is offering scholarships to top-performing undergraduate students.\n\nEligibility:\n- 80%+ in Grade 12\n- Accepted for full-time study at UP\n- South African citizen or permanent resident\n\nBenefits:\n- Full tuition\n- Accommodation in UP residence\n- Book allowance\n\nClosing date: 31 October 2026',
    category: 'bursary',
    subcategory: 'Academic',
    company_name: 'University of Pretoria',
    location_name: 'Pretoria, Gauteng',
    closing_date: new Date('2026-10-31').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: 'https://www.up.ac.za/fees-funding',
    submission_type: 'Online',
    source_id: 'bursary-mock-004',
  },
  {
    title: 'SANRAL Bursary for Civil Engineering',
    body: 'The South African National Roads Agency (SANRAL) is offering bursaries for students pursuing a BSc/BEng in Civil Engineering.\n\nEligibility:\n- South African citizen\n- 70%+ in Mathematics and Physical Science\n- Accepted or registered at a recognised university\n\nBenefits:\n- Full tuition\n- Accommodation\n- Books and laptop\n- Vacation work at SANRAL\n\nClosing date: 31 August 2026',
    category: 'bursary',
    subcategory: 'Engineering',
    company_name: 'SANRAL',
    location_name: 'Nationwide',
    closing_date: new Date('2026-08-31').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: 'https://www.sanral.co.za/careers/bursaries',
    submission_type: 'Online',
    source_id: 'bursary-mock-005',
  },
];

(async () => {
  console.log('Starting Bursaries scraper...');
  let inserted = 0;

  for (const bursary of MOCK_BURSARIES) {
    // Check duplicate
    const { data: existing } = await supabase
      .from('opportunities')
      .select('id')
      .eq('source_id', bursary.source_id)
      .maybeSingle();
    if (existing) {
      console.log(`  Skipping duplicate: ${bursary.title}`);
      continue;
    }

    const { error } = await supabase.from('opportunities').insert({
      title: bursary.title,
      body: bursary.body,
      category: bursary.category,
      subcategory: bursary.subcategory,
      company_name: bursary.company_name,
      location_name: bursary.location_name,
      closing_date: bursary.closing_date,
      date_advertised: bursary.date_advertised,
      apply_url: bursary.apply_url,
      submission_type: bursary.submission_type,
      source_id: bursary.source_id,
      status: 'published',
      is_premium: false,
    });

    if (error) {
      console.error(`  Insert error for ${bursary.title}: ${error.message}`);
    } else {
      inserted++;
      console.log(`  Inserted: ${bursary.title}`);
    }
  }

  console.log(`Bursaries scraper complete. Inserted ${inserted} new bursaries.`);
})();