// scripts/backfill-jobs.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function extractProvince(locationName) {
  if (!locationName) return null;
  const parts = locationName.split(',').map(s => s.trim());
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

function extractCity(locationName) {
  if (!locationName) return null;
  const parts = locationName.split(',').map(s => s.trim());
  return parts[0] || null;
}

(async () => {
  console.log('Fetching jobs with missing province...');
  const { data: jobs, error } = await supabase
    .from('opportunities')
    .select('id, location_name')
    .eq('category', 'job')
    .is('province', null)
    .limit(500);

  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  console.log(`Found ${jobs.length} jobs to update.`);

  let updated = 0;
  for (const job of jobs) {
    const province = extractProvince(job.location_name);
    const city = extractCity(job.location_name);

    const updateData = {};
    if (province) updateData.province = province;
    if (city && city !== job.location_name) updateData.location_name = city;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('opportunities')
        .update(updateData)
        .eq('id', job.id);
      if (updateError) {
        console.error(`Update error for ${job.id}: ${updateError.message}`);
      } else {
        updated++;
      }
    }
  }

  console.log(`Backfill complete. Updated ${updated} jobs.`);
})();