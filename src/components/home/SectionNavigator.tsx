// src/components/home/SectionNavigator.tsx
// Beta 4 - Phase 1: Grid of glass cards linking to app sections

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '@/config/theme';

const sections = [
  { key: 'news', icon: 'newspaper-outline', labelKey: 'home:sections:news' },
  { key: 'opportunities', icon: 'briefcase-outline', labelKey: 'home:sections:opportunities' },
  { key: 'live', icon: 'radio-outline', labelKey: 'home:sections:live' },
  { key: 'map', icon: 'map-outline', labelKey: 'home:sections:map' },
  { key: 'safety', icon: 'shield-checkmark-outline', labelKey: 'home:sections:safety' },
  { key: 'incidents', icon: 'warning-outline', labelKey: 'home:sections:incidents' },
  { key: 'settings', icon: 'settings-outline', labelKey: 'home:sections:settings' },
];

export default function SectionNavigator() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <View style={styles.grid}>
      {sections.map((section) => (
        <GlassCard
          key={section.key}
          onPress={() => router.push(section.key as any)} // relative route
          tint={theme.pastel.blue}
          style={styles.card}
        >
          <Ionicons name={section.icon as any} size={28} color={theme.colors.text} />
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {section.labelKey}
          </Text>
        </GlassCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: { width: '30%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  label: { marginTop: 8, fontSize: 12, fontWeight: '500', textAlign: 'center' },
});
