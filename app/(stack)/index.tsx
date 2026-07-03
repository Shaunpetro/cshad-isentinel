// app/(stack)/index.tsx
// Beta 4 - Phase 1: Home screen with carousel, favourites, section navigator

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts';
import SectionNavigator from '../../src/components/home/SectionNavigator';
import BreakingNewsCarousel from '../../src/components/home/BreakingNewsCarousel';
import FavoritesFeed from '../../src/components/home/FavoritesFeed';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <BreakingNewsCarousel />
      <FavoritesFeed />
      <SectionNavigator />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 24, alignItems: 'center', paddingBottom: 100 },
});