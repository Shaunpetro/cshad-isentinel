// src/components/home/FavoritesFeed.tsx
// Beta 4 - Phase 1: User's most visited sections

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import GlassCard from '../ui/GlassCard';
import { useTheme } from '../../contexts';
import { useTranslation } from 'react-i18next';

export default function FavoritesFeed() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <GlassCard tint={theme.pastel.lavender}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        ⭐ {t('home.favorites', 'Your Favorites')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Your most visited sections will appear here.
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },
});