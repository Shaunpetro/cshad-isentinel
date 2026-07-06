// src/hooks/useCurrentWeather.ts
// Phase 3C – Lightweight hook for the weather widget in the news header

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
    if (!currentCity) {
      setIsLoading(false);
      setError('Location not available');
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
      } else {
        setError('Weather data unavailable');
      }
    } catch (err) {
      console.error('[useCurrentWeather]', err);
      setError('Failed to fetch weather');
    } finally {
      setIsLoading(false);
    }
  }, [currentCity]);

  useEffect(() => {
    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, isLoading, error };
}