import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdUnitIds } from './adUnitIds';

const PREMIUM_KEY = 'pshad_premium_subscribed';

export function AdBanner() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(PREMIUM_KEY).then((val) => {
        setIsSubscribed(val === 'true');
      });
    }, [])
  );

  // Premium users see no banner ads
  if (isSubscribed) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AdUnitIds.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={(error) => {
          console.warn('[ads] banner failed to load', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});