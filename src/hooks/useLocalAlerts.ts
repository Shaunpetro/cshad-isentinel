// src/hooks/useLocalAlerts.ts
// Beta 4 – reads city from shared LocationContext, guarded realtime subscription

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocationContext } from '@/contexts/LocationContext';
import { fetchWeatherAlerts } from '../services/weather';
import { fetchReportsByCity } from '../services/localReports';
import { supabase } from '../services/supabase';
import type { LocalReport } from '../types/news';

export function useLocalAlerts() {
  const { currentCity } = useLocationContext();
  const [alerts, setAlerts] = useState<LocalReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const cityRef = useRef<string | undefined>(undefined);

  const fetchAlerts = useCallback(async (isRefresh = false) => {
    if (!currentCity?.name) return;
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const [weather, reports] = await Promise.all([
        fetchWeatherAlerts(currentCity),
        fetchReportsByCity(currentCity.name),
      ]);
      const combined = [...weather, ...reports].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAlerts(combined);
    } catch (error) {
      console.error('[useLocalAlerts]', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentCity?.name]);

  // Polling
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Realtime subscription – guarded against duplicates
  useEffect(() => {
    const cityName = currentCity?.name;
    if (!cityName) return;

    // Already subscribed to this city
    if (cityRef.current === cityName && channelRef.current) return;

    // Clean up previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    cityRef.current = cityName;

    const channel = supabase
      .channel(`local_reports_${cityName.replace(/\s+/g, '_').toLowerCase()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'local_reports', filter: `locationName=eq.${cityName}` },
        (payload) => {
          setAlerts((prev) => [payload.new as LocalReport, ...prev]);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('[useLocalAlerts] Realtime subscription failed');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentCity?.name]);

  return { alerts, isLoading, isRefreshing, refresh: () => fetchAlerts(true) };
}