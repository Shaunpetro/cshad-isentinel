// src/components/home/PersonalisedFeed.tsx
// Beta 4 - Phase 1: Personalised alerts feed placeholder

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../ui/GlassCard';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '@/config/theme';

export default function PersonalisedFeed() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <GlassCard tint={theme.pastel.mint}>
      <Text style={[styles.title, { color: theme.colors.text }]}>📍 Your Feed</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>Personalised alerts will appear here.</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },
});
