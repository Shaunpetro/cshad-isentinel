// src/hooks/useMapData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchMapData, 
  subscribeToMapUpdates,
  type MapMarker,
  type MapDataResult 
} from '@/services/map';

export type { MapMarker } from '@/services/map';

export interface UseMapDataOptions {
  limit?: number;
  categories?: string[];
  includeNews?: boolean;
  includeTips?: boolean;
  realtime?: boolean;
}

export interface UseMapDataResult {
  markers: MapMarker[];
  newsCount: number;
  tipsCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useMapData(options: UseMapDataOptions = {}): UseMapDataResult {
  const {
    limit = 100,
    categories,
    includeNews = true,
    includeTips = true,
    realtime = true,
  } = options;

  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [newsCount, setNewsCount] = useState(0);
  const [tipsCount, setTipsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchMapData({
        limit,
        categories,
        includeNews,
        includeTips,
      });

      if (!isMountedRef.current) return;

      if (result.error) {
        setError(result.error);
      } else {
        setMarkers(result.markers);
        setNewsCount(result.newsCount);
        setTipsCount(result.tipsCount);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load map data');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [limit, categories, includeNews, includeTips]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscription
  useEffect(() => {
    if (!realtime) return;

    unsubscribeRef.current = subscribeToMapUpdates((newMarker: MapMarker) => {
      if (!isMountedRef.current) return;
      
      // Check if we should include this marker based on filters
      if (newMarker.type === 'news' && !includeNews) return;
      if (newMarker.type === 'tip' && !includeTips) return;
      if (categories && categories.length > 0 && !categories.includes(newMarker.category)) return;

      setMarkers((prev) => {
        // Check if marker already exists
        if (prev.some(m => m.id === newMarker.id)) {
          return prev;
        }
        return [newMarker, ...prev];
      });

      if (newMarker.type === 'news') {
        setNewsCount((prev) => prev + 1);
      } else {
        setTipsCount((prev) => prev + 1);
      }

      setLastUpdated(new Date());
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [realtime, includeNews, includeTips, categories]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    markers,
    newsCount,
    tipsCount,
    isLoading,
    error,
    refresh,
    lastUpdated,
  };
}