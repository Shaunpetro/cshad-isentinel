// src/hooks/useLanguage.ts
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/constants';
import { LANGUAGE_OPTIONS, LanguageCode } from '@/i18n';

/**
 * Hook for managing app language
 */
export function useLanguage() {
  const { i18n, t } = useTranslation();

  // Current language code
  const currentLanguage = i18n.language as LanguageCode;

  // Get display label for current language
  const currentLanguageLabel = LANGUAGE_OPTIONS.find(
    (lang) => lang.code === currentLanguage
  )?.nativeLabel || 'English';

  // Change language
  const changeLanguage = useCallback(async (languageCode: LanguageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem(STORAGE_KEYS.language, languageCode);
      console.log('[useLanguage] Language changed to:', languageCode);
    } catch (error) {
      console.error('[useLanguage] Failed to change language:', error);
      throw error;
    }
  }, [i18n]);

  // Get all available languages
  const availableLanguages = LANGUAGE_OPTIONS;

  return {
    t,
    i18n,
    currentLanguage,
    currentLanguageLabel,
    changeLanguage,
    availableLanguages,
  };
}

export type { LanguageCode };