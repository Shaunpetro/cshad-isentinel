// src/services/preferences/preferencesService.ts
/**
 * Preferences Service
 * Handles persistent storage of user preferences
 * Uses AsyncStorage for fast, local storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  AppearanceMode,
  NewsScope,
  NewsRadius,
  TextSize,
  StartupScreen,
  HomeLocation,
} from './types';

// In-memory cache for fast synchronous access
let cachedPreferences: UserPreferences | null = null;

/**
 * Initialize preferences - call on app start
 * Loads from storage into memory cache
 */
export async function initializePreferences(): Promise<UserPreferences> {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<UserPreferences>;
      // Merge with defaults to handle new preference additions
      cachedPreferences = { ...DEFAULT_PREFERENCES, ...parsed };
    } else {
      cachedPreferences = { ...DEFAULT_PREFERENCES };
    }
    
    console.log('[Preferences] Initialized:', cachedPreferences);
    return cachedPreferences;
  } catch (error) {
    console.error('[Preferences] Init error:', error);
    cachedPreferences = { ...DEFAULT_PREFERENCES };
    return cachedPreferences;
  }
}

/**
 * Get current preferences (from cache)
 * Returns defaults if not yet initialized
 */
export function getPreferences(): UserPreferences {
  return cachedPreferences ?? { ...DEFAULT_PREFERENCES };
}

/**
 * Save all preferences
 */
async function savePreferences(prefs: UserPreferences): Promise<void> {
  try {
    cachedPreferences = prefs;
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
    console.log('[Preferences] Saved');
  } catch (error) {
    console.error('[Preferences] Save error:', error);
  }
}

/**
 * Update a single preference
 */
export async function updatePreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): Promise<UserPreferences> {
  const current = getPreferences();
  const updated = { ...current, [key]: value };
  await savePreferences(updated);
  return updated;
}

// ---- Convenience Setters ----

export async function setAppearance(mode: AppearanceMode): Promise<UserPreferences> {
  return updatePreference('appearance', mode);
}

export async function setTextSize(size: TextSize): Promise<UserPreferences> {
  return updatePreference('textSize', size);
}

export async function setHomeLocation(location: HomeLocation | null): Promise<UserPreferences> {
  return updatePreference('homeLocation', location);
}

export async function setNewsRadius(radius: NewsRadius): Promise<UserPreferences> {
  return updatePreference('newsRadius', radius);
}

export async function setDefaultScope(scope: NewsScope): Promise<UserPreferences> {
  return updatePreference('defaultScope', scope);
}

export async function setDefaultCategory(category: string | null): Promise<UserPreferences> {
  return updatePreference('defaultCategory', category);
}

export async function setSoundEnabled(enabled: boolean): Promise<UserPreferences> {
  return updatePreference('soundEnabled', enabled);
}

export async function setVibrationEnabled(enabled: boolean): Promise<UserPreferences> {
  return updatePreference('vibrationEnabled', enabled);
}

export async function setStartupScreen(screen: StartupScreen): Promise<UserPreferences> {
  return updatePreference('startupScreen', screen);
}

export async function setAutoRefreshMinutes(minutes: number | null): Promise<UserPreferences> {
  return updatePreference('autoRefreshMinutes', minutes);
}

export async function setDataSaverEnabled(enabled: boolean): Promise<UserPreferences> {
  return updatePreference('dataSaverEnabled', enabled);
}

/**
 * Reset all preferences to defaults
 */
export async function resetPreferences(): Promise<UserPreferences> {
  await savePreferences({ ...DEFAULT_PREFERENCES });
  return getPreferences();
}

/**
 * Clear all preferences (for privacy/data clearing)
 */
export async function clearPreferences(): Promise<void> {
  try {
    cachedPreferences = null;
    await AsyncStorage.removeItem(PREFERENCES_STORAGE_KEY);
    console.log('[Preferences] Cleared');
  } catch (error) {
    console.error('[Preferences] Clear error:', error);
  }
}