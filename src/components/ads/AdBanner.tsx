// src/components/ads/AdBanner.tsx
// Premium‑aware banner ad

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAdUnits } from '../../hooks/useAdUnits';

const PREMIUM_KEY = 'pshad_premium_subscribed';

export function AdBanner() {
  const { banner } = useAdUnits();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREMIUM_KEY).then((val) => {
      setIsSubscribed(val === 'true');
    });
  }, []);

  // Premium users see no ads
  if (isSubscribed) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={banner}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
});