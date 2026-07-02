// src/components/home/PersonalisedFeed.tsx
// Beta 4 - Phase 1: Personalised alerts feed placeholder

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import GlassCard from '../ui/GlassCard';
import { useTheme } from '../../contexts';
import { useTranslation } from 'react-i18next';

export default function PersonalisedFeed() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <GlassCard tint={theme.pastel.mint}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        📍 {t('home.personalisedFeed')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Personalised alerts will appear here.
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },
});