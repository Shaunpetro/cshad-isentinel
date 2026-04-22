// src/services/map/mapService.ts
import { supabase } from '../supabase/config';
import {
  geocodeFromMultipleSources,
} from '../location/geocoder';
import { APP } from '@/config/constants';

export interface MapMarker {
  id: string;
  type: 'news' | 'tip';
  title: string;
  description?: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  confidence: 'exact' | 'city' | 'province' | 'extracted' | 'approximate';
  matchedLocation: string;
  timestamp: string;
  source?: string;
  status?: string;
}

export interface MapDataResult {
  markers: MapMarker[];
  newsCount: number;
  tipsCount: number;
  error: string | null;
}

/**
 * Get a fallback location for items without coordinates
 * Adds slight randomization to prevent markers stacking
 */
function getFallbackLocation(
  defaultLat: number = APP.defaultRegion.latitude,
  defaultLng: number = APP.defaultRegion.longitude
): { latitude: number; longitude: number } {
  // Add small random offset (within ~5km) to prevent exact stacking
  const latOffset = (Math.random() - 0.5) * 0.05;
  const lngOffset = (Math.random() - 0.5) * 0.05;

  return {
    latitude: defaultLat + latOffset,
    longitude: defaultLng + lngOffset,
  };
}

/**
 * Fetch all mappable data (news + tips)
 */
export async function fetchMapData(options?: {
  limit?: number;
  categories?: string[];
  includeNews?: boolean;
  includeTips?: boolean;
  userLatitude?: number;
  userLongitude?: number;
}): Promise<MapDataResult> {
  const {
    limit = 100,
    categories,
    includeNews = true,
    includeTips = true,
    userLatitude,
    userLongitude,
  } = options || {};

  const markers: MapMarker[] = [];
  let newsCount = 0;
  let tipsCount = 0;

  // Use user location as fallback center, or SA center
  const fallbackLat = userLatitude || APP.defaultRegion.latitude;
  const fallbackLng = userLongitude || APP.defaultRegion.longitude;

  try {
    // Fetch news articles
    if (includeNews) {
      let newsQuery = supabase
        .from('news')
        .select('id, title, summary, location_name, latitude, longitude, category, severity, published_at, source')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (categories && categories.length > 0) {
        newsQuery = newsQuery.in('category', categories);
      }

      const { data: newsData, error: newsError } = await newsQuery;

      if (newsError) {
        console.error('[MapService] News fetch error:', newsError.message);
      } else if (newsData) {
        for (const article of newsData) {
          const location = geocodeFromMultipleSources(
            article.location_name,
            article.title,
            article.summary,
            article.latitude,
            article.longitude
          );

          if (location) {
            markers.push({
              id: article.id,
              type: 'news',
              title: article.title,
              description: article.summary || undefined,
              category: article.category,
              severity: article.severity || 'low',
              latitude: location.latitude,
              longitude: location.longitude,
              confidence: location.confidence,
              matchedLocation: location.matchedName,
              timestamp: article.published_at,
              source: article.source,
            });
            newsCount++;
          }
        }
      }
    }

    // Fetch tips (NOTE: tips table does NOT have location_name column)
    if (includeTips) {
      let tipsQuery = supabase
        .from('tips')
        .select('id, description, latitude, longitude, category, severity, status, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (categories && categories.length > 0) {
        tipsQuery = tipsQuery.in('category', categories);
      }

      const { data: tipsData, error: tipsError } = await tipsQuery;

      if (tipsError) {
        console.error('[MapService] Tips fetch error:', tipsError.message);
      } else if (tipsData) {
        for (const tip of tipsData) {
          // Try to get location from coordinates or description text
          const location = geocodeFromMultipleSources(
            null, // tips don't have location_name
            null,
            tip.description,
            tip.latitude,
            tip.longitude
          );

          if (location) {
            // We found a valid location
            markers.push({
              id: tip.id,
              type: 'tip',
              title: 'Community Tip',
              description: tip.description,
              category: tip.category,
              severity: tip.severity || 'low',
              latitude: location.latitude,
              longitude: location.longitude,
              confidence: location.confidence,
              matchedLocation: location.matchedName,
              timestamp: tip.created_at,
              status: tip.status,
            });
            tipsCount++;
          } else {
            // NO location found - use fallback so tip still appears on map
            // This ensures tips are NEVER lost, just shown at approximate location
            const fallback = getFallbackLocation(fallbackLat, fallbackLng);

            console.log(`[MapService] Tip ${tip.id} has no location, using fallback`);

            markers.push({
              id: tip.id,
              type: 'tip',
              title: 'Community Tip',
              description: tip.description,
              category: tip.category,
              severity: tip.severity || 'low',
              latitude: fallback.latitude,
              longitude: fallback.longitude,
              confidence: 'approximate',
              matchedLocation: 'Location not specified',
              timestamp: tip.created_at,
              status: tip.status,
            });
            tipsCount++;
          }
        }
      }
    }

    console.log(`[MapService] Loaded ${newsCount} news + ${tipsCount} tips = ${markers.length} markers`);

    return {
      markers,
      newsCount,
      tipsCount,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[MapService] Exception:', message);
    return {
      markers: [],
      newsCount: 0,
      tipsCount: 0,
      error: message,
    };
  }
}

/**
 * Subscribe to realtime map updates
 */
export function subscribeToMapUpdates(
  onNewMarker: (marker: MapMarker) => void,
  options?: {
    userLatitude?: number;
    userLongitude?: number;
  }
): () => void {
  const channelId = `map-updates-${Date.now()}`;

  const fallbackLat = options?.userLatitude || APP.defaultRegion.latitude;
  const fallbackLng = options?.userLongitude || APP.defaultRegion.longitude;

  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'news' },
      (payload) => {
        const article = payload.new as Record<string, unknown>;
        const location = geocodeFromMultipleSources(
          article.location_name as string | null,
          article.title as string | null,
          article.summary as string | null,
          article.latitude as number | null,
          article.longitude as number | null
        );

        if (location) {
          onNewMarker({
            id: article.id as string,
            type: 'news',
            title: article.title as string,
            description: article.summary as string | undefined,
            category: article.category as string,
            severity: (article.severity as MapMarker['severity']) || 'low',
            latitude: location.latitude,
            longitude: location.longitude,
            confidence: location.confidence,
            matchedLocation: location.matchedName,
            timestamp: article.published_at as string,
            source: article.source as string | undefined,
          });
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'tips' },
      (payload) => {
        const tip = payload.new as Record<string, unknown>;
        // Tips don't have location_name column
        const location = geocodeFromMultipleSources(
          null,
          null,
          tip.description as string | null,
          tip.latitude as number | null,
          tip.longitude as number | null
        );

        if (location) {
          onNewMarker({
            id: tip.id as string,
            type: 'tip',
            title: 'Community Tip',
            description: tip.description as string | undefined,
            category: tip.category as string,
            severity: (tip.severity as MapMarker['severity']) || 'low',
            latitude: location.latitude,
            longitude: location.longitude,
            confidence: location.confidence,
            matchedLocation: location.matchedName,
            timestamp: tip.created_at as string,
            status: tip.status as string | undefined,
          });
        } else {
          // Use fallback for tips without location
          const fallback = getFallbackLocation(fallbackLat, fallbackLng);

          onNewMarker({
            id: tip.id as string,
            type: 'tip',
            title: 'Community Tip',
            description: tip.description as string | undefined,
            category: tip.category as string,
            severity: (tip.severity as MapMarker['severity']) || 'low',
            latitude: fallback.latitude,
            longitude: fallback.longitude,
            confidence: 'approximate',
            matchedLocation: 'Location not specified',
            timestamp: tip.created_at as string,
            status: tip.status as string | undefined,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}