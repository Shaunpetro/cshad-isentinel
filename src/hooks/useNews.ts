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

export function useNews(options: UseNewsOptions = {}): UseNewsResult {
  const {
    category,
    scope = 'national',
    latitude,
    longitude,
    cityName,
    radiusKm,
    timeFilter = 'all',
    limit = 250,
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

  const fetchNewsData = useCallback(
    async (isRefresh = false, isBackground = false) => {
      try {
        if (isRefresh && !isBackground) {
          setIsRefreshing(true);
          setOffset(0);
        } else if (offset === 0 && !isBackground) {
          setIsLoading(true);
        }

        if (!isBackground) {
          setError(null);
        }

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

  const refresh = useCallback(async () => {
    await fetchNewsData(true, false);
  }, [fetchNewsData]);

  const backgroundRefresh = useCallback(async () => {
    console.log('[useNews] Background refresh...');
    await fetchNewsData(true, true);
  }, [fetchNewsData]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setOffset((prev) => prev + limit);
  }, [hasMore, isLoading, limit]);

  useEffect(() => {
    fetchNewsData(true);
  }, [category, scope, latitude, longitude, cityName, radiusKm, timeFilter]);

  useEffect(() => {
    if (offset > 0) {
      fetchNewsData(false);
    }
  }, [offset]);

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

  useEffect(() => {
    if (!realtime) return;

    unsubscribeRef.current = subscribeToNews(
      (record: any) => {
        const newItem = mapRecordToNewsItem(record);
        setNews((prev) => [newItem, ...prev]);
        setLastUpdated(new Date());
        if (newItem.isBreaking) {
          setBreakingNews((prev) => [newItem, ...prev.slice(0, 9)]);
        }
      },
      (record: any) => {
        const updatedItem = mapRecordToNewsItem(record);
        setNews((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        setBreakingNews((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
      },
      { cityName: scope === 'local' ? cityName : undefined }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [realtime, scope, cityName]);

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