// src/services/infrastructure/index.ts

export * from './types';
export {
  // Load shedding
  fetchLoadsheddingStatus,
  fetchInfrastructureAlerts,
  
  // Area/Suburb functions (new names)
  searchSuburbs,
  saveUserArea,
  getUserArea,
  clearUserArea,
  
  // Backwards compatible names
  saveUserSuburb,
  getUserSuburb,
  clearUserSuburb,
  
  // Utilities
  parseInfrastructureFromNews,
  getInfrastructureIcon,
  getInfrastructureColor,
  clearInfrastructureCache,
  isCurrentlyLoadShedding,
  getTimeUntilNextOutage,
  
  // Types
  type SavedArea,
} from './infrastructureService';