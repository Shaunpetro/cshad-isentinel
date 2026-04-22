// src/services/location/index.ts
export {
  requestLocationPermission,
  getCurrentLocation,
  detectNearestCity,
  detectActualLocation,
  reverseGeocodeLocation,
  saveSelectedCity,
  saveCustomCity,
  getSavedCity,
  saveRadius,
  getSavedRadius,
  initializeLocation,
  getAllCities,
  getPopularCities,
  DEFAULT_CITY,
  DEFAULT_RADIUS,
  DEFAULT_SCOPE,
  type NewsScope,
  type LocationState,
} from './locationService';

export {
  // Data
  SA_CITIES,
  SA_LOCATIONS,
  METRO_QUICK_ACCESS,
  PROVINCE_CODES,
  
  // Functions
  findCityByName,
  findNearestCity,
  getCitiesInProvince,
  getPopularCities as getCitiesByPopulation,
  getCitiesInProvince as getCitiesByProvince,
  createCustomCity,
  extractProvinceFromLocation,
  getAllCities as getCityById, // Will fix below
  
  // New location functions
  findLocation,
  searchLocations as searchSALocations,
  getByProvince,
  nearestLocation,
  
  // Types
  type SACity,
  type SALocation,
  type LocationType,
  type Province,
} from './saCities';

export {
  searchLocations,
  debounce,
} from './geocodingService';

// Re-export calculateDistance helper
export { calculateDistance } from './saCities';