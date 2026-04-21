// src/hooks/useNews.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchNews,
  fetchNewsById,
  fetchBreakingNews,
  subscribeToNews,
  mapRecordsToNewsItems,
  mapRecordToNewsItem,
  type NewsQueryParams,
  type TimeFilter,
  REFRESH_INTERVALS,
} from '@/services/news';
import type { NewsItem, NewsCategory } from '@/types';

export interface UseNewsOptions {
  category?: NewsCategory;
  scope?: 'local' | 'city' | 'national';
  latitude?: number;
  longitude?: number;
  cityName?: string;
  radiusKm?: number;
  timeFilter?: TimeFilter;
  limit?: number;
  realtime?: boolean;
  autoRefresh?: boolean;
}

export interface UseNewsResult {
  news: NewsItem[];
  breakingNews: NewsItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  lastUpdated: Date | null;
  totalCount: number | null;
}

/**
 * Hook for fetching and managing news data
 */
export function useNews(options: UseNewsOptions = {}): UseNewsResult {
  const {
    category,
    scope = 'national',
    latitude,
    longitude,
    cityName,
    radiusKm,
    timeFilter = 'all',
    limit = 20,
    realtime = true,
    autoRefresh = true,
  } = options;

  const [news, setNews] = useState<NewsItem[]>([]);
  const [breakingNews, setBreakingNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Build query params
  const buildParams = useCallback(
    (customOffset?: number): NewsQueryParams => ({
      category,
      scope,
      latitude,
      longitude,
      cityName,
      radiusKm,
      timeFilter,
      limit,
      offset: customOffset ?? offset,
    }),
    [category, scope, latitude, longitude, cityName, radiusKm, timeFilter, limit, offset]
  );

  // Fetch news
  const fetchNewsData = useCallback(
    async (isRefresh = false, isBackground = false) => {
      try {
        // Don't show loading for background refresh
        if (isRefresh && !isBackground) {
          setIsRefreshing(true);
          setOffset(0);
        } else if (offset === 0 && !isBackground) {
          setIsLoading(true);
        }

        if (!isBackground) {
          setError(null);
        }

        // Fetch regular news
        const params = buildParams(isRefresh ? 0 : undefined);
        const result = await fetchNews(params);

        if (!isMountedRef.current) return;

        if (result.error) {
          if (!isBackground) {
            setError(result.error);
          }
          return;
        }

        const items = mapRecordsToNewsItems(result.data);

        if (isRefresh || offset === 0) {
          setNews(items);
        } else {
          setNews((prev) => [...prev, ...items]);
        }

        setTotalCount(result.count);
        setHasMore(items.length === limit);
        setLastUpdated(new Date());

        // Fetch breaking news separately
        const breakingResult = await fetchBreakingNews(10);
        if (!breakingResult.error && isMountedRef.current) {
          setBreakingNews(mapRecordsToNewsItems(breakingResult.data));
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch news';
        if (!isBackground) {
          setError(message);
        }
        console.error('[useNews] Error:', message);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [buildParams, limit, offset]
  );

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchNewsData(true, false);
  }, [fetchNewsData]);

  // Background refresh (no loading indicator)
  const backgroundRefresh = useCallback(async () => {
    console.log('[useNews] Background refresh...');
    await fetchNewsData(true, true);
  }, [fetchNewsData]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setOffset((prev) => prev + limit);
  }, [hasMore, isLoading, limit]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchNewsData(true);
  }, [category, scope, latitude, longitude, cityName, radiusKm, timeFilter]);

  // Fetch more when offset changes
  useEffect(() => {
    if (offset > 0) {
      fetchNewsData(false);
    }
  }, [offset]);

  // Auto-refresh based on time filter
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = REFRESH_INTERVALS[timeFilter] || REFRESH_INTERVALS.all;
    console.log(`[useNews] Auto-refresh set to ${interval / 1000}s for timeFilter: ${timeFilter}`);

    refreshIntervalRef.current = setInterval(() => {
      backgroundRefresh();
    }, interval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, timeFilter, backgroundRefresh]);

  // Setup realtime subscription
  useEffect(() => {
    if (!realtime) return;

    unsubscribeRef.current = subscribeToNews(
      // On new article
      (record) => {
        const newItem = mapRecordToNewsItem(record);

        // Add to beginning of news list
        setNews((prev) => [newItem, ...prev]);
        setLastUpdated(new Date());

        // Add to breaking if it's breaking news
        if (newItem.isBreaking) {
          setBreakingNews((prev) => [newItem, ...prev.slice(0, 9)]);
        }
      },
      // On update
      (record) => {
        const updatedItem = mapRecordToNewsItem(record);

        setNews((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );

        setBreakingNews((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
      },
      // Options
      { cityName: scope === 'local' ? cityName : undefined }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [realtime, scope, cityName]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    news,
    breakingNews,
    isLoading,
    isRefreshing,
    error,
    refresh,
    loadMore,
    hasMore,
    lastUpdated,
    totalCount,
  };
}

/**
 * Hook for fetching a single news article
 */
export function useNewsArticle(id: string | undefined) {
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    async function fetchArticle() {
      setIsLoading(true);
      setError(null);

      const result = await fetchNewsById(id as string);

      if (result.error) {
        setError(result.error);
        setArticle(null);
      } else if (result.data) {
        setArticle(mapRecordToNewsItem(result.data));
      } else {
        setError('Article not found');
        setArticle(null);
      }

      setIsLoading(false);
    }

    fetchArticle();
  }, [id]);

  return { article, isLoading, error };
}