// src/components/ads/AdBanner.tsx
// Placeholder banner – will be replaced with real AdMob after fixing Kotlin compatibility

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts';

export function AdBanner() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.text, { color: theme.colors.textDisabled }]}>
        Advertisement
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    paddingVertical: 32,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  text: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    letterSpacing: 1,
  },
});