// src/hooks/useLocalAlerts.ts
// Phase 3B – added isRefreshing state

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from './useLocation';
import { fetchWeatherAlerts } from '../services/weather';
import { fetchReportsByCity } from '../services/localReports';
import { supabase } from '../services/supabase';
import type { LocalReport } from '../types/news';

export function useLocalAlerts() {
  const { currentCity } = useLocation();
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

  // Initial fetch + 5‑minute polling
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Realtime subscription for new reports
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