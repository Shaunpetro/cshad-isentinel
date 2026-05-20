// src/hooks/useOpportunities.ts
import { useState, useEffect, useCallback } from 'react';
import { fetchOpportunities, type Opportunity } from '@/services/opportunities';
import { useLocation } from '@/hooks/useLocation';

type Category = 'tender' | 'job' | 'bursary';

export function useOpportunities(category: Category) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { currentCity } = useLocation();

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const data = await fetchOpportunities({
        category,
        latitude: currentCity?.latitude,
        longitude: currentCity?.longitude,
        radiusKm: 50,
      });
      setOpportunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load opportunities');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [category, currentCity?.latitude, currentCity?.longitude]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    opportunities,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchData(true),
  };
}