// src/ads/adUnitIds.ts
import { Platform } from 'react-native';

const TEST_BANNER = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED = 'ca-app-pub-3940256099942544/5224354917';

const PROD_BANNER = process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID || '';
const PROD_INTERSTITIAL = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID || '';
const PROD_REWARDED = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID || '';

export const AdUnitIds = {
  banner: __DEV__ ? TEST_BANNER : PROD_BANNER || TEST_BANNER,
  interstitial: __DEV__ ? TEST_INTERSTITIAL : PROD_INTERSTITIAL || TEST_INTERSTITIAL,
  rewarded: __DEV__ ? TEST_REWARDED : PROD_REWARDED || TEST_REWARDED,
} as const;