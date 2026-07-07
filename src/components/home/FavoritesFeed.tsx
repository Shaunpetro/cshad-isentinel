// src/components/home/FavoritesFeed.tsx
// Phase 1 – Dynamic favorites based on section visit counts

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import { useTheme } from '../../contexts';
import { useTranslation } from 'react-i18next';
import { getTopSections } from '../../utils/sectionVisits';

const SECTION_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; labelKey: string }> = {
  news: { icon: 'newspaper-outline', labelKey: 'home.sectionNavigator.news' },
  opportunities: { icon: 'briefcase-outline', labelKey: 'home.sectionNavigator.opportunities' },
  map: { icon: 'map-outline', labelKey: 'home.sectionNavigator.map' },
  safety: { icon: 'shield-checkmark-outline', labelKey: 'home.sectionNavigator.safety' },
  live: { icon: 'play-circle-outline', labelKey: 'home.sectionNavigator.live' },
  incidents: { icon: 'warning-outline', labelKey: 'home.sectionNavigator.incidents' },
};

interface Props {
  refreshKey?: number;
}

export default function FavoritesFeed({ refreshKey }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [topSections, setTopSections] = useState<{ key: string; count: number }[]>([]);

  const load = async () => {
    const tops = await getTopSections(3);
    setTopSections(tops);
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  if (topSections.length === 0) {
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

  return (
    <View style={{ width: '100%' }}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        ⭐ {t('home.favorites', 'Your Favorites')}
      </Text>
      <View style={styles.favoritesRow}>
        {topSections.map((item) => {
          const meta = SECTION_META[item.key];
          if (!meta) return null;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.favoriteItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => router.push(item.key as any)}
            >
              <Ionicons name={meta.icon} size={24} color={theme.colors.text} />
              <Text style={[styles.favoriteLabel, { color: theme.colors.text }]}>
                {t(meta.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  favoritesRow: { flexDirection: 'row', gap: 12 },
  favoriteItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  favoriteLabel: { fontSize: 12, fontWeight: '500' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },
});