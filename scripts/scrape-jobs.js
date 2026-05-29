// scripts/scrape-jobs.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_JOBS = [
  {
    title: 'Senior React Native Developer',
    body: 'We are seeking an experienced React Native developer with 5+ years of experience to join our mobile team in Sandton. The ideal candidate will have strong TypeScript skills and a passion for building intuitive user interfaces.\n\nRequirements:\n- 5+ years React Native\n- TypeScript proficiency\n- Experience with Expo\n- REST API integration\n\nBenefits:\n- Medical aid\n- Remote work options\n- R800k - R1.2m p.a.',
    category: 'job',
    subcategory: 'IT',
    company_name: 'TechCorp SA',
    location_name: 'Sandton, Johannesburg',
    latitude: -26.1070,
    longitude: 28.0510,
    closing_date: new Date('2026-07-15').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: 'https://www.linkedin.com/jobs/example',
    submission_type: 'Online',
    source_id: 'job-mock-001',
  },
  {
    title: 'Registered Nurse (Night Shift)',
    body: 'MediClinic Cape Town is looking for a compassionate and dedicated Registered Nurse to join our night shift team. You will be responsible for patient care, medication administration, and monitoring vital signs.\n\nRequirements:\n- Valid SANC registration\n- 2+ years nursing experience\n- Strong communication skills\n\nSalary: R25k - R35k p.m.',
    category: 'job',
    subcategory: 'Healthcare',
    company_name: 'MediClinic',
    location_name: 'Cape Town, Western Cape',
    latitude: -33.9249,
    longitude: 18.4241,
    closing_date: new Date('2026-06-30').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: 'https://www.indeed.com/example',
    submission_type: 'Online',
    source_id: 'job-mock-002',
  },
  {
    title: 'Accountant (SAIPA)',
    body: 'Deloitte Pretoria requires a detail-oriented Accountant with SAIPA accreditation to manage financial statements, tax returns, and client portfolios.\n\nRequirements:\n- BCom Accounting degree\n- SAIPA registered\n- 3+ years accounting experience\n- CaseWare experience advantageous\n\nSalary: R35k - R45k p.m.',
    category: 'job',
    subcategory: 'Finance',
    company_name: 'Deloitte',
    location_name: 'Pretoria, Gauteng',
    latitude: -25.7479,
    longitude: 28.2293,
    closing_date: new Date('2026-06-20').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: 'https://www.pnet.co.za/example',
    submission_type: 'Online',
    source_id: 'job-mock-003',
  },
  {
    title: 'Primary School Teacher',
    body: 'Parkview Junior School is seeking a qualified Foundation Phase teacher to join our team. The ideal candidate will have a passion for early childhood development.\n\nRequirements:\n- B.Ed Foundation Phase\n- SACE registered\n- 2+ years teaching experience\n- Fluent in English and Afrikaans',
    category: 'job',
    subcategory: 'Education',
    company_name: 'Parkview Junior School',
    location_name: 'Johannesburg, Gauteng',
    latitude: -26.2041,
    longitude: 28.0473,
    closing_date: new Date('2026-07-31').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: 'https://www.educationjobs.co.za/example',
    submission_type: 'Online',
    source_id: 'job-mock-004',
  },
  {
    title: 'Electrician',
    body: 'We are looking for a qualified Electrician to join our maintenance team at a large commercial property in Durban.\n\nRequirements:\n- Trade tested\n- Wiremans license advantageous\n- 3+ years commercial experience\n- Valid drivers license',
    category: 'job',
    subcategory: 'Trades',
    company_name: 'Durban Property Services',
    location_name: 'Durban, KwaZulu-Natal',
    latitude: -29.8587,
    longitude: 31.0218,
    closing_date: new Date('2026-06-25').toISOString(),
    date_advertised: new Date().toISOString(),
    apply_url: 'https://www.gumtree.co.za/example',
    submission_type: 'Online',
    source_id: 'job-mock-005',
  },
];

(async () => {
  console.log('Starting Jobs scraper...');
  let inserted = 0;

  for (const job of MOCK_JOBS) {
    // Check duplicate
    const { data: existing } = await supabase
      .from('opportunities')
      .select('id')
      .eq('source_id', job.source_id)
      .maybeSingle();
    if (existing) {
      console.log(`  Skipping duplicate: ${job.title}`);
      continue;
    }

    const { error } = await supabase.from('opportunities').insert({
      title: job.title,
      body: job.body,
      category: job.category,
      subcategory: job.subcategory,
      company_name: job.company_name,
      location_name: job.location_name,
      latitude: job.latitude,
      longitude: job.longitude,
      closing_date: job.closing_date,
      date_advertised: job.date_advertised,
      apply_url: job.apply_url,
      submission_type: job.submission_type,
      source_id: job.source_id,
      status: 'published',
      is_premium: false,
    });

    if (error) {
      console.error(`  Insert error for ${job.title}: ${error.message}`);
    } else {
      inserted++;
      console.log(`  Inserted: ${job.title}`);
    }
  }

  console.log(`Jobs scraper complete. Inserted ${inserted} new jobs.`);
})();