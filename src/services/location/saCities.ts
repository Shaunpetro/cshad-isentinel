// src/services/location/saCities.ts
/**
 * South African Locations Data
 *
 * Organised by tier:
 *   1. The 8 Metropolitan Municipalities (metros)
 *   2. Provincial capitals that are NOT metros
 *   3. Major regional cities & towns (one or two per province)
 *
 * Aliases follow real local usage: official names, Zulu/Xhosa/Sotho/Afrikaans
 * alternatives, well-known suburbs, townships, and informal place references.
 *
 * Coordinates represent the urban/civic centre of each location.
 * All verified against OpenStreetMap + Stats SA 2022 census boundaries.
 */

export type LocationType =
  | 'metro'               // One of SA's 8 metropolitan municipalities
  | 'provincial_capital'  // Province seat that is not a metro
  | 'regional_city';      // Major secondary city or town

export type Province =
  | 'Gauteng'
  | 'Western Cape'
  | 'KwaZulu-Natal'
  | 'Eastern Cape'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'Free State'
  | 'North West'
  | 'Northern Cape';

export interface SALocation {
  key: string;
  /** Short label for UI buttons / chips */
  label: string;
  /** Official full name */
  fullName: string;
  /** Alternative/official name (e.g. the metro name vs the main city name) */
  altName?: string;
  province: Province;
  type: LocationType;
  /**
   * Search aliases: local nicknames, Afrikaans/Zulu/Xhosa names,
   * major suburbs & townships that people commonly search by.
   * Keep lowercase for easy case-insensitive matching.
   */
  aliases: string[];
  latitude: number;
  longitude: number;
}

// =============================================================================
// BACKWARDS COMPATIBILITY — SACity interface for existing code
// =============================================================================

export interface SACity {
  id: string;
  name: string;
  province: string;
  provinceCode: string;
  latitude: number;
  longitude: number;
  population: number;
  aliases?: string[];
  isCustom?: boolean;
}

// Province code mapping
export const PROVINCE_CODES: Record<string, string> = {
  'Gauteng': 'GP',
  'Western Cape': 'WC',
  'KwaZulu-Natal': 'KZN',
  'Eastern Cape': 'EC',
  'Limpopo': 'LP',
  'Mpumalanga': 'MP',
  'Free State': 'FS',
  'North West': 'NW',
  'Northern Cape': 'NC',
};

// Population estimates (for sorting)
const POPULATION_ESTIMATES: Record<string, number> = {
  johannesburg: 5635000,
  capeTown: 4618000,
  ethekwini: 3900000,
  ekurhuleni: 3780000,
  tshwane: 3275000,
  nelsonMandelaBay: 1263000,
  buffaloCity: 834000,
  mangaung: 788000,
  pietermaritzburg: 751000,
  polokwane: 628000,
  mbombela: 589000,
  rustenburg: 550000,
  kimberley: 280000,
  mahikeng: 291000,
  eMalahleni: 455000,
  richardsBay: 252000,
  newcastle: 389000,
  stellenbosch: 173000,
  george: 209000,
  welkom: 432000,
  tzaneen: 117000,
  mokopane: 103000,
  secunda: 188000,
  klerksdorp: 360000,
  upington: 96000,
  springbok: 15000,
  makhanda: 67000,
  komani: 206000,
  worcester: 166000,
};

// =============================================================================
// TIER 1 — The 8 Metropolitan Municipalities
// =============================================================================

const METROS: SALocation[] = [
  // ── Gauteng ─────────────────────────────────────────────────────────────────
  {
    key: 'johannesburg',
    label: 'JHB',
    fullName: 'Johannesburg',
    altName: 'City of Johannesburg',
    province: 'Gauteng',
    type: 'metro',
    aliases: [
      // Official & informal city names
      'joburg', 'jozi', 'jhb', 'egoli', 'e\'goli', 'city of gold',
      // Formal & inner-city areas
      'braamfontein', 'maboneng', 'newtown', 'marshalltown', 'parktown',
      'hillbrow', 'berea', 'yeoville', 'melville', 'westdene',
      // Northern suburbs
      'sandton', 'randburg', 'roodepoort', 'midrand', 'fourways',
      'rosebank', 'hyde park', 'morningside', 'sunninghill',
      'rivonia', 'paulshof', 'lonehill', 'douglasdale', 'northriding',
      'northgate', 'cresta', 'randpark ridge', 'florida', 'strubensvalley',
      'weltevreden park', 'honeydew', 'diepsloot',
      // Southern suburbs & townships
      'soweto', 'lenasia', 'ennerdale', 'eldorado park', 'naturena',
      'devland', 'thokoza', 'palmridge',
      // Eastern areas
      'alexandra', 'alexandra township', 'alex', 'orange grove', 'edenvale',
      // West / Roodepoort
      'dobsonville', 'meadowlands', 'white city', 'jabulani',
    ],
    latitude: -26.2041,
    longitude: 28.0473,
  },

  {
    key: 'tshwane',
    label: 'PTA',
    fullName: 'Pretoria',
    altName: 'City of Tshwane',
    province: 'Gauteng',
    type: 'metro',
    aliases: [
      // Official & informal
      'tshwane', 'pta', 'pretoria', 'jacaranda city', 'administration capital',
      // Suburbs north & east
      'centurion', 'midstream', 'midstream estate', 'irene',
      'lynnwood', 'menlyn', 'brooklyn', 'nieuw muckleneuk', 'waterkloof',
      'hatfield', 'arcadia', 'sunnyside', 'muckleneuk', 'groenkloof',
      'faerie glen', 'garsfontein', 'moreleta park', 'silver lakes',
      'equestria', 'olympus', 'day-break', 'montana',
      // Northern suburbs & townships
      'akasia', 'pretoria north', 'pretoria-north',
      'soshanguve', 'mabopane', 'ga-rankuwa', 'temba',
      // Eastern townships
      'mamelodi', 'silverton', 'nellmapius', 'kwamhlanga',
      // Western
      'atteridgeville', 'laudium', 'moot', 'gezina',
    ],
    latitude: -25.7479,
    longitude: 28.2293,
  },

  {
    key: 'ekurhuleni',
    label: 'EKU',
    fullName: 'Ekurhuleni',
    altName: 'East Rand',
    province: 'Gauteng',
    type: 'metro',
    aliases: [
      // Metro name & informal
      'east rand', 'eastrand', 'ekurhuleni metro',
      // Towns within the metro
      'germiston', 'boksburg', 'benoni', 'brakpan', 'springs',
      'kempton park', 'edenvale', 'alberton', 'nigel', 'heidelberg',
      'vosloorus', 'tembisa', 'katlehong', 'thokoza', 'kwatsaduza',
      'daveyton', 'dawn park', 'duduza',
      'bedfordview', 'eastgate', 'parkrand', 'sunward park',
      'norkem park', 'birchleigh', 'glen marais',
      'or tambo', 'ortambo', 'johannesburg airport',
    ],
    latitude: -26.3219,
    longitude: 28.4100,
  },

  // ── Western Cape ─────────────────────────────────────────────────────────────
  {
    key: 'capeTown',
    label: 'CPT',
    fullName: 'Cape Town',
    altName: 'City of Cape Town',
    province: 'Western Cape',
    type: 'metro',
    aliases: [
      // Official & informal
      'kaapstad', 'ikapa', 'i-kapa', 'the cape', 'mother city', 'cpt',
      // CBD & inner city
      'city bowl', 'de waterkant', 'green point', 'sea point',
      'mouille point', 'fresnaye', 'signal hill',
      // Southern suburbs
      'woodstock', 'salt river', 'observatory', 'mowbray', 'rondebosch',
      'rosebank wc', 'claremont', 'kenilworth', 'wynberg', 'plumstead',
      'tokai', 'constantia', 'hout bay',
      // Northern suburbs
      'bellville', 'parow', 'goodwood', 'durbanville', 'kraaifontein',
      'brackenfell', 'kuils river', 'blue downs', 'eerste river',
      'macassar', 'strand', 'gordons bay', 'somerset west',
      // Cape flats townships
      'mitchells plain', 'khayelitsha', 'gugulethu', 'langa',
      'athlone', 'manenberg', 'hanover park', 'bonteheuwel',
      'delft', 'wallacedene', 'bloekombos',
      // Atlantic seaboard & peninsula
      'camps bay', 'clifton', 'bantry bay', 'bakoven',
      'llandudno', 'noordhoek', 'kommetjie', 'simon\'s town', 'fish hoek',
      'muizenberg',
      // North / blouberg
      'blouberg', 'milnerton', 'tableview', 'parklands', 'sunningdale',
      'big bay', 'melkbosstrand',
    ],
    latitude: -33.9249,
    longitude: 18.4241,
  },

  // ── KwaZulu-Natal ────────────────────────────────────────────────────────────
  {
    key: 'ethekwini',
    label: 'DBN',
    fullName: 'Durban',
    altName: 'eThekwini',
    province: 'KwaZulu-Natal',
    type: 'metro',
    aliases: [
      // Official & informal
      'ethekwini', 'e\'thekwini', 'dbn', 'the bay', 'durban city',
      // Northern beaches & suburbs
      'umhlanga', 'umhlanga rocks', 'la lucia', 'la mercy',
      'umdloti', 'tongaat', 'ballito',
      // Western suburbs
      'pinetown', 'new germany', 'westville', 'hillcrest',
      'gillitts', 'kloof', 'cowies hill',
      // Southern areas
      'amanzimtoti', 'isipingo', 'prospecton', 'bluff',
      // CBD & immediate surrounds
      'berea dbn', 'overport', 'glenwood', 'umbilo',
      // Townships
      'umlazi', 'chatsworth', 'phoenix', 'inanda', 'ntuzuma',
      'kwamashu', 'clermont', 'mpumalanga kzn',
    ],
    latitude: -29.8587,
    longitude: 31.0218,
  },

  // ── Eastern Cape ─────────────────────────────────────────────────────────────
  {
    key: 'nelsonMandelaBay',
    label: 'GQB',
    fullName: 'Gqeberha',
    altName: 'Nelson Mandela Bay',
    province: 'Eastern Cape',
    type: 'metro',
    aliases: [
      // Former name still widely used
      'port elizabeth', 'pe', 'port elizabeth eastern cape',
      // Current official name
      'gqeberha', 'nelson mandela bay', 'nmb',
      // Suburbs & townships
      'uitenhage', 'despatch', 'kariega',
      'kwazakhele', 'new brighton', 'motherwell', 'zwide',
      'gelvandale', 'helenvale', 'bethelsdorp',
      'walmer', 'summerstrand', 'humewood', 'mill park',
      'newton park', 'charlo', 'greenacres',
    ],
    latitude: -33.9608,
    longitude: 25.6022,
  },

  {
    key: 'buffaloCity',
    label: 'ELN',
    fullName: 'East London',
    altName: 'Buffalo City',
    province: 'Eastern Cape',
    type: 'metro',
    aliases: [
      // City names
      'east london', 'el', 'buffalo city', 'monti',
      // Surrounding municipalities now in metro
      'king william\'s town', 'kwilliamstown', 'king williamstown',
      'mdantsane', 'bhisho', 'bisho', 'zwelitsha',
      'cambridge', 'beacon bay', 'nahoon', 'gonubie',
      'berea el', 'vincent', 'selborne',
    ],
    latitude: -32.9975,
    longitude: 27.9116,
  },

  // ── Free State ───────────────────────────────────────────────────────────────
  {
    key: 'mangaung',
    label: 'BFN',
    fullName: 'Bloemfontein',
    altName: 'Mangaung',
    province: 'Free State',
    type: 'metro',
    aliases: [
      // City names
      'bloemfontein', 'bloem', 'mangaung', 'judicial capital',
      'city of roses',
      // Suburbs & townships
      'botshabelo', 'thaba nchu', 'selosesha',
      'langenhoven park', 'navalsig', 'fauna', 'fichardt park',
      'westdene bloemfontein', 'universitas',
      'batho', 'bochabela', 'phahameng', 'rocklands',
    ],
    latitude: -29.1178,
    longitude: 26.2140,
  },
];

// =============================================================================
// TIER 2 — Provincial Capitals (not metros)
// =============================================================================

const PROVINCIAL_CAPITALS: SALocation[] = [
  {
    key: 'pietermaritzburg',
    label: 'PMB',
    fullName: 'Pietermaritzburg',
    altName: 'Msunduzi',
    province: 'KwaZulu-Natal',
    type: 'provincial_capital',
    aliases: [
      'pmb', 'msunduzi', 'maritzburg', 'sleepy hollow',
      'kzn capital', 'kwazulu-natal capital',
      'plessislaer', 'sobantu', 'edendale',
      'northdale', 'town hill',
    ],
    latitude: -29.6006,
    longitude: 30.3794,
  },

  {
    key: 'polokwane',
    label: 'PLK',
    fullName: 'Polokwane',
    province: 'Limpopo',
    type: 'provincial_capital',
    aliases: [
      // Former name still widely used
      'pietersburg', 'lim capital', 'limpopo capital',
      'polokwane city',
      'seshego', 'flora park', 'ivan\'s corner', 'bendor',
      'ladanna', 'superbia',
    ],
    latitude: -23.9045,
    longitude: 29.4688,
  },

  {
    key: 'mbombela',
    label: 'MBB',
    fullName: 'Mbombela',
    altName: 'Nelspruit',
    province: 'Mpumalanga',
    type: 'provincial_capital',
    aliases: [
      'nelspruit', 'nelspruit city', 'mpumalanga capital',
      'mbombela city',
      'white river', 'stonehenge', 'west acres', 'riverside park',
      'kanyamazane',
    ],
    latitude: -25.4664,
    longitude: 30.9720,
  },

  {
    key: 'kimberley',
    label: 'KIM',
    fullName: 'Kimberley',
    altName: 'Sol Plaatje',
    province: 'Northern Cape',
    type: 'provincial_capital',
    aliases: [
      'diamond city', 'sol plaatje', 'northern cape capital',
      'galeshewe', 'roodepan', 'greenpoint kimberley',
      'herlear',
    ],
    latitude: -28.7323,
    longitude: 24.7623,
  },

  {
    key: 'mahikeng',
    label: 'MHK',
    fullName: 'Mahikeng',
    province: 'North West',
    type: 'provincial_capital',
    aliases: [
      // Former official name still very commonly used
      'mafikeng', 'mmabatho', 'north west capital',
      'ngaka modiri molema',
    ],
    latitude: -25.8565,
    longitude: 25.6445,
  },
];

// =============================================================================
// TIER 3 — Major Regional Cities & Towns
// =============================================================================

const REGIONAL_CITIES: SALocation[] = [
  // ── Western Cape ─────────────────────────────────────────────────────────────
  {
    key: 'stellenbosch',
    label: 'STB',
    fullName: 'Stellenbosch',
    province: 'Western Cape',
    type: 'regional_city',
    aliases: [
      'stellenbosch town', 'eikestad', 'university town',
      'kayamandi', 'cloetesville', 'ida\'s valley',
      'franschhoek',
    ],
    latitude: -33.9321,
    longitude: 18.8602,
  },

  {
    key: 'george',
    label: 'GRJ',
    fullName: 'George',
    province: 'Western Cape',
    type: 'regional_city',
    aliases: [
      'george wc', 'garden route capital', 'garden route',
      'wilderness', 'heatherlands', 'pacaltsdorp',
      'thembalethu',
    ],
    latitude: -33.9646,
    longitude: 22.4617,
  },

  {
    key: 'worcester',
    label: 'WRC',
    fullName: 'Worcester',
    province: 'Western Cape',
    type: 'regional_city',
    aliases: [
      'worcester wc', 'hex valley', 'breede valley',
      'rawsonville', 'touws river',
    ],
    latitude: -33.6479,
    longitude: 19.4447,
  },

  // ── KwaZulu-Natal ────────────────────────────────────────────────────────────
  {
    key: 'richardsBay',
    label: 'RCB',
    fullName: 'Richards Bay',
    altName: 'uMhlathuze',
    province: 'KwaZulu-Natal',
    type: 'regional_city',
    aliases: [
      'umhlathuze', 'mhlathuze', 'empangeni',
      'arboretum', 'meerensee', 'esikhaleni',
    ],
    latitude: -28.7832,
    longitude: 32.0594,
  },

  {
    key: 'newcastle',
    label: 'NCS',
    fullName: 'Newcastle',
    province: 'KwaZulu-Natal',
    type: 'regional_city',
    aliases: [
      'newcastle kzn', 'amajuba', 'majuba',
      'osizweni', 'madadeni',
    ],
    latitude: -27.7587,
    longitude: 29.9322,
  },

  // ── Eastern Cape ─────────────────────────────────────────────────────────────
  {
    key: 'makhanda',
    label: 'MKH',
    fullName: 'Makhanda',
    province: 'Eastern Cape',
    type: 'regional_city',
    aliases: [
      'grahamstown', 'grahamstad', 'rini',
      'rhodes university town', 'makana',
    ],
    latitude: -33.3042,
    longitude: 26.5328,
  },

  {
    key: 'komani',
    label: 'QTN',
    fullName: 'Komani',
    province: 'Eastern Cape',
    type: 'regional_city',
    aliases: [
      'queenstown', 'enoch mgijima', 'whittlesea',
      'sada',
    ],
    latitude: -31.8975,
    longitude: 26.8754,
  },

  // ── Free State ───────────────────────────────────────────────────────────────
  {
    key: 'welkom',
    label: 'WLK',
    fullName: 'Welkom',
    altName: 'Matjhabeng',
    province: 'Free State',
    type: 'regional_city',
    aliases: [
      'matjhabeng', 'gold fields', 'goldfields free state',
      'virginia fs', 'odendaalsrus', 'allanridge',
      'thabong',
    ],
    latitude: -27.9767,
    longitude: 26.7436,
  },

  // ── Limpopo ──────────────────────────────────────────────────────────────────
  {
    key: 'tzaneen',
    label: 'TZN',
    fullName: 'Tzaneen',
    province: 'Limpopo',
    type: 'regional_city',
    aliases: [
      'greater tzaneen', 'tzaneen town', 'letsitele',
      'nkowankowa', 'haenertsburg',
    ],
    latitude: -23.8328,
    longitude: 30.1632,
  },

  {
    key: 'mokopane',
    label: 'MKP',
    fullName: 'Mokopane',
    province: 'Limpopo',
    type: 'regional_city',
    aliases: [
      'potgietersrus', 'mogalakwena',
      'mahwelereng',
    ],
    latitude: -24.1944,
    longitude: 28.9969,
  },

  // ── Mpumalanga ───────────────────────────────────────────────────────────────
  {
    key: 'eMalahleni',
    label: 'WTB',
    fullName: 'eMalahleni',
    province: 'Mpumalanga',
    type: 'regional_city',
    aliases: [
      'witbank', 'emalahleni city',
      'del judor', 'vosman',
    ],
    latitude: -25.8826,
    longitude: 29.2401,
  },

  {
    key: 'secunda',
    label: 'SEC',
    fullName: 'Secunda',
    altName: 'Govan Mbeki',
    province: 'Mpumalanga',
    type: 'regional_city',
    aliases: [
      'govan mbeki', 'sasol city', 'highveld',
      'evander', 'lebohang',
    ],
    latitude: -26.5241,
    longitude: 29.1681,
  },

  // ── North West ───────────────────────────────────────────────────────────────
  {
    key: 'rustenburg',
    label: 'RST',
    fullName: 'Rustenburg',
    province: 'North West',
    type: 'regional_city',
    aliases: [
      'rustenburg city', 'platinum city', 'bojanala',
      'tlhabane', 'phokeng', 'sun city area',
      'waterfall mall area',
    ],
    latitude: -25.6676,
    longitude: 27.2427,
  },

  {
    key: 'klerksdorp',
    label: 'KLD',
    fullName: 'Klerksdorp',
    altName: 'JB Marks',
    province: 'North West',
    type: 'regional_city',
    aliases: [
      'jb marks', 'stilfontein', 'orkney', 'hartbeespoort',
      'kanana', 'khuma',
    ],
    latitude: -26.8672,
    longitude: 26.6683,
  },

  // North West - Additional cities
  {
    key: 'brits',
    label: 'BRT',
    fullName: 'Brits',
    altName: 'Madibeng',
    province: 'North West',
    type: 'regional_city',
    aliases: [
      'madibeng', 'brits north west', 'brits nw',
      'hartbeespoort', 'hartbeespoort dam', 'harties',
      'letlhabile', 'oukasie', 'mothutlung',
    ],
    latitude: -25.6350,
    longitude: 27.7800,
  },

  // ── Northern Cape ─────────────────────────────────────────────────────────────
  {
    key: 'upington',
    label: 'UTN',
    fullName: 'Upington',
    altName: 'Khara Hais',
    province: 'Northern Cape',
    type: 'regional_city',
    aliases: [
      'khara hais', 'kalahari gateway',
      'louisvale', 'olyvenhoutsdrift',
    ],
    latitude: -28.4478,
    longitude: 21.2561,
  },

  {
    key: 'springbok',
    label: 'SPB',
    fullName: 'Springbok',
    altName: 'Nama Khoi',
    province: 'Northern Cape',
    type: 'regional_city',
    aliases: [
      'nama khoi', 'namaqualand', 'okiep', 'nababeep',
    ],
    latitude: -29.6631,
    longitude: 17.8864,
  },
];

// =============================================================================
// COMBINED EXPORTS
// =============================================================================

/**
 * All SA locations in a single array, ordered by tier and population weight.
 */
export const SA_LOCATIONS: SALocation[] = [
  ...METROS,
  ...PROVINCIAL_CAPITALS,
  ...REGIONAL_CITIES,
];

/**
 * Subset limited to the 8 metros for quick-access UI.
 */
export const METRO_QUICK_ACCESS = SA_LOCATIONS.filter(
  (loc) => loc.type === 'metro'
);

// =============================================================================
// BACKWARDS COMPATIBILITY — SA_CITIES array (old format)
// =============================================================================

/**
 * Convert SALocation to SACity for backwards compatibility
 */
function locationToCity(loc: SALocation): SACity {
  return {
    id: loc.key,
    name: loc.fullName,
    province: loc.province,
    provinceCode: PROVINCE_CODES[loc.province] || '',
    latitude: loc.latitude,
    longitude: loc.longitude,
    population: POPULATION_ESTIMATES[loc.key] || 100000,
    aliases: loc.aliases,
  };
}

/**
 * Legacy SA_CITIES array for backwards compatibility
 */
export const SA_CITIES: SACity[] = SA_LOCATIONS.map(locationToCity);

// =============================================================================
// LOOKUP HELPERS
// =============================================================================

/**
 * Find a location by key, full name, altName, or any alias.
 * Case-insensitive. Returns undefined if nothing matches.
 */
export function findLocation(query: string): SALocation | undefined {
  const q = query.trim().toLowerCase();
  return SA_LOCATIONS.find(
    (loc) =>
      loc.key.toLowerCase() === q ||
      loc.fullName.toLowerCase() === q ||
      loc.altName?.toLowerCase() === q ||
      loc.label.toLowerCase() === q ||
      loc.aliases.some(alias => alias.toLowerCase() === q || alias.toLowerCase().includes(q))
  );
}

/**
 * Search across all name fields and aliases.
 * Returns all locations that partially match the query.
 */
export function searchLocations(query: string): SALocation[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return SA_LOCATIONS.filter(
    (loc) =>
      loc.key.toLowerCase().includes(q) ||
      loc.fullName.toLowerCase().includes(q) ||
      loc.altName?.toLowerCase().includes(q) ||
      loc.label.toLowerCase().includes(q) ||
      loc.aliases.some((alias) => alias.toLowerCase().includes(q))
  );
}

/**
 * Get all locations within a given province.
 */
export function getByProvince(province: Province): SALocation[] {
  return SA_LOCATIONS.filter((loc) => loc.province === province);
}

/**
 * Find the nearest location given GPS coordinates.
 */
export function nearestLocation(lat: number, lon: number): SALocation {
  return SA_LOCATIONS.reduce((best, loc) => {
    const dLat = loc.latitude - lat;
    const dLon = loc.longitude - lon;
    const dist = dLat * dLat + dLon * dLon;
    const bestDLat = best.latitude - lat;
    const bestDLon = best.longitude - lon;
    const bestDist = bestDLat * bestDLat + bestDLon * bestDLon;
    return dist < bestDist ? loc : best;
  });
}

// =============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// =============================================================================

/**
 * Find city by name (backwards compatible)
 */
export function findCityByName(name: string): SACity | null {
  const location = findLocation(name);
  return location ? locationToCity(location) : null;
}

/**
 * Find nearest city (backwards compatible)
 */
export function findNearestCity(lat: number, lon: number): SACity {
  const location = nearestLocation(lat, lon);
  return locationToCity(location);
}

/**
 * Get cities in province (backwards compatible)
 */
export function getCitiesInProvince(province: string): SACity[] {
  return SA_LOCATIONS
    .filter((loc) => loc.province === province)
    .map(locationToCity);
}

/**
 * Extract province from location name string
 */
export function extractProvinceFromLocation(locationName: string): string | null {
  const nameLower = locationName.toLowerCase();

  for (const loc of SA_LOCATIONS) {
    if (
      nameLower.includes(loc.fullName.toLowerCase()) ||
      nameLower.includes(loc.altName?.toLowerCase() || '') ||
      loc.aliases.some(alias => nameLower.includes(alias.toLowerCase()))
    ) {
      return loc.province;
    }
  }

  // Check province names directly
  for (const [province, code] of Object.entries(PROVINCE_CODES)) {
    if (nameLower.includes(province.toLowerCase()) || nameLower.includes(code.toLowerCase())) {
      return province;
    }
  }

  return null;
}

/**
 * Create a custom city entry for GPS-detected locations
 */
export function createCustomCity(
  name: string,
  province: string,
  latitude: number,
  longitude: number
): SACity {
  return {
    id: `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    name,
    province,
    provinceCode: PROVINCE_CODES[province] || '',
    latitude,
    longitude,
    population: 10000,
    isCustom: true,
  };
}

/**
 * Get all cities (backwards compatible)
 */
export function getAllCities(): SACity[] {
  return SA_CITIES;
}

/**
 * Get popular cities by population (backwards compatible)
 */
export function getPopularCities(limit: number = 10): SACity[] {
  return [...SA_CITIES]
    .sort((a, b) => b.population - a.population)
    .slice(0, limit);
}

// =============================================================================
// ADDITIONAL BACKWARDS COMPATIBILITY FUNCTIONS
// =============================================================================

/**
 * Get city by ID (backwards compatible)
 */
export function getCityById(id: string): SACity | null {
  const city = SA_CITIES.find(c => c.id === id);
  return city || null;
}

/**
 * Get cities by population (backwards compatible alias)
 */
export function getCitiesByPopulation(limit: number = 10): SACity[] {
  return getPopularCities(limit);
}

/**
 * Get cities by province (backwards compatible alias)
 */
export function getCitiesByProvince(province: string): SACity[] {
  return getCitiesInProvince(province);
}

/**
 * Calculate distance between two coordinates in km (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}