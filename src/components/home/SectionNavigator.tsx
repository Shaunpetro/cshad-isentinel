// src/components/home/SectionNavigator.tsx
// Beta 4 - Phase 1: Grid of glass cards linking to app sections (Settings removed from home grid)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import { useTheme } from '../../contexts';
import { useTranslation } from 'react-i18next';

// Settings removed from this list (now in header)
const sections = [
  { key: 'news', icon: 'newspaper-outline', labelKey: 'home.sectionNavigator.news' },
  { key: 'opportunities', icon: 'briefcase-outline', labelKey: 'home.sectionNavigator.opportunities' },
  { key: 'map', icon: 'map-outline', labelKey: 'home.sectionNavigator.map' },
  { key: 'safety', icon: 'shield-checkmark-outline', labelKey: 'home.sectionNavigator.safety' },
  { key: 'live', icon: 'play-circle-outline', labelKey: 'home.sectionNavigator.live' },
  { key: 'incidents', icon: 'warning-outline', labelKey: 'home.sectionNavigator.incidents' },
];

export default function SectionNavigator() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.grid}>
      {sections.map((section) => (
        <GlassCard
          key={section.key}
          onPress={() => router.push(section.key as any)}
          tint={theme.pastel.blue}
          style={styles.card}
          noPadding
        >
          <View style={styles.cardInner}>
            <View style={[styles.iconBox, { backgroundColor: theme.pastel.blue }]}>
              <Ionicons name={section.icon as any} size={24} color={theme.colors.text} />
            </View>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t(section.labelKey)}</Text>
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: { width: '30%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cardInner: { alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' },
  iconBox: { borderRadius: 12, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
});