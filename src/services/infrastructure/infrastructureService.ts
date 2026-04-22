// src/services/infrastructure/infrastructureService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIMITS, STORAGE_KEYS } from '@/config/constants';
import type {
  InfrastructureAlert,
  InfrastructureType,
  LoadsheddingStatus,
  LoadsheddingSlot,
} from './types';

const TAG = '[InfrastructureService]';

// Eskom Calendar API (FREE - no API key needed)
// Attribution required: https://eskomcalendar.co.za
const ESKOM_CALENDAR_API = {
  base: 'https://eskom-calendar-api.shuttleapp.rs',
  listAreas: '/list_areas',
  outages: '/outages',
};

// Fallback: Direct Eskom API
const ESKOM_DIRECT_API = {
  status: 'https://loadshedding.eskom.co.za/LoadShedding/GetStatus',
};

// Storage keys
const AREA_STORAGE_KEY = 'pshad_loadshedding_area';
const AREA_LIST_CACHE_KEY = 'pshad_loadshedding_area_list';

// Timeouts
const FETCH_TIMEOUT_MS = 10000; // 10 seconds
const AREA_LIST_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Cache
interface InfrastructureCache {
  alerts: InfrastructureAlert[];
  loadshedding: LoadsheddingStatus | null;
  timestamp: number;
}

interface AreaListCache {
  areas: string[];
  timestamp: number;
}

let cache: InfrastructureCache | null = null;
let areaListCache: AreaListCache | null = null;

// User's saved area (eskom-calendar format)
export interface SavedArea {
  id: string;        // e.g., "gauteng-sandton"
  name: string;      // e.g., "Sandton"
  region: string;    // e.g., "Gauteng"
  fullName: string;  // e.g., "gauteng-sandton"
}

// Eskom Calendar outage response
interface EskomCalendarOutage {
  area_name: string;
  stage: number;
  start: string;  // ISO date string
  finsh: string;  // Note: API typo - "finsh" not "finish"
  source: string;
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Parse area name into display format
 * e.g., "gauteng-sandton" -> { region: "Gauteng", name: "Sandton" }
 */
function parseAreaName(areaName: string): { region: string; name: string } {
  const parts = areaName.split('-');
  if (parts.length >= 2) {
    const region = parts[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const name = parts.slice(1).join(' ').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return { region, name };
  }
  return { region: 'South Africa', name: areaName };
}

/**
 * Load area list cache from storage
 */
async function loadAreaListCache(): Promise<string[] | null> {
  try {
    // Check memory cache first
    if (areaListCache && Date.now() - areaListCache.timestamp < AREA_LIST_CACHE_DURATION_MS) {
      return areaListCache.areas;
    }

    // Check persistent storage
    const stored = await AsyncStorage.getItem(AREA_LIST_CACHE_KEY);
    if (stored) {
      const parsed: AreaListCache = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < AREA_LIST_CACHE_DURATION_MS) {
        areaListCache = parsed;
        return parsed.areas;
      }
    }
  } catch (error) {
    console.warn(TAG, 'Failed to load area list cache:', error);
  }
  return null;
}

/**
 * Save area list cache
 */
async function saveAreaListCache(areas: string[]): Promise<void> {
  try {
    const cacheData: AreaListCache = {
      areas,
      timestamp: Date.now(),
    };
    areaListCache = cacheData;
    await AsyncStorage.setItem(AREA_LIST_CACHE_KEY, JSON.stringify(cacheData));
    console.log(TAG, `Cached ${areas.length} areas`);
  } catch (error) {
    console.warn(TAG, 'Failed to save area list cache:', error);
  }
}

/**
 * Fetch area list from API (with caching)
 */
async function fetchAreaList(): Promise<string[]> {
  // Try cache first
  const cached = await loadAreaListCache();
  if (cached && cached.length > 0) {
    console.log(TAG, `Using cached area list (${cached.length} areas)`);
    return cached;
  }

  // Fetch from API
  try {
    console.log(TAG, 'Fetching area list from API...');
    const response = await fetchWithTimeout(
      `${ESKOM_CALENDAR_API.base}${ESKOM_CALENDAR_API.listAreas}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(TAG, 'Area list fetch failed:', response.status);
      return cached || [];
    }

    const areas: string[] = await response.json();
    
    // Save to cache
    await saveAreaListCache(areas);
    
    return areas;
  } catch (error) {
    console.error(TAG, 'Area list fetch error:', error);
    return cached || [];
  }
}

/**
 * Search for areas by name using Eskom Calendar API
 */
export async function searchSuburbs(query: string): Promise<SavedArea[]> {
  if (!query || query.length < 2) return [];

  console.log(TAG, `Searching areas: "${query}"`);

  try {
    // Get area list (cached or fresh)
    const areas = await fetchAreaList();
    
    if (areas.length === 0) {
      console.warn(TAG, 'No areas available (API unreachable and no cache)');
      return [];
    }

    // Filter areas by query
    const queryLower = query.toLowerCase();
    const filtered = areas
      .filter((area) => area.toLowerCase().includes(queryLower))
      .slice(0, 20);

    // Convert to SavedArea format
    const results: SavedArea[] = filtered.map((areaName) => {
      const { region, name } = parseAreaName(areaName);
      return {
        id: areaName,
        name,
        region,
        fullName: areaName,
      };
    });

    console.log(TAG, `Found ${results.length} areas matching "${query}"`);
    return results;
  } catch (error) {
    console.error(TAG, 'Area search error:', error);
    return [];
  }
}

/**
 * Backwards compatible function name
 */
export async function getUserSuburb(): Promise<SavedArea | null> {
  return getUserArea();
}

/**
 * Backwards compatible function name
 */
export async function saveUserSuburb(area: SavedArea): Promise<void> {
  return saveUserArea(area);
}

/**
 * Backwards compatible function name
 */
export async function clearUserSuburb(): Promise<void> {
  return clearUserArea();
}

/**
 * Save user's area selection
 */
export async function saveUserArea(area: SavedArea): Promise<void> {
  try {
    await AsyncStorage.setItem(AREA_STORAGE_KEY, JSON.stringify(area));
    console.log(TAG, `Saved area: ${area.name}`);
    // Clear cache to force refresh with new area
    cache = null;
  } catch (error) {
    console.error(TAG, 'Failed to save area:', error);
  }
}

/**
 * Get user's saved area
 */
export async function getUserArea(): Promise<SavedArea | null> {
  try {
    const stored = await AsyncStorage.getItem(AREA_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(TAG, 'Failed to get area:', error);
  }
  return null;
}

/**
 * Clear user's saved area
 */
export async function clearUserArea(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AREA_STORAGE_KEY);
    cache = null;
  } catch (error) {
    console.error(TAG, 'Failed to clear area:', error);
  }
}

/**
 * Fetch national load shedding stage from Eskom Direct API
 */
async function fetchNationalStage(): Promise<number> {
  try {
    const response = await fetchWithTimeout(
      ESKOM_DIRECT_API.status,
      {
        headers: {
          'Accept': 'application/json',
        },
      },
      5000
    );

    if (!response.ok) {
      console.warn(TAG, 'National status fetch failed:', response.status);
      return 0;
    }

    const status = await response.text();
    // Eskom returns: 1 = no load shedding, 2 = stage 1, 3 = stage 2, etc.
    const stage = Math.max(0, (parseInt(status, 10) || 1) - 1);
    console.log(TAG, `National stage: ${stage}`);
    return stage;
  } catch (error) {
    console.error(TAG, 'National status error:', error);
    return 0;
  }
}

/**
 * Fetch outages for an area from Eskom Calendar API
 */
async function fetchAreaOutages(areaId: string): Promise<LoadsheddingSlot[]> {
  try {
    const url = `${ESKOM_CALENDAR_API.base}${ESKOM_CALENDAR_API.outages}/${areaId}`;
    console.log(TAG, `Fetching outages from: ${url}`);

    const response = await fetchWithTimeout(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(TAG, 'Outages fetch failed:', response.status);
      return [];
    }

    const outages: EskomCalendarOutage[] = await response.json();
    const now = new Date();

    // Convert to LoadsheddingSlot format, filter for future/current outages
    const slots: LoadsheddingSlot[] = outages
      .map((outage) => ({
        start: new Date(outage.start),
        end: new Date(outage.finsh), // Note: API typo
        stage: outage.stage,
      }))
      .filter((slot) => slot.end > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 10);

    console.log(TAG, `Found ${slots.length} upcoming outages for ${areaId}`);
    return slots;
  } catch (error) {
    console.error(TAG, 'Outages fetch error:', error);
    return [];
  }
}

/**
 * Get the current/maximum stage from outages
 */
function getStageFromOutages(slots: LoadsheddingSlot[]): number {
  if (slots.length === 0) return 0;

  const now = new Date();
  
  // Check if there's a current outage
  const currentOutage = slots.find((slot) => slot.start <= now && slot.end >= now);
  if (currentOutage) {
    return currentOutage.stage;
  }

  // Return the stage of the next outage
  return slots[0]?.stage || 0;
}

/**
 * Fetch current load shedding status (hybrid: national + local)
 */
export async function fetchLoadsheddingStatus(
  areaId?: string
): Promise<LoadsheddingStatus> {
  console.log(TAG, 'Fetching load shedding status', { areaId });

  // Get user's area if not provided
  let effectiveAreaId = areaId;
  let areaName: string | undefined;
  let regionName: string | undefined;

  if (!effectiveAreaId) {
    const savedArea = await getUserArea();
    if (savedArea) {
      effectiveAreaId = savedArea.fullName;
      areaName = savedArea.name;
      regionName = savedArea.region;
    }
  }

  // Fetch national stage as fallback
  const nationalStage = await fetchNationalStage();

  // Build base status object
  const status: LoadsheddingStatus = {
    stage: nationalStage,
    stageUpdated: new Date(),
    nextStages: [],
    source: 'Eskom',
    isNational: true,
  };

  // If we have an area, fetch local outages from Eskom Calendar
  if (effectiveAreaId) {
    const localSlots = await fetchAreaOutages(effectiveAreaId);

    if (localSlots.length > 0) {
      const localStage = getStageFromOutages(localSlots);
      
      status.stage = localStage;
      status.localSchedule = localSlots;
      status.nextOutage = localSlots[0];
      status.suburbId = effectiveAreaId;
      status.suburbName = areaName || parseAreaName(effectiveAreaId).name;
      status.isNational = false;
      status.source = `EskomCalendar (${status.suburbName})`;
    } else {
      // No outages for this area
      status.suburbId = effectiveAreaId;
      status.suburbName = areaName || parseAreaName(effectiveAreaId).name;
      status.source = `EskomCalendar (${status.suburbName})`;
      status.isNational = false;
    }
  }

  return status;
}

/**
 * Create infrastructure alert from load shedding status
 */
function createLoadsheddingAlert(status: LoadsheddingStatus): InfrastructureAlert | null {
  if (status.stage === 0) return null;

  const severity = status.stage >= 6 ? 'critical' : status.stage >= 4 ? 'major' : 'minor';

  // Build description with local info if available
  let description = getLoadsheddingDescription(status.stage);

  if (status.nextOutage) {
    const startTime = status.nextOutage.start.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = status.nextOutage.end.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
    });
    description = `Next outage: ${startTime} - ${endTime}. ${description}`;
  }

  return {
    id: `loadshedding-${Date.now()}`,
    type: 'electricity',
    severity,
    status: 'active',
    title: `Load Shedding Stage ${status.stage}`,
    description,
    source: status.source,
    affectedAreas: status.suburbName ? [status.suburbName] : ['National'],
    startTime: status.stageUpdated,
    endTime: status.nextOutage?.end,
    updatedAt: new Date(),
    loadshedding: {
      stage: status.stage,
      schedule: status.localSchedule,
    },
  };
}

/**
 * Get human-readable load shedding description
 */
function getLoadsheddingDescription(stage: number): string {
  const descriptions: Record<number, string> = {
    1: 'Up to 1,000MW being shed. Expect 2-hour outages.',
    2: 'Up to 2,000MW being shed. Expect 2-hour outages, more frequently.',
    3: 'Up to 3,000MW being shed. Expect 2.5-hour outages.',
    4: 'Up to 4,000MW being shed. Expect 2.5-hour outages, more frequently.',
    5: 'Up to 5,000MW being shed. Expect longer and more frequent outages.',
    6: 'Up to 6,000MW being shed. Severe impact expected.',
    7: 'Up to 7,000MW being shed. Critical power shortage.',
    8: 'Up to 8,000MW being shed. Emergency conditions.',
  };

  return descriptions[stage] || `Stage ${stage} load shedding in effect.`;
}

/**
 * Parse infrastructure alerts from news items
 */
export function parseInfrastructureFromNews(newsItems: Array<{
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  locationName?: string;
  severity: string;
}>): InfrastructureAlert[] {
  const alerts: InfrastructureAlert[] = [];

  for (const item of newsItems) {
    const titleLower = item.title.toLowerCase();
    const summaryLower = item.summary.toLowerCase();
    const combined = `${titleLower} ${summaryLower}`;

    let type: InfrastructureType | null = null;

    // Detect infrastructure type
    if (combined.includes('water') && (combined.includes('outage') || combined.includes('cut') || combined.includes('supply') || combined.includes('burst') || combined.includes('maintenance'))) {
      type = 'water';
    } else if (combined.includes('road') && (combined.includes('closed') || combined.includes('closure') || combined.includes('accident') || combined.includes('blocked') || combined.includes('construction'))) {
      type = 'roads';
    } else if (combined.includes('network') || combined.includes('internet') || combined.includes('cellphone') || combined.includes('vodacom') || combined.includes('mtn') || combined.includes('telkom')) {
      type = 'telecom';
    }

    if (type) {
      alerts.push({
        id: `infra-${item.id}`,
        type,
        severity: item.severity === 'critical' ? 'critical' : item.severity === 'high' ? 'major' : 'minor',
        status: 'active',
        title: item.title,
        description: item.summary,
        source: 'News',
        affectedAreas: item.locationName ? [item.locationName] : [],
        startTime: new Date(item.publishedAt),
        updatedAt: new Date(item.publishedAt),
      });
    }
  }

  return alerts;
}

/**
 * Fetch all infrastructure alerts
 */
export async function fetchInfrastructureAlerts(
  newsItems?: Array<{
    id: string;
    title: string;
    summary: string;
    category: string;
    publishedAt: string;
    locationName?: string;
    severity: string;
  }>
): Promise<{ alerts: InfrastructureAlert[]; loadshedding: LoadsheddingStatus }> {
  console.log(TAG, 'Fetching infrastructure alerts');

  // Check cache
  if (cache && Date.now() - cache.timestamp < LIMITS.infrastructure.refreshIntervalMs) {
    console.log(TAG, 'Using cached infrastructure data');
    return {
      alerts: cache.alerts,
      loadshedding: cache.loadshedding || {
        stage: 0,
        stageUpdated: new Date(),
        nextStages: [],
        source: 'Cache',
        isNational: true,
      },
    };
  }

  // Fetch load shedding status (with local schedule if area is set)
  const loadshedding = await fetchLoadsheddingStatus();

  // Build alerts list
  const alerts: InfrastructureAlert[] = [];

  // Add load shedding alert if active
  const loadsheddingAlert = createLoadsheddingAlert(loadshedding);
  if (loadsheddingAlert) {
    alerts.push(loadsheddingAlert);
  }

  // Parse infrastructure from news
  if (newsItems) {
    const newsAlerts = parseInfrastructureFromNews(newsItems);
    alerts.push(...newsAlerts);
  }

  // Update cache
  cache = {
    alerts,
    loadshedding,
    timestamp: Date.now(),
  };

  // Persist cache
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.infrastructureCache, JSON.stringify(cache));
  } catch (err) {
    console.warn(TAG, 'Failed to persist infrastructure cache:', err);
  }

  console.log(TAG, `Found ${alerts.length} infrastructure alerts, stage ${loadshedding.stage}`);
  return { alerts, loadshedding };
}

/**
 * Get infrastructure alert icon
 */
export function getInfrastructureIcon(type: InfrastructureType): string {
  switch (type) {
    case 'electricity':
      return 'flash';
    case 'water':
      return 'water';
    case 'roads':
      return 'car';
    case 'telecom':
      return 'cellular';
    default:
      return 'construct';
  }
}

/**
 * Get infrastructure alert color
 */
export function getInfrastructureColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#D32F2F';
    case 'major':
      return '#F57C00';
    case 'minor':
      return '#FBC02D';
    default:
      return '#1976D2';
  }
}

/**
 * Clear infrastructure cache
 */
export async function clearInfrastructureCache(): Promise<void> {
  cache = null;
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.infrastructureCache);
  } catch (err) {
    console.warn(TAG, 'Failed to clear infrastructure cache:', err);
  }
}

/**
 * Check if currently in a load shedding slot
 */
export function isCurrentlyLoadShedding(status: LoadsheddingStatus): boolean {
  if (status.stage === 0 || !status.localSchedule) return false;

  const now = new Date();
  return status.localSchedule.some(
    (slot) => slot.start <= now && slot.end >= now
  );
}

/**
 * Get time until next outage
 */
export function getTimeUntilNextOutage(status: LoadsheddingStatus): string | null {
  if (!status.nextOutage) return null;

  const now = new Date();
  const diffMs = status.nextOutage.start.getTime() - now.getTime();

  if (diffMs <= 0) {
    // Currently in outage
    const endDiffMs = status.nextOutage.end.getTime() - now.getTime();
    const endMins = Math.ceil(endDiffMs / 60000);
    if (endMins <= 60) {
      return `Ends in ${endMins} min`;
    }
    const endHours = Math.floor(endMins / 60);
    return `Ends in ${endHours}h ${endMins % 60}m`;
  }

  const mins = Math.ceil(diffMs / 60000);
  if (mins <= 60) {
    return `In ${mins} min`;
  }

  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `In ${hours}h ${mins % 60}m`;
  }

  return `Tomorrow`;
}

/**
 * Pre-warm area list cache (call on app startup)
 */
export async function preloadAreaList(): Promise<void> {
  console.log(TAG, 'Pre-loading area list...');
  await fetchAreaList();
}