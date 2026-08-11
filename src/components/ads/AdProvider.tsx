// src/components/ads/AdProvider.tsx
import React, { useEffect } from 'react';
import mobileAds from 'react-native-google-mobile-ads';

export function AdProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log('[AdProvider] Mobile Ads SDK initialized');
      });
  }, []);

  return <>{children}</>;
}