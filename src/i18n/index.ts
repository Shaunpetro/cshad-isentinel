// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP, STORAGE_KEYS } from '@/config/constants';

// Import translation files
import en from './locales/en.json';
import af from './locales/af.json';
import zu from './locales/zu.json';

// Language resources
const resources = {
  en: { translation: en },
  af: { translation: af },
  zu: { translation: zu },
};

// Language display names
export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'af', label: 'Afrikaans', nativeLabel: 'Afrikaans' },
  { code: 'zu', label: 'isiZulu', nativeLabel: 'isiZulu' },
] as const;

export type LanguageCode = typeof APP.languages[number];

// Language detector plugin for AsyncStorage
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.language);
      if (savedLanguage && APP.languages.includes(savedLanguage as LanguageCode)) {
        callback(savedLanguage);
        return;
      }
    } catch (error) {
      console.warn('[i18n] Failed to load saved language:', error);
    }
    callback(APP.defaultLanguage);
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.language, lng);
    } catch (error) {
      console.warn('[i18n] Failed to save language:', error);
    }
  },
};

// Initialize i18next
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: APP.defaultLanguage,
    supportedLngs: APP.languages,
    
    interpolation: {
      escapeValue: false, // React already escapes
    },

    // React-i18next options
    react: {
      useSuspense: false, // Disable suspense for React Native
    },

    // Debug mode (disable in production)
    debug: __DEV__,
  });

export default i18n;