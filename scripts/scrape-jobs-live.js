// Inside scrape-jobs-live.js, replace the existing extractProvince function with:

function extractProvince(locationName) {
  if (!locationName) return null;

  const lower = locationName.toLowerCase().trim();

  // Known provinces
  const provinces = ['gauteng','western cape','kwazulu-natal','eastern cape','free state',
                     'limpopo','mpumalanga','north west','northern cape'];
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

  // City lookup (same comprehensive map as backfill script)
  const CITY_PROVINCE_MAP = {
    'johannesburg': 'Gauteng', 'pretoria': 'Gauteng', 'sandton': 'Gauteng', 'midrand': 'Gauteng',
    'cape town': 'Western Cape', 'stellenbosch': 'Western Cape',
    'durban': 'KwaZulu-Natal', 'pietermaritzburg': 'KwaZulu-Natal',
    'port elizabeth': 'Eastern Cape', 'gqeberha': 'Eastern Cape',
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