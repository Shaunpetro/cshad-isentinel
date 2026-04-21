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

// Eskom API endpoints (FREE - no API key needed)
const ESKOM_API = {
  status: 'https://loadshedding.eskom.co.za/LoadShedding/GetStatus',
  suburbs: 'https://loadshedding.eskom.co.za/LoadShedding/GetSurburbData',
  schedule: 'https://loadshedding.eskom.co.za/LoadShedding/GetScheduleM',
};

// Storage key for user's suburb
const SUBURB_STORAGE_KEY = 'pshad_loadshedding_suburb';

// Cache
interface InfrastructureCache {
  alerts: InfrastructureAlert[];
  loadshedding: LoadsheddingStatus | null;
  timestamp: number;
}

let cache: InfrastructureCache | null = null;

// User's saved suburb
interface SavedSuburb {
  id: string;
  name: string;
  municipality: string;
  province: string;
}

/**
 * Search for suburbs by name
 */
export async function searchSuburbs(query: string): Promise<SavedSuburb[]> {
  if (!query || query.length < 2) return [];

  console.log(TAG, `Searching suburbs: "${query}"`);

  try {
    // Eskom's suburb search endpoint
    const response = await fetch(
      `${ESKOM_API.suburbs}?searchText=${encodeURIComponent(query)}&maxResults=20`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(TAG, 'Suburb search failed:', response.status);
      return [];
    }

    const data = await response.json();

    // Parse Eskom's response format
    // Format: { Results: [{ MunicipalityName, Name, ProvinceName, Total, Id }] }
    if (!data?.Results || !Array.isArray(data.Results)) {
      return [];
    }

    const suburbs: SavedSuburb[] = data.Results.map((item: any) => ({
      id: String(item.Id),
      name: item.Name,
      municipality: item.MunicipalityName,
      province: item.ProvinceName,
    }));

    console.log(TAG, `Found ${suburbs.length} suburbs`);
    return suburbs;
  } catch (error) {
    console.error(TAG, 'Suburb search error:', error);
    return [];
  }
}

/**
 * Save user's suburb selection
 */
export async function saveUserSuburb(suburb: SavedSuburb): Promise<void> {
  try {
    await AsyncStorage.setItem(SUBURB_STORAGE_KEY, JSON.stringify(suburb));
    console.log(TAG, `Saved suburb: ${suburb.name}`);
    // Clear cache to force refresh with new suburb
    cache = null;
  } catch (error) {
    console.error(TAG, 'Failed to save suburb:', error);
  }
}

/**
 * Get user's saved suburb
 */
export async function getUserSuburb(): Promise<SavedSuburb | null> {
  try {
    const stored = await AsyncStorage.getItem(SUBURB_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(TAG, 'Failed to get suburb:', error);
  }
  return null;
}

/**
 * Clear user's saved suburb
 */
export async function clearUserSuburb(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SUBURB_STORAGE_KEY);
    cache = null;
  } catch (error) {
    console.error(TAG, 'Failed to clear suburb:', error);
  }
}

/**
 * Fetch national load shedding stage from Eskom
 */
async function fetchNationalStage(): Promise<number> {
  try {
    const response = await fetch(ESKOM_API.status, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(TAG, 'National status fetch failed:', response.status);
      return 0;
    }

    const status = await response.json();
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
 * Fetch local schedule for a suburb
 */
async function fetchLocalSchedule(
  suburbId: string,
  stage: number
): Promise<LoadsheddingSlot[]> {
  if (stage === 0) return [];

  try {
    // Eskom schedule endpoint: GetScheduleM/{suburbId}/{stage}/{province}
    // Province can be 1-9 but we'll try without it first
    const response = await fetch(
      `${ESKOM_API.schedule}/${suburbId}/${stage}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(TAG, 'Schedule fetch failed:', response.status);
      return [];
    }

    const html = await response.text();
    
    // Parse the schedule from Eskom's HTML response
    const slots = parseEskomSchedule(html, stage);
    console.log(TAG, `Found ${slots.length} upcoming slots for suburb ${suburbId}`);
    return slots;
  } catch (error) {
    console.error(TAG, 'Schedule fetch error:', error);
    return [];
  }
}

/**
 * Parse Eskom's schedule HTML response
 * Returns upcoming load shedding slots for today and tomorrow
 */
function parseEskomSchedule(html: string, stage: number): LoadsheddingSlot[] {
  const slots: LoadsheddingSlot[] = [];
  const now = new Date();

  try {
    // Eskom returns schedule in format like:
    // "00:00 - 02:30, 08:00 - 10:30, 16:00 - 18:30"
    // or as HTML table with times

    // Extract time patterns (HH:MM - HH:MM)
    const timePattern = /(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/g;
    let match;

    while ((match = timePattern.exec(html)) !== null) {
      const [, startTime, endTime] = match;

      // Create date objects for today
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      const start = new Date(now);
      start.setHours(startHour, startMin, 0, 0);

      const end = new Date(now);
      end.setHours(endHour, endMin, 0, 0);

      // Handle overnight slots
      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }

      // Only include future slots
      if (end > now) {
        slots.push({ start, end, stage });
      }
    }

    // If no slots found for today, check if there's a "no load shedding" message
    if (slots.length === 0) {
      console.log(TAG, 'No upcoming slots found in schedule');
    }

    // Sort by start time
    slots.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Return max 5 upcoming slots
    return slots.slice(0, 5);
  } catch (error) {
    console.error(TAG, 'Schedule parse error:', error);
    return [];
  }
}

/**
 * Fetch current load shedding status (hybrid: national + local)
 */
export async function fetchLoadsheddingStatus(
  suburbId?: string
): Promise<LoadsheddingStatus> {
  console.log(TAG, 'Fetching load shedding status', { suburbId });

  // Get user's suburb if not provided
  let effectiveSuburbId = suburbId;
  let suburbName: string | undefined;

  if (!effectiveSuburbId) {
    const savedSuburb = await getUserSuburb();
    if (savedSuburb) {
      effectiveSuburbId = savedSuburb.id;
      suburbName = savedSuburb.name;
    }
  }

  // Always fetch national stage first
  const stage = await fetchNationalStage();

  // Build status object
  const status: LoadsheddingStatus = {
    stage,
    stageUpdated: new Date(),
    nextStages: [],
    source: 'Eskom',
    isNational: true,
  };

  // If we have a suburb AND there's active load shedding, fetch local schedule
  if (effectiveSuburbId && stage > 0) {
    const localSlots = await fetchLocalSchedule(effectiveSuburbId, stage);

    if (localSlots.length > 0) {
      status.localSchedule = localSlots;
      status.nextOutage = localSlots[0];
      status.suburbId = effectiveSuburbId;
      status.suburbName = suburbName;
      status.isNational = false;
      status.source = `Eskom (${suburbName || 'Local'})`;
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

  // Fetch load shedding status (with local schedule if suburb is set)
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