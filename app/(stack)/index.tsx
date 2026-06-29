// app/(stack)/index.tsx
// Beta 4 - Phase 1: Home screen shell – Section Navigator + placeholder carousel

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '@/config/theme'; // fixed
import SectionNavigator from '../../src/components/home/SectionNavigator';
import BreakingNewsCarousel from '../../src/components/home/BreakingNewsCarousel';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <BreakingNewsCarousel />
      <SectionNavigator />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 24 },
});
