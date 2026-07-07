// src/hooks/useInfrastructure.ts
// Beta 4 – hook to fetch load‑shedding status for the current city

import { useState, useEffect, useCallback } from 'react';
import { useLocationContext } from '@/contexts/LocationContext';
import { fetchLoadsheddingStatus } from '@/services/infrastructure/infrastructureService';
import type { LoadsheddingStatus } from '@/services/infrastructure';

export function useInfrastructure() {
  const { currentCity } = useLocationContext();
  const [loadshedding, setLoadshedding] = useState<LoadsheddingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!currentCity?.name) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const status = await fetchLoadsheddingStatus(currentCity.name);
      setLoadshedding(status);
    } catch (err) {
      console.error('[useInfrastructure]', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentCity?.name]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { loadshedding, isLoading };
}