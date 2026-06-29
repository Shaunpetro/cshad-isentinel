// app/(stack)/live.tsx
// Beta 4 - Phase 1: Live Hub placeholder

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../../src/components/ui/GlassCard';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '@/config/theme';

export default function LiveScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GlassCard tint={theme.pastel.lavender}>
        <Text style={[styles.text, { color: theme.colors.text }]}>🔴 Live Hub</Text>
        <Text style={[styles.sub, { color: theme.colors.text }]}>Live streams and podcasts coming soon.</Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  sub: { fontSize: 16 },
});
