// src/hooks/useCurrentWeather.ts
// Phase 3E – Reads API key from environment

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from './useLocation';
import { fetchWeatherData } from '../services/weather';
import type { CurrentWeather } from '../services/weather';

interface CurrentWeatherResult {
  weather: CurrentWeather | null;
  isLoading: boolean;
  error: string | null;
}

export function useCurrentWeather(): CurrentWeatherResult {
  const { currentCity } = useLocation();
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!currentCity?.latitude || !currentCity?.longitude) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData({
        latitude: currentCity.latitude,
        longitude: currentCity.longitude,
      });

      if (data?.current) {
        setWeather(data.current);
      }
    } catch (err) {
      console.error('[useCurrentWeather]', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentCity]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, isLoading, error };
}