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
    SA_CITIES,
    getCitiesByPopulation,
    getCitiesByProvince,
    getCityById,
    findNearestCity,
    createCustomCity,
    calculateDistance,
    type SACity,
  } from './saCities';
  
  export {
    searchLocations,
    debounce,
  } from './geocodingService';