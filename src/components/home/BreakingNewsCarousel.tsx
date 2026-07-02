// src/components/home/BreakingNewsCarousel.tsx
// Beta 4 - Phase 1: Auto-sliding breaking news placeholder

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import GlassCard from '../ui/GlassCard';
import { useTheme } from '../../contexts';
import { useTranslation } from 'react-i18next';

export default function BreakingNewsCarousel() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <GlassCard tint={theme.pastel.peach}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        🚨 {t('home.breakingNews')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        No active alerts. Carousel coming soon.
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },
});