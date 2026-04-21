// src/services/map/mapService.ts
import { supabase } from '../supabase/config';
import { 
  geocodeFromMultipleSources,
} from '../location/geocoder';

export interface MapMarker {
  id: string;
  type: 'news' | 'tip';
  title: string;
  description?: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  confidence: 'exact' | 'city' | 'province' | 'extracted';
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
 * Fetch all mappable data (news + tips)
 */
export async function fetchMapData(options?: {
  limit?: number;
  categories?: string[];
  includeNews?: boolean;
  includeTips?: boolean;
}): Promise<MapDataResult> {
  const {
    limit = 100,
    categories,
    includeNews = true,
    includeTips = true,
  } = options || {};

  const markers: MapMarker[] = [];
  let newsCount = 0;
  let tipsCount = 0;

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

    // Fetch tips
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
          const location = geocodeFromMultipleSources(
            null,
            null,
            tip.description,
            tip.latitude,
            tip.longitude
          );

          if (location) {
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
  onNewMarker: (marker: MapMarker) => void
): () => void {
  const channelId = `map-updates-${Date.now()}`;
  
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
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}