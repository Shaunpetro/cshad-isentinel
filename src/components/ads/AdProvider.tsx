// src/components/ads/AdProvider.tsx
// Initialises Google Mobile Ads SDK

import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { AdsConsent, AdMob } from 'react-native-google-mobile-ads';

export function AdProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialise the SDK
    AdMob.initialize();

    // Request consent for EEA users (required by GDPR)
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      AdsConsent.requestInfoUpdate().then(() => {
        const status = AdsConsent.getStatus();
        if (status === AdsConsent.ConsentStatus.REQUIRED) {
          AdsConsent.showForm();
        }
      });
    }
  }, []);

  return <>{children}</>;
}