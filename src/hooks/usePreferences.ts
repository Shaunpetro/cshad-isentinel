// src/hooks/usePreferences.ts
/**
 * usePreferences Hook
 * React hook for accessing and updating user preferences
 * Provides reactive state that updates UI automatically
 */

import { useState, useEffect, useCallback } from 'react';
import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  AppearanceMode,
  NewsScope,
  NewsRadius,
  TextSize,
  StartupScreen,
  HomeLocation,
  initializePreferences,
  getPreferences,
  setAppearance,
  setTextSize,
  setHomeLocation,
  setNewsRadius,
  setDefaultScope,
  setDefaultCategory,
  setSoundEnabled,
  setVibrationEnabled,
  setStartupScreen,
  setAutoRefreshMinutes,
  setDataSaverEnabled,
  resetPreferences,
} from '@/services/preferences';

interface UsePreferencesReturn {
  preferences: UserPreferences;
  isLoading: boolean;
  
  // Setters
  updateAppearance: (mode: AppearanceMode) => Promise<void>;
  updateTextSize: (size: TextSize) => Promise<void>;
  updateHomeLocation: (location: HomeLocation | null) => Promise<void>;
  updateNewsRadius: (radius: NewsRadius) => Promise<void>;
  updateDefaultScope: (scope: NewsScope) => Promise<void>;
  updateDefaultCategory: (category: string | null) => Promise<void>;
  updateSoundEnabled: (enabled: boolean) => Promise<void>;
  updateVibrationEnabled: (enabled: boolean) => Promise<void>;
  updateStartupScreen: (screen: StartupScreen) => Promise<void>;
  updateAutoRefreshMinutes: (minutes: number | null) => Promise<void>;
  updateDataSaverEnabled: (enabled: boolean) => Promise<void>;
  
  // Actions
  reset: () => Promise<void>;
}

export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      const prefs = await initializePreferences();
      if (mounted) {
        setPreferences(prefs);
        setIsLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // ---- Update functions ----
  
  const updateAppearance = useCallback(async (mode: AppearanceMode) => {
    const updated = await setAppearance(mode);
    setPreferences(updated);
  }, []);

  const updateTextSize = useCallback(async (size: TextSize) => {
    const updated = await setTextSize(size);
    setPreferences(updated);
  }, []);

  const updateHomeLocation = useCallback(async (location: HomeLocation | null) => {
    const updated = await setHomeLocation(location);
    setPreferences(updated);
  }, []);

  const updateNewsRadius = useCallback(async (radius: NewsRadius) => {
    const updated = await setNewsRadius(radius);
    setPreferences(updated);
  }, []);

  const updateDefaultScope = useCallback(async (scope: NewsScope) => {
    const updated = await setDefaultScope(scope);
    setPreferences(updated);
  }, []);

  const updateDefaultCategory = useCallback(async (category: string | null) => {
    const updated = await setDefaultCategory(category);
    setPreferences(updated);
  }, []);

  const updateSoundEnabled = useCallback(async (enabled: boolean) => {
    const updated = await setSoundEnabled(enabled);
    setPreferences(updated);
  }, []);

  const updateVibrationEnabled = useCallback(async (enabled: boolean) => {
    const updated = await setVibrationEnabled(enabled);
    setPreferences(updated);
  }, []);

  const updateStartupScreen = useCallback(async (screen: StartupScreen) => {
    const updated = await setStartupScreen(screen);
    setPreferences(updated);
  }, []);

  const updateAutoRefreshMinutes = useCallback(async (minutes: number | null) => {
    const updated = await setAutoRefreshMinutes(minutes);
    setPreferences(updated);
  }, []);

  const updateDataSaverEnabled = useCallback(async (enabled: boolean) => {
    const updated = await setDataSaverEnabled(enabled);
    setPreferences(updated);
  }, []);

  const reset = useCallback(async () => {
    const updated = await resetPreferences();
    setPreferences(updated);
  }, []);

  return {
    preferences,
    isLoading,
    updateAppearance,
    updateTextSize,
    updateHomeLocation,
    updateNewsRadius,
    updateDefaultScope,
    updateDefaultCategory,
    updateSoundEnabled,
    updateVibrationEnabled,
    updateStartupScreen,
    updateAutoRefreshMinutes,
    updateDataSaverEnabled,
    reset,
  };
}