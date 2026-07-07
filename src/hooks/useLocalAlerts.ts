// src/hooks/useLocalAlerts.ts
// Beta 4 – reads city from shared LocationContext

import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useEffect(() => {
    if (!currentCity?.name) return;
    const channel = supabase
      .channel('local_reports')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'local_reports', filter: `locationName=eq.${currentCity.name}` },
        (payload) => {
          setAlerts((prev) => [payload.new as LocalReport, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentCity?.name]);

  return { alerts, isLoading, isRefreshing, refresh: () => fetchAlerts(true) };
}