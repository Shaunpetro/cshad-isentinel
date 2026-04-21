// src/hooks/useHub.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchHubData,
  subscribeToHubUpdates,
  getDefaultFilter,
} from '@/services/hub';
import type { HubStats } from '@/services/hub';
import type { FeedItem, HubFilter, Journalist } from '@/components/hub';
import type { WeatherData, WeatherAlert } from '@/services/weather';
import type { InfrastructureAlert, LoadsheddingStatus } from '@/services/infrastructure';

interface UseHubOptions {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  realtime?: boolean;
  autoRefreshMs?: number;
}

interface UseHubReturn {
  // Data
  feedItems: FeedItem[];
  journalists: Journalist[];
  stats: HubStats;
  weather: WeatherData | null;
  loadshedding: LoadsheddingStatus | null;
  nationalAlerts: FeedItem[];
  infrastructureAlerts: InfrastructureAlert[];
  activeWeatherAlert: WeatherAlert | null;

  // Filter
  activeFilter: HubFilter;
  setFilter: (filter: HubFilter) => void;

  // State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  dismissNationalAlert: (id: string) => void;
  dismissedNationalAlerts: Set<string>;
}

const DEFAULT_STATS: HubStats = {
  activeIncidents: 0,
  breakingCount: 0,
  tipsCount: 0,
  weatherAlerts: 0,
  infrastructureAlerts: 0,
  loadshedding: 0,
};

export function useHub(options: UseHubOptions = {}): UseHubReturn {
  const {
    latitude,
    longitude,
    radiusKm = 50,
    realtime = false,
    autoRefreshMs = 5 * 60 * 1000, // 5 minutes
  } = options;

  // State
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [stats, setStats] = useState<HubStats>(DEFAULT_STATS);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadshedding, setLoadshedding] = useState<LoadsheddingStatus | null>(null);
  const [nationalAlerts, setNationalAlerts] = useState<FeedItem[]>([]);
  const [infrastructureAlerts, setInfrastructureAlerts] = useState<InfrastructureAlert[]>([]);
  const [activeFilter, setActiveFilter] = useState<HubFilter>('tips');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedNationalAlerts, setDismissedNationalAlerts] = useState<Set<string>>(new Set());

  // Refs
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedFilter = useRef(false);

  // Filter items helper
  const filterItems = useCallback((items: FeedItem[], filter: HubFilter): FeedItem[] => {
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
  }, []);

  // Fetch data
  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchHubData({
          latitude,
          longitude,
          radiusKm,
        });

        // Store all items for filtering
        setAllItems(data.feedItems);

        // Set other data
        setJournalists(data.journalists);
        setStats(data.stats);
        setWeather(data.weather);
        setLoadshedding(data.loadshedding);
        setNationalAlerts(data.nationalAlerts);
        setInfrastructureAlerts(data.infrastructureAlerts);

        // Set default filter on first load
        if (!hasInitializedFilter.current) {
          const defaultFilter = getDefaultFilter(data.feedItems);
          setActiveFilter(defaultFilter);
          setFeedItems(filterItems(data.feedItems, defaultFilter));
          hasInitializedFilter.current = true;
        } else {
          // Apply current filter
          setFeedItems(filterItems(data.feedItems, activeFilter));
        }
      } catch (err) {
        console.error('[useHub] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [latitude, longitude, radiusKm, activeFilter, filterItems]
  );

  // Handle filter change
  const handleSetFilter = useCallback(
    (filter: HubFilter) => {
      setActiveFilter(filter);
      setFeedItems(filterItems(allItems, filter));
    },
    [allItems, filterItems]
  );

  // Refresh
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Dismiss national alert
  const dismissNationalAlert = useCallback((id: string) => {
    setDismissedNationalAlerts((prev) => new Set(prev).add(id));
  }, []);

  // Get active weather alert (first severe/extreme)
  const activeWeatherAlert =
    weather?.alerts.find(
      (alert) => alert.severity === 'extreme' || alert.severity === 'severe'
    ) ||
    weather?.alerts[0] ||
    null;

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [latitude, longitude, radiusKm]);

  // Auto refresh
  useEffect(() => {
    if (autoRefreshMs > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData(true);
      }, autoRefreshMs);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefreshMs, fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (realtime) {
      unsubscribeRef.current = subscribeToHubUpdates((update) => {
        console.log('[useHub] Realtime update:', update.type);
        fetchData(true);
      });

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }
  }, [realtime, fetchData]);

  return {
    feedItems,
    journalists,
    stats,
    weather,
    loadshedding,
    nationalAlerts: nationalAlerts.filter((a) => !dismissedNationalAlerts.has(a.id)),
    infrastructureAlerts,
    activeWeatherAlert,
    activeFilter,
    setFilter: handleSetFilter,
    isLoading,
    isRefreshing,
    error,
    refresh,
    dismissNationalAlert,
    dismissedNationalAlerts,
  };
}

export default useHub;