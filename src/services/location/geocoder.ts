// src/services/location/geocoder.ts
import { 
    SA_CITIES, 
    findCityByName, 
    getCitiesInProvince,
    type SACity 
  } from './saCities';
  
  export interface GeocodedLocation {
    latitude: number;
    longitude: number;
    confidence: 'exact' | 'city' | 'province' | 'extracted';
    matchedName: string;
  }
  
  // Province center coordinates (fallback when only province is known)
  const PROVINCE_CENTERS: Record<string, { latitude: number; longitude: number }> = {
    'Gauteng': { latitude: -26.2041, longitude: 28.0473 },
    'Western Cape': { latitude: -33.9249, longitude: 18.4241 },
    'KwaZulu-Natal': { latitude: -29.8587, longitude: 31.0218 },
    'Eastern Cape': { latitude: -33.9608, longitude: 25.6022 },
    'Free State': { latitude: -29.0852, longitude: 26.1596 },
    'Mpumalanga': { latitude: -25.4753, longitude: 30.9694 },
    'Limpopo': { latitude: -23.8962, longitude: 29.4486 },
    'North West': { latitude: -25.8560, longitude: 25.6399 },
    'Northern Cape': { latitude: -28.7282, longitude: 24.7499 },
  };
  
  // Common SA location keywords to detect SA-related content
  const SA_KEYWORDS = [
    'south africa', 'sa', 'mzansi',
    'johannesburg', 'joburg', 'jhb', 'jozi',
    'cape town', 'cpt', 'kaapstad',
    'durban', 'dbn', 'ethekwini',
    'pretoria', 'tshwane', 'pta',
    'port elizabeth', 'gqeberha',
    'bloemfontein', 'bloem',
    'east london',
    'polokwane', 'pietersburg',
    'nelspruit', 'mbombela',
    'kimberley',
    'rustenburg',
    'soweto', 'sandton', 'rosebank',
    'saps', 'anc', 'da', 'eff',
    'rand', 'zar',
    'eskom', 'loadshedding', 'load shedding',
    ...Object.keys(PROVINCE_CENTERS).map(p => p.toLowerCase()),
  ];
  
  /**
   * Check if text contains SA-related content
   */
  export function isSouthAfricanContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    return SA_KEYWORDS.some(keyword => lowerText.includes(keyword));
  }
  
  /**
   * Extract potential location names from text
   */
  export function extractLocationsFromText(text: string): string[] {
    const locations: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Check each city in our database
    for (const city of SA_CITIES) {
      if (lowerText.includes(city.name.toLowerCase())) {
        locations.push(city.name);
      }
      // Check aliases
      if (city.aliases) {
        for (const alias of city.aliases) {
          if (lowerText.includes(alias.toLowerCase())) {
            locations.push(city.name);
            break;
          }
        }
      }
    }
    
    // Check provinces
    for (const province of Object.keys(PROVINCE_CENTERS)) {
      if (lowerText.includes(province.toLowerCase())) {
        locations.push(province);
      }
    }
    
    // Remove duplicates
    return [...new Set(locations)];
  }
  
  /**
   * Geocode a location string to coordinates
   */
  export function geocodeLocation(locationText: string | null | undefined): GeocodedLocation | null {
    if (!locationText) return null;
    
    const lowerLocation = locationText.toLowerCase().trim();
    
    // 1. Try exact city match
    const city = findCityByName(locationText);
    if (city) {
      return {
        latitude: city.latitude,
        longitude: city.longitude,
        confidence: 'city',
        matchedName: city.name,
      };
    }
    
    // 2. Try to find city name within the location string
    for (const saCity of SA_CITIES) {
      if (lowerLocation.includes(saCity.name.toLowerCase())) {
        return {
          latitude: saCity.latitude,
          longitude: saCity.longitude,
          confidence: 'city',
          matchedName: saCity.name,
        };
      }
      // Check aliases
      if (saCity.aliases) {
        for (const alias of saCity.aliases) {
          if (lowerLocation.includes(alias.toLowerCase())) {
            return {
              latitude: saCity.latitude,
              longitude: saCity.longitude,
              confidence: 'city',
              matchedName: saCity.name,
            };
          }
        }
      }
    }
    
    // 3. Try province match (fallback to province center)
    for (const [province, coords] of Object.entries(PROVINCE_CENTERS)) {
      if (lowerLocation.includes(province.toLowerCase())) {
        return {
          latitude: coords.latitude,
          longitude: coords.longitude,
          confidence: 'province',
          matchedName: province,
        };
      }
    }
    
    // 4. No match found
    return null;
  }
  
  /**
   * Geocode from multiple text sources (location_name, title, description)
   */
  export function geocodeFromMultipleSources(
    locationName?: string | null,
    title?: string | null,
    description?: string | null,
    existingLat?: number | null,
    existingLng?: number | null
  ): GeocodedLocation | null {
    // 1. Use existing coordinates if available
    if (existingLat != null && existingLng != null) {
      // Try to find the closest city name for display
      let matchedName = 'Unknown';
      let minDistance = Infinity;
      
      for (const city of SA_CITIES) {
        const distance = Math.sqrt(
          Math.pow(city.latitude - existingLat, 2) + 
          Math.pow(city.longitude - existingLng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          matchedName = city.name;
        }
      }
      
      return {
        latitude: existingLat,
        longitude: existingLng,
        confidence: 'exact',
        matchedName,
      };
    }
    
    // 2. Try location_name
    const fromLocationName = geocodeLocation(locationName);
    if (fromLocationName) {
      return fromLocationName;
    }
    
    // 3. Try extracting from title
    if (title) {
      const titleLocations = extractLocationsFromText(title);
      if (titleLocations.length > 0) {
        const fromTitle = geocodeLocation(titleLocations[0]);
        if (fromTitle) {
          return { ...fromTitle, confidence: 'extracted' };
        }
      }
    }
    
    // 4. Try extracting from description
    if (description) {
      const descLocations = extractLocationsFromText(description);
      if (descLocations.length > 0) {
        const fromDesc = geocodeLocation(descLocations[0]);
        if (fromDesc) {
          return { ...fromDesc, confidence: 'extracted' };
        }
      }
    }
    
    return null;
  }