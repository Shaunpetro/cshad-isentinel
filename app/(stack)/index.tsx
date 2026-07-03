// app/(stack)/index.tsx
// Beta 4 - Phase 1: Home screen with carousel and section navigator

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts';
import SectionNavigator from '../../src/components/home/SectionNavigator';
import BreakingNewsCarousel from '../../src/components/home/BreakingNewsCarousel';

export default function HomeScreen() {
  const theme = useTheme();

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
  content: { padding: 16, gap: 24, alignItems: 'center' },
});