// src/services/hub/hubService.ts

import { supabase } from '@/services/supabase/config';
import { fetchWeatherData } from '@/services/weather';
import { fetchInfrastructureAlerts } from '@/services/infrastructure';
import type { WeatherData, WeatherAlert } from '@/services/weather';
import type { InfrastructureAlert, LoadsheddingStatus } from '@/services/infrastructure';
import type { FeedItem, HubFilter, Journalist } from '@/components/hub';

const TAG = '[HubService]';

export interface HubStats {
  activeIncidents: number;
  breakingCount: number;
  tipsCount: number;
  weatherAlerts: number;
  infrastructureAlerts: number;
  loadshedding: number;
}

export interface HubData {
  feedItems: FeedItem[];
  journalists: Journalist[];
  stats: HubStats;
  weather: WeatherData | null;
  loadshedding: LoadsheddingStatus | null;
  nationalAlerts: FeedItem[];
  infrastructureAlerts: InfrastructureAlert[];
}

interface FetchHubDataOptions {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  filter?: HubFilter;
  limit?: number;
}

/**
 * Calculate distance between two coordinates in km
 */
function calculateDistance(
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

/**
 * Fetch community tips from Supabase
 */
async function fetchCommunityTips(
  latitude?: number,
  longitude?: number,
  radiusKm = 50,
  limit = 50
): Promise<FeedItem[]> {
  console.log(TAG, 'Fetching community tips');

  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(TAG, 'Error fetching tips:', error);
      return [];
    }

    let tips: FeedItem[] = (data || []).map((tip: any) => ({
      id: tip.id,
      type: 'tip' as const,
      title: tip.category
        ? `${formatCategory(tip.category)} Alert`
        : 'Community Alert',
      summary: tip.description || '',
      source: 'Community',
      sourceType: 'community' as const,
      timestamp: new Date(tip.created_at),
      severity: mapTipSeverity(tip.category),
      category: tip.category || 'general',
      location: tip.latitude && tip.longitude
        ? { latitude: tip.latitude, longitude: tip.longitude }
        : undefined,
      locationName: tip.location_name || undefined,
      isVerified: false,
      isBreaking: isRecentTip(tip.created_at),
      imageUrl: undefined,
    }));

    // Filter by location if provided
    if (latitude && longitude && radiusKm) {
      tips = tips.filter((tip) => {
        if (!tip.location || typeof tip.location === 'string') return false;
        const loc = tip.location as { latitude: number; longitude: number };
        const distance = calculateDistance(
          latitude,
          longitude,
          loc.latitude,
          loc.longitude
        );
        return distance <= radiusKm;
      });
    }

    console.log(TAG, `Fetched ${tips.length} tips`);
    return tips;
  } catch (error) {
    console.error(TAG, 'Failed to fetch tips:', error);
    return [];
  }
}

/**
 * Fetch live/breaking news from Supabase
 */
async function fetchLiveIncidents(
  latitude?: number,
  longitude?: number,
  radiusKm = 50,
  limit = 30
): Promise<FeedItem[]> {
  console.log(TAG, 'Fetching live incidents');

  try {
    // Fetch critical/high severity news from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .in('severity', ['critical', 'high'])
      .gte('published_at', yesterday.toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(TAG, 'Error fetching live incidents:', error);
      return [];
    }

    let incidents: FeedItem[] = (data || []).map((item: any) => ({
      id: item.id,
      type: 'news' as const,
      title: item.title,
      summary: item.summary || '',
      source: item.source || 'News',
      sourceType: 'rss' as const,
      timestamp: new Date(item.published_at),
      severity: item.severity || 'medium',
      category: item.category || 'general',
      location: item.latitude && item.longitude
        ? { latitude: item.latitude, longitude: item.longitude }
        : undefined,
      locationName: item.location_name || undefined,
      isVerified: item.is_verified || false,
      isBreaking: item.severity === 'critical' || isRecentNews(item.published_at),
      imageUrl: item.image_url || undefined,
    }));

    // Filter by location if provided
    if (latitude && longitude && radiusKm) {
      incidents = incidents.filter((item) => {
        if (!item.location || typeof item.location === 'string') return true; // Include items without location
        const loc = item.location as { latitude: number; longitude: number };
        const distance = calculateDistance(
          latitude,
          longitude,
          loc.latitude,
          loc.longitude
        );
        return distance <= radiusKm;
      });
    }

    console.log(TAG, `Fetched ${incidents.length} live incidents`);
    return incidents;
  } catch (error) {
    console.error(TAG, 'Failed to fetch live incidents:', error);
    return [];
  }
}

/**
 * Fetch national breaking news (top 2, not location filtered)
 */
async function fetchNationalAlerts(limit = 5): Promise<FeedItem[]> {
  console.log(TAG, 'Fetching national alerts');

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('severity', 'critical')
      .gte('published_at', yesterday.toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error(TAG, 'Error fetching national alerts:', error);
      return [];
    }

    const alerts: FeedItem[] = (data || []).map((item: any) => ({
      id: item.id,
      type: 'news' as const,
      title: item.title,
      summary: item.summary || '',
      source: item.source || 'News',
      sourceType: 'rss' as const,
      timestamp: new Date(item.published_at),
      severity: 'critical' as const,
      category: item.category || 'general',
      location: item.latitude && item.longitude
        ? { latitude: item.latitude, longitude: item.longitude }
        : undefined,
      locationName: item.location_name || undefined,
      isVerified: item.is_verified || false,
      isBreaking: true,
      imageUrl: item.image_url || undefined,
    }));

    console.log(TAG, `Fetched ${alerts.length} national alerts`);
    return alerts;
  } catch (error) {
    console.error(TAG, 'Failed to fetch national alerts:', error);
    return [];
  }
}

/**
 * Convert weather alerts to feed items
 */
function weatherAlertsToFeedItems(alerts: WeatherAlert[]): FeedItem[] {
  return alerts.map((alert) => ({
    id: alert.id,
    type: 'weather' as const,
    title: alert.title,
    summary: alert.description,
    source: alert.sender,
    sourceType: 'official' as const,
    timestamp: alert.start,
    severity: alert.severity === 'extreme' ? 'critical' : 
              alert.severity === 'severe' ? 'high' : 
              alert.severity === 'moderate' ? 'medium' : 'low',
    category: 'weather',
    location: undefined,
    locationName: alert.areas.join(', ') || undefined,
    isVerified: true,
    isBreaking: alert.severity === 'extreme' || alert.severity === 'severe',
    imageUrl: undefined,
  }));
}

/**
 * Convert infrastructure alerts to feed items
 */
function infrastructureAlertsToFeedItems(alerts: InfrastructureAlert[]): FeedItem[] {
  return alerts.map((alert) => ({
    id: alert.id,
    type: 'infrastructure' as const,
    title: alert.title,
    summary: alert.description,
    source: alert.source,
    sourceType: 'official' as const,
    timestamp: alert.startTime,
    severity: alert.severity === 'critical' ? 'critical' : 
              alert.severity === 'major' ? 'high' : 
              alert.severity === 'minor' ? 'medium' : 'low',
    category: alert.type,
    location: undefined,
    locationName: alert.affectedAreas.join(', ') || undefined,
    isVerified: true,
    isBreaking: alert.severity === 'critical',
    imageUrl: undefined,
  }));
}

/**
 * Fetch mock journalists (until we have real data)
 */
function getMockJournalists(): Journalist[] {
  return [
    {
      id: 'j1',
      name: 'Karyn Maughan',
      outlet: 'News24',
      avatarUrl: undefined,
      isVerified: true,
      recentReports: 12,
      specialty: 'Crime & Courts',
    },
    {
      id: 'j2',
      name: 'Yusuf Abramjee',
      outlet: 'Independent',
      avatarUrl: undefined,
      isVerified: true,
      recentReports: 8,
      specialty: 'Crime Watch',
    },
    {
      id: 'j3',
      name: 'Alex Mitchley',
      outlet: 'News24',
      avatarUrl: undefined,
      isVerified: true,
      recentReports: 15,
      specialty: 'Breaking News',
    },
  ];
}

/**
 * Helper: Format category name
 */
function formatCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Helper: Map tip category to severity
 */
function mapTipSeverity(category?: string): 'critical' | 'high' | 'medium' | 'low' {
  if (!category) return 'medium';
  
  const cat = category.toLowerCase();
  if (cat.includes('armed') || cat.includes('shooting') || cat.includes('murder')) {
    return 'critical';
  }
  if (cat.includes('robbery') || cat.includes('assault') || cat.includes('hijack')) {
    return 'high';
  }
  if (cat.includes('theft') || cat.includes('suspicious') || cat.includes('burglary')) {
    return 'medium';
  }
  return 'low';
}

/**
 * Helper: Check if tip is recent (within 2 hours)
 */
function isRecentTip(createdAt: string): boolean {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() > twoHoursAgo;
}

/**
 * Helper: Check if news is recent (within 1 hour)
 */
function isRecentNews(publishedAt: string): boolean {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  return new Date(publishedAt).getTime() > oneHourAgo;
}

/**
 * Apply filter to feed items
 */
function applyFilter(items: FeedItem[], filter: HubFilter): FeedItem[] {
  switch (filter) {
    case 'tips':
      return items.filter((item) => item.type === 'tip');
    case 'live':
      return items.filter((item) => item.isBreaking || item.severity === 'critical');
    case 'weather':
      return items.filter((item) => item.type === 'weather' || item.category === 'weather');
    case 'infrastructure':
      return items.filter(
        (item) =>
          item.type === 'infrastructure' ||
          item.category === 'electricity' ||
          item.category === 'water' ||
          item.category === 'roads'
      );
    case 'national':
      return items.filter((item) => item.severity === 'critical' && item.isBreaking);
    case 'all':
    default:
      return items;
  }
}

/**
 * Determine default filter based on available data
 */
export function getDefaultFilter(items: FeedItem[]): HubFilter {
  const tips = items.filter((item) => item.type === 'tip');
  if (tips.length > 0) return 'tips';

  const live = items.filter((item) => item.isBreaking || item.severity === 'critical');
  if (live.length > 0) return 'live';

  return 'all';
}

/**
 * Helper to get timestamp as number for sorting
 */
function getTimestampMs(timestamp: string | Date): number {
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  return new Date(timestamp).getTime();
}

/**
 * Main function to fetch all hub data
 */
export async function fetchHubData(options: FetchHubDataOptions = {}): Promise<HubData> {
  const {
    latitude,
    longitude,
    radiusKm = 50,
    limit = 50,
  } = options;

  console.log(TAG, 'Fetching hub data', { latitude, longitude, radiusKm });

  // Fetch all data sources in parallel
  const [
    tips,
    liveIncidents,
    nationalAlerts,
    weatherResult,
    infrastructureResult,
  ] = await Promise.all([
    fetchCommunityTips(latitude, longitude, radiusKm, limit),
    fetchLiveIncidents(latitude, longitude, radiusKm, limit),
    fetchNationalAlerts(5),
    latitude && longitude
      ? fetchWeatherData(latitude, longitude).catch((err: Error) => {
          console.warn(TAG, 'Weather fetch failed:', err);
          return null;
        })
      : Promise.resolve(null),
    fetchInfrastructureAlerts().catch((err: Error) => {
      console.warn(TAG, 'Infrastructure fetch failed:', err);
      return { alerts: [], loadshedding: null };
    }),
  ]);

  // Convert weather alerts to feed items
  const weatherFeedItems = weatherResult
    ? weatherAlertsToFeedItems(weatherResult.alerts)
    : [];

  // Convert infrastructure alerts to feed items
  const infrastructureFeedItems = infrastructureAlertsToFeedItems(
    infrastructureResult.alerts
  );

  // Combine all feed items
  let allItems: FeedItem[] = [
    ...tips,
    ...liveIncidents,
    ...weatherFeedItems,
    ...infrastructureFeedItems,
  ];

  // Sort by timestamp (newest first)
  allItems.sort((a, b) => getTimestampMs(b.timestamp) - getTimestampMs(a.timestamp));

  // Remove duplicates by ID
  const seen = new Set<string>();
  allItems = allItems.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  // Calculate stats
  const stats: HubStats = {
    activeIncidents: liveIncidents.filter((i: FeedItem) => i.isBreaking).length,
    breakingCount: allItems.filter((i: FeedItem) => i.severity === 'critical').length,
    tipsCount: tips.length,
    weatherAlerts: weatherResult?.alerts.length || 0,
    infrastructureAlerts: infrastructureResult.alerts.length,
    loadshedding: infrastructureResult.loadshedding?.stage || 0,
  };

  // Get journalists (mock for now)
  const journalists = getMockJournalists();

  console.log(TAG, 'Hub data fetched', {
    totalItems: allItems.length,
    stats,
  });

  return {
    feedItems: allItems,
    journalists,
    stats,
    weather: weatherResult,
    loadshedding: infrastructureResult.loadshedding,
    nationalAlerts,
    infrastructureAlerts: infrastructureResult.alerts,
  };
}

/**
 * Subscribe to realtime updates
 */
export function subscribeToHubUpdates(
  onUpdate: (payload: any) => void
): () => void {
  console.log(TAG, 'Setting up realtime subscription');

  const channel = supabase
    .channel('hub-updates')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'tips' },
      (payload) => {
        console.log(TAG, 'New tip received');
        onUpdate({ type: 'tip', payload });
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'news' },
      (payload) => {
        console.log(TAG, 'New news received');
        onUpdate({ type: 'news', payload });
      }
    )
    .subscribe();

  return () => {
    console.log(TAG, 'Unsubscribing from realtime');
    supabase.removeChannel(channel);
  };
}