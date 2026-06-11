// scripts/backfill-jobs.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive South African city‑to‑province mapping
const CITY_PROVINCE_MAP = {
  // Gauteng
  'johannesburg': 'Gauteng', 'joburg': 'Gauteng', 'jhb': 'Gauteng', 'jozi': 'Gauteng',
  'sandton': 'Gauteng', 'midrand': 'Gauteng', 'randburg': 'Gauteng', 'roodepoort': 'Gauteng',
  'pretoria': 'Gauteng', 'tshwane': 'Gauteng', 'pta': 'Gauteng',
  'centurion': 'Gauteng', 'alberton': 'Gauteng', 'benoni': 'Gauteng', 'boksburg': 'Gauteng',
  'brakpan': 'Gauteng', 'carletonville': 'Gauteng', 'edenvale': 'Gauteng', 'ermelo': 'Gauteng',
  'germiston': 'Gauteng', 'heidelberg': 'Gauteng', 'kempton park': 'Gauteng', 'krugersdorp': 'Gauteng',
  'mamelodi': 'Gauteng', 'nigel': 'Gauteng', 'randfontein': 'Gauteng', 'sebokeng': 'Gauteng',
  'soshanguve': 'Gauteng', 'springs': 'Gauteng', 'vanderbijlpark': 'Gauteng', 'vereeniging': 'Gauteng',
  'westonaria': 'Gauteng',

  // Western Cape
  'cape town': 'Western Cape', 'kaapstad': 'Western Cape', 'stellenbosch': 'Western Cape',
  'paarl': 'Western Cape', 'franschhoek': 'Western Cape', 'george': 'Western Cape',
  'mossel bay': 'Western Cape', 'knysna': 'Western Cape', 'plettenberg bay': 'Western Cape',
  'worcester': 'Western Cape', 'hermanus': 'Western Cape', 'caledon': 'Western Cape',
  'somerset west': 'Western Cape', 'strand': 'Western Cape', 'bellville': 'Western Cape',
  'durbanville': 'Western Cape', 'kuils river': 'Western Cape', 'milnerton': 'Western Cape',
  'table view': 'Western Cape', 'athlone': 'Western Cape', 'langa': 'Western Cape',
  'khayelitsha': 'Western Cape', 'mitchells plain': 'Western Cape',

  // KwaZulu‑Natal
  'durban': 'KwaZulu-Natal', 'ethekwini': 'KwaZulu-Natal', 'pietermaritzburg': 'KwaZulu-Natal',
  'richards bay': 'KwaZulu-Natal', 'newcastle': 'KwaZulu-Natal', 'ladysmith': 'KwaZulu-Natal',
  'empangeni': 'KwaZulu-Natal', 'port shepstone': 'KwaZulu-Natal', 'margate': 'KwaZulu-Natal',
  'umhlanga': 'KwaZulu-Natal', 'ballito': 'KwaZulu-Natal', 'pinetown': 'KwaZulu-Natal',
  'stanger': 'KwaZulu-Natal', 'kwa dukuza': 'KwaZulu-Natal',

  // Eastern Cape
  'port elizabeth': 'Eastern Cape', 'gqeberha': 'Eastern Cape', 'east london': 'Eastern Cape',
  'grahamstown': 'Eastern Cape', 'makhanda': 'Eastern Cape', 'queenstown': 'Eastern Cape',
  'uitenhage': 'Eastern Cape', 'king williams town': 'Eastern Cape', 'bhisho': 'Eastern Cape',
  'aliwal north': 'Eastern Cape', 'butterworth': 'Eastern Cape', 'cradock': 'Eastern Cape',
  'graaff‑reinet': 'Eastern Cape', 'humansdorp': 'Eastern Cape', 'jeffreys bay': 'Eastern Cape',
  'stutterheim': 'Eastern Cape',

  // Free State
  'bloemfontein': 'Free State', 'welkom': 'Free State', 'bethlehem': 'Free State',
  'kroonstad': 'Free State', 'sasolburg': 'Free State', 'parys': 'Free State',
  'phuthaditjhaba': 'Free State', 'hebron': 'Free State',

  // Limpopo
  'polokwane': 'Limpopo', 'pietersburg': 'Limpopo', 'tzaneen': 'Limpopo',
  'mokopane': 'Limpopo', 'potgietersrus': 'Limpopo', 'thabazimbi': 'Limpopo',
  'lepelle': 'Limpopo', 'giyani': 'Limpopo', 'makhado': 'Limpopo',
  'louis trichardt': 'Limpopo', 'musina': 'Limpopo', 'messina': 'Limpopo',

  // Mpumalanga
  'nelspruit': 'Mpumalanga', 'mbombela': 'Mpumalanga', 'witbank': 'Mpumalanga',
  'emalahleni': 'Mpumalanga', 'secunda': 'Mpumalanga', 'ermelo': 'Mpumalanga',
  'middelburg': 'Mpumalanga', 'balfour': 'Mpumalanga', 'barberton': 'Mpumalanga',
  'komatipoort': 'Mpumalanga', 'lydenburg': 'Mpumalanga', 'piet retief': 'Mpumalanga',
  'standerton': 'Mpumalanga', 'volksrust': 'Mpumalanga',

  // North West
  'rustenburg': 'North West', 'klerksdorp': 'North West', 'potchefstroom': 'North West',
  'mafikeng': 'North West', 'mahikeng': 'North West', 'brits': 'North West',
  'lichtenburg': 'North West', 'zeerust': 'North West',

  // Northern Cape
  'kimberley': 'Northern Cape', 'upington': 'Northern Cape', 'springbok': 'Northern Cape',
  'kuruman': 'Northern Cape', 'de aar': 'Northern Cape', 'colesberg': 'Northern Cape',
  'postmasburg': 'Northern Cape',
};

function extractProvince(locationName) {
  if (!locationName) return null;

  // Already a known province
  const provinces = ['gauteng','western cape','kwazulu-natal','eastern cape','free state',
                     'limpopo','mpumalanga','north west','northern cape'];
  const lower = locationName.toLowerCase().trim();
  if (provinces.includes(lower)) {
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  // Try "City, Province" format
  const parts = locationName.split(',').map(s => s.trim());
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (provinces.includes(lastPart)) {
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }
    // Also check the second‑to‑last part in case of "City, Region, Province"
    if (parts.length > 2) {
      const secondLast = parts[parts.length - 2].toLowerCase();
      if (provinces.includes(secondLast)) {
        return secondLast.charAt(0).toUpperCase() + secondLast.slice(1);
      }
    }
  }

  // Look up city name
  for (const [city, province] of Object.entries(CITY_PROVINCE_MAP)) {
    if (lower.includes(city)) return province;
  }

  return null;
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