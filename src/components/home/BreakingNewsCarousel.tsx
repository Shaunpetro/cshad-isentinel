// src/components/home/BreakingNewsCarousel.tsx
// Beta 4 - Phase 1: Auto-sliding breaking news placeholder

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../ui/GlassCard';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '@/config/theme';

export default function BreakingNewsCarousel() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <GlassCard tint={theme.pastel.peach}>
      <Text style={[styles.title, { color: theme.colors.text }]}>🚨 Breaking News</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>No active alerts. Carousel coming soon.</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },
});
