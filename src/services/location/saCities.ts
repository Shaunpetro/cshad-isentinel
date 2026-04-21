// src/services/location/saCities.ts
/**
 * South African Cities and Towns Data
 * Used for location-based news filtering
 * Supports both hardcoded cities and custom locations from GPS/search
 */

export interface SACity {
  id: string;
  name: string;
  province: string;
  provinceCode: string;
  latitude: number;
  longitude: number;
  population: number;
  isCustom?: boolean;
  aliases?: string[]; // Alternative names for fuzzy matching
}

// Province codes for matching
export const PROVINCE_CODES: Record<string, string> = {
  'Gauteng': 'GP',
  'Western Cape': 'WC',
  'KwaZulu-Natal': 'KZN',
  'Eastern Cape': 'EC',
  'Free State': 'FS',
  'Limpopo': 'LP',
  'Mpumalanga': 'MP',
  'Northern Cape': 'NC',
  'North West': 'NW',
  'North-West': 'NW',
};

// Reverse lookup: code to full name
export const PROVINCE_NAMES: Record<string, string> = {
  'GP': 'Gauteng',
  'WC': 'Western Cape',
  'KZN': 'KwaZulu-Natal',
  'EC': 'Eastern Cape',
  'FS': 'Free State',
  'LP': 'Limpopo',
  'MP': 'Mpumalanga',
  'NC': 'Northern Cape',
  'NW': 'North West',
};

export const SA_CITIES: SACity[] = [
  // ============ GAUTENG ============
  {
    id: 'jhb',
    name: 'Johannesburg',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.2041,
    longitude: 28.0473,
    population: 5635127,
    aliases: ['Joburg', 'Jozi', 'JHB'],
  },
  {
    id: 'pta',
    name: 'Pretoria',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -25.7479,
    longitude: 28.2293,
    population: 2921488,
    aliases: ['Tshwane'],
  },
  {
    id: 'sow',
    name: 'Soweto',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.2485,
    longitude: 27.8546,
    population: 1271628,
  },
  {
    id: 'san',
    name: 'Sandton',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.1076,
    longitude: 28.0567,
    population: 222415,
  },
  {
    id: 'mdv',
    name: 'Midvaal',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.6833,
    longitude: 28.0167,
    population: 111612,
  },
  {
    id: 'ben',
    name: 'Benoni',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.1883,
    longitude: 28.3206,
    population: 605344,
  },
  {
    id: 'bok',
    name: 'Boksburg',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.2125,
    longitude: 28.2575,
    population: 476322,
  },
  {
    id: 'kem',
    name: 'Kempton Park',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.1000,
    longitude: 28.2333,
    population: 425000,
  },
  {
    id: 'cen',
    name: 'Centurion',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -25.8603,
    longitude: 28.1894,
    population: 236580,
  },
  {
    id: 'ran',
    name: 'Randburg',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.0936,
    longitude: 27.9822,
    population: 337053,
  },
  {
    id: 'ros',
    name: 'Roodepoort',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.1625,
    longitude: 27.8725,
    population: 326416,
  },
  {
    id: 'vdv',
    name: 'Vanderbijlpark',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.7103,
    longitude: 27.8372,
    population: 95840,
  },
  {
    id: 'vrn',
    name: 'Vereeniging',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.6736,
    longitude: 27.9319,
    population: 377922,
  },
  {
    id: 'spr',
    name: 'Springs',
    province: 'Gauteng',
    provinceCode: 'GP',
    latitude: -26.2500,
    longitude: 28.4333,
    population: 186394,
  },

  // ============ WESTERN CAPE ============
  {
    id: 'cpt',
    name: 'Cape Town',
    province: 'Western Cape',
    provinceCode: 'WC',
    latitude: -33.9249,
    longitude: 18.4241,
    population: 4618000,
    aliases: ['Mother City', 'CPT'],
  },
  {
    id: 'stb',
    name: 'Stellenbosch',
    province: 'Western Cape',
    provinceCode: 'WC',
    latitude: -33.9321,
    longitude: 18.8602,
    population: 173197,
  },
  {
    id: 'par',
    name: 'Paarl',
    province: 'Western Cape',
    provinceCode: 'WC',
    latitude: -33.7342,
    longitude: 18.9619,
    population: 191438,
  },
  {
    id: 'geo',
    name: 'George',
    province: 'Western Cape',
    provinceCode: 'WC',
    latitude: -33.9630,
    longitude: 22.4617,
    population: 211278,
  },
  {
    id: 'mos',
    name: 'Mossel Bay',
    province: 'Western Cape',
    provinceCode: 'WC',
    latitude: -34.1830,
    longitude: 22.1461,
    population: 138271,
  },
  {
    id: 'kny',
    name: 'Knysna',
    province: 'Western Cape',
    provinceCode: 'WC',
    latitude: -34.0356,
    longitude: 23.0488,
    population: 76774,
  },
  {
    id: 'wor',
    name: 'Worcester',
    province: 'Western Cape',
    provinceCode: 'WC',
    latitude: -33.6461,
    longitude: 19.4486,
    population: 166825,
  },

  // ============ KWAZULU-NATAL ============
  {
    id: 'dbn',
    name: 'Durban',
    province: 'KwaZulu-Natal',
    provinceCode: 'KZN',
    latitude: -29.8587,
    longitude: 31.0218,
    population: 3720953,
    aliases: ['eThekwini', 'DBN'],
  },
  {
    id: 'pmb',
    name: 'Pietermaritzburg',
    province: 'KwaZulu-Natal',
    provinceCode: 'KZN',
    latitude: -29.6006,
    longitude: 30.3794,
    population: 750845,
    aliases: ['Maritzburg', 'PMB'],
  },
  {
    id: 'new',
    name: 'Newcastle',
    province: 'KwaZulu-Natal',
    provinceCode: 'KZN',
    latitude: -27.7567,
    longitude: 29.9319,
    population: 363236,
  },
  {
    id: 'ric',
    name: 'Richards Bay',
    province: 'KwaZulu-Natal',
    provinceCode: 'KZN',
    latitude: -28.7830,
    longitude: 32.0377,
    population: 252968,
  },
  {
    id: 'lad',
    name: 'Ladysmith',
    province: 'KwaZulu-Natal',
    provinceCode: 'KZN',
    latitude: -28.5597,
    longitude: 29.7772,
    population: 64855,
  },
  {
    id: 'umb',
    name: 'Umhlanga',
    province: 'KwaZulu-Natal',
    provinceCode: 'KZN',
    latitude: -29.7231,
    longitude: 31.0819,
    population: 50000,
  },
  {
    id: 'bal',
    name: 'Ballito',
    province: 'KwaZulu-Natal',
    provinceCode: 'KZN',
    latitude: -29.5389,
    longitude: 31.2139,
    population: 31000,
  },

  // ============ EASTERN CAPE ============
  {
    id: 'gqb',
    name: 'Gqeberha',
    province: 'Eastern Cape',
    provinceCode: 'EC',
    latitude: -33.9608,
    longitude: 25.6022,
    population: 1263000,
    aliases: ['Port Elizabeth', 'PE'],
  },
  {
    id: 'eln',
    name: 'East London',
    province: 'Eastern Cape',
    provinceCode: 'EC',
    latitude: -33.0292,
    longitude: 27.8546,
    population: 755200,
    aliases: ['EL'],
  },
  {
    id: 'mth',
    name: 'Mthatha',
    province: 'Eastern Cape',
    provinceCode: 'EC',
    latitude: -31.5889,
    longitude: 28.7844,
    population: 137772,
    aliases: ['Umtata'],
  },
  {
    id: 'qtn',
    name: 'Queenstown',
    province: 'Eastern Cape',
    provinceCode: 'EC',
    latitude: -31.8972,
    longitude: 26.8756,
    population: 105309,
  },
  {
    id: 'grf',
    name: 'Graaff-Reinet',
    province: 'Eastern Cape',
    provinceCode: 'EC',
    latitude: -32.2522,
    longitude: 24.5306,
    population: 35000,
  },

  // ============ FREE STATE ============
  {
    id: 'blm',
    name: 'Bloemfontein',
    province: 'Free State',
    provinceCode: 'FS',
    latitude: -29.0852,
    longitude: 26.1596,
    population: 556000,
    aliases: ['Bloem', 'Mangaung'],
  },
  {
    id: 'wel',
    name: 'Welkom',
    province: 'Free State',
    provinceCode: 'FS',
    latitude: -27.9744,
    longitude: 26.7369,
    population: 431944,
  },
  {
    id: 'kro',
    name: 'Kroonstad',
    province: 'Free State',
    provinceCode: 'FS',
    latitude: -27.6506,
    longitude: 27.2319,
    population: 103992,
  },
  {
    id: 'bet',
    name: 'Bethlehem',
    province: 'Free State',
    provinceCode: 'FS',
    latitude: -28.2292,
    longitude: 28.3067,
    population: 86444,
  },

  // ============ LIMPOPO ============
  {
    id: 'plk',
    name: 'Polokwane',
    province: 'Limpopo',
    provinceCode: 'LP',
    latitude: -23.9045,
    longitude: 29.4689,
    population: 797127,
    aliases: ['Pietersburg'],
  },
  {
    id: 'tzn',
    name: 'Tzaneen',
    province: 'Limpopo',
    provinceCode: 'LP',
    latitude: -23.8317,
    longitude: 30.1631,
    population: 26785,
  },
  {
    id: 'tho',
    name: 'Thohoyandou',
    province: 'Limpopo',
    provinceCode: 'LP',
    latitude: -22.9500,
    longitude: 30.4833,
    population: 69453,
  },
  {
    id: 'mus',
    name: 'Musina',
    province: 'Limpopo',
    provinceCode: 'LP',
    latitude: -22.3381,
    longitude: 30.0417,
    population: 42678,
    aliases: ['Messina'],
  },
  {
    id: 'mok',
    name: 'Mokopane',
    province: 'Limpopo',
    provinceCode: 'LP',
    latitude: -24.1950,
    longitude: 29.0050,
    population: 35000,
    aliases: ['Potgietersrus'],
  },
  {
    id: 'bel',
    name: 'Bela-Bela',
    province: 'Limpopo',
    provinceCode: 'LP',
    latitude: -24.8850,
    longitude: 28.2917,
    population: 66500,
    aliases: ['Warmbaths'],
  },

  // ============ MPUMALANGA ============
  {
    id: 'nel',
    name: 'Mbombela',
    province: 'Mpumalanga',
    provinceCode: 'MP',
    latitude: -25.4753,
    longitude: 30.9694,
    population: 110000,
    aliases: ['Nelspruit'],
  },
  {
    id: 'wit',
    name: 'Witbank',
    province: 'Mpumalanga',
    provinceCode: 'MP',
    latitude: -25.8717,
    longitude: 29.2147,
    population: 152128,
    aliases: ['eMalahleni'],
  },
  {
    id: 'sec',
    name: 'Secunda',
    province: 'Mpumalanga',
    provinceCode: 'MP',
    latitude: -26.5167,
    longitude: 29.1667,
    population: 40195,
  },
  {
    id: 'mid',
    name: 'Middelburg',
    province: 'Mpumalanga',
    provinceCode: 'MP',
    latitude: -25.7750,
    longitude: 29.4625,
    population: 154706,
    aliases: ['Steve Tshwete'],
  },
  {
    id: 'erm',
    name: 'Ermelo',
    province: 'Mpumalanga',
    provinceCode: 'MP',
    latitude: -26.5333,
    longitude: 29.9833,
    population: 65115,
  },
  {
    id: 'wbk',
    name: 'White River',
    province: 'Mpumalanga',
    provinceCode: 'MP',
    latitude: -25.3297,
    longitude: 31.0122,
    population: 15000,
  },

  // ============ NORTHERN CAPE ============
  {
    id: 'kim',
    name: 'Kimberley',
    province: 'Northern Cape',
    provinceCode: 'NC',
    latitude: -28.7323,
    longitude: 24.7623,
    population: 250000,
  },
  {
    id: 'upi',
    name: 'Upington',
    province: 'Northern Cape',
    provinceCode: 'NC',
    latitude: -28.4572,
    longitude: 21.2567,
    population: 91724,
  },
  {
    id: 'spr_nc',
    name: 'Springbok',
    province: 'Northern Cape',
    provinceCode: 'NC',
    latitude: -29.6644,
    longitude: 17.8833,
    population: 12314,
  },
  {
    id: 'dea',
    name: 'De Aar',
    province: 'Northern Cape',
    provinceCode: 'NC',
    latitude: -30.6500,
    longitude: 24.0167,
    population: 35993,
  },

  // ============ NORTH WEST ============
  {
    id: 'rsa',
    name: 'Rustenburg',
    province: 'North West',
    provinceCode: 'NW',
    latitude: -25.6745,
    longitude: 27.2420,
    population: 549575,
  },
  {
    id: 'mhk',
    name: 'Mahikeng',
    province: 'North West',
    provinceCode: 'NW',
    latitude: -25.8653,
    longitude: 25.6445,
    population: 291527,
    aliases: ['Mafikeng'],
  },
  {
    id: 'pot',
    name: 'Potchefstroom',
    province: 'North West',
    provinceCode: 'NW',
    latitude: -26.7145,
    longitude: 27.0970,
    population: 173520,
    aliases: ['Tlokwe'],
  },
  {
    id: 'kle',
    name: 'Klerksdorp',
    province: 'North West',
    provinceCode: 'NW',
    latitude: -26.8667,
    longitude: 26.6667,
    population: 181738,
  },
  {
    id: 'bri',
    name: 'Brits',
    province: 'North West',
    provinceCode: 'NW',
    latitude: -25.6297,
    longitude: 27.7842,
    population: 106927,
  },
  {
    id: 'sun',
    name: 'Sun City',
    province: 'North West',
    provinceCode: 'NW',
    latitude: -25.3347,
    longitude: 27.0928,
    population: 5000,
  },
  {
    id: 'lic',
    name: 'Lichtenburg',
    province: 'North West',
    provinceCode: 'NW',
    latitude: -26.1500,
    longitude: 26.1667,
    population: 29459,
  },
  {
    id: 'har',
    name: 'Hartbeespoort',
    province: 'North West',
    provinceCode: 'NW',
    latitude: -25.7436,
    longitude: 27.8881,
    population: 18041,
    aliases: ['Harties'],
  },
];

/**
 * Create a custom city from GPS reverse geocoding or search
 */
export function createCustomCity(
  name: string,
  province: string,
  latitude: number,
  longitude: number
): SACity {
  const cleanProvince = province.replace(' Province', '').trim();
  const provinceCode = PROVINCE_CODES[cleanProvince] || 'ZA';

  return {
    id: `custom_${latitude.toFixed(4)}_${longitude.toFixed(4)}`,
    name,
    province: cleanProvince,
    provinceCode,
    latitude,
    longitude,
    population: 0,
    isCustom: true,
  };
}

/**
 * Get cities sorted by population (largest first)
 */
export function getCitiesByPopulation(): SACity[] {
  return [...SA_CITIES].sort((a, b) => b.population - a.population);
}

/**
 * Get cities grouped by province
 */
export function getCitiesByProvince(): Record<string, SACity[]> {
  return SA_CITIES.reduce((acc, city) => {
    if (!acc[city.province]) {
      acc[city.province] = [];
    }
    acc[city.province].push(city);
    return acc;
  }, {} as Record<string, SACity[]>);
}

/**
 * Find city by ID
 */
export function getCityById(id: string): SACity | undefined {
  return SA_CITIES.find((city) => city.id === id);
}

/**
 * Find city by name (fuzzy match including aliases)
 */
export function findCityByName(name: string): SACity | null {
  const nameLower = name.toLowerCase().trim();
  
  for (const city of SA_CITIES) {
    // Exact name match
    if (city.name.toLowerCase() === nameLower) {
      return city;
    }
    
    // Check aliases
    if (city.aliases) {
      for (const alias of city.aliases) {
        if (alias.toLowerCase() === nameLower) {
          return city;
        }
      }
    }
  }
  
  // Partial match (contains)
  for (const city of SA_CITIES) {
    if (city.name.toLowerCase().includes(nameLower) || 
        nameLower.includes(city.name.toLowerCase())) {
      return city;
    }
    
    if (city.aliases) {
      for (const alias of city.aliases) {
        if (alias.toLowerCase().includes(nameLower) || 
            nameLower.includes(alias.toLowerCase())) {
          return city;
        }
      }
    }
  }
  
  return null;
}

/**
 * Find cities in a province
 */
export function getCitiesInProvince(province: string): SACity[] {
  const provinceLower = province.toLowerCase().replace(' province', '').trim();
  
  return SA_CITIES.filter(city => {
    const cityProvinceLower = city.province.toLowerCase();
    return cityProvinceLower === provinceLower || 
           cityProvinceLower.includes(provinceLower) ||
           provinceLower.includes(cityProvinceLower);
  });
}

/**
 * Extract province from location name
 * e.g., "Cape Town, Western Cape" → "Western Cape"
 */
export function extractProvinceFromLocation(locationName: string): string | null {
  const parts = locationName.split(',').map(p => p.trim());
  
  // Check each part for province match
  for (const part of parts) {
    const partLower = part.toLowerCase();
    
    // Check against province names
    for (const [fullName, code] of Object.entries(PROVINCE_CODES)) {
      if (partLower.includes(fullName.toLowerCase()) ||
          fullName.toLowerCase().includes(partLower)) {
        return fullName;
      }
    }
  }
  
  return null;
}

/**
 * Find nearest city to coordinates
 */
export function findNearestCity(
  latitude: number,
  longitude: number
): SACity | null {
  if (SA_CITIES.length === 0) return null;

  let nearestCity = SA_CITIES[0];
  let minDistance = Number.MAX_VALUE;

  for (const city of SA_CITIES) {
    const distance = calculateDistance(
      latitude,
      longitude,
      city.latitude,
      city.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  return nearestCity;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}