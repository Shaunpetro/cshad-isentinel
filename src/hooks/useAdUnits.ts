// src/hooks/useAdUnits.ts
// Returns real ad unit IDs if environment variables are set, otherwise test IDs

import { Platform } from 'react-native';

const TEST_BANNER = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';

export function useAdUnits() {
  const banner =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS || TEST_BANNER
      : process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID || TEST_BANNER;

  const interstitial =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS || TEST_INTERSTITIAL
      : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID || TEST_INTERSTITIAL;

  return { banner, interstitial };
}