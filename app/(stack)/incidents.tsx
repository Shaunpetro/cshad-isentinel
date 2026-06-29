// app/(stack)/incidents.tsx
// Beta 4 - Phase 1: Local incidents placeholder

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../../src/components/ui/GlassCard';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '@/config/theme';

export default function IncidentsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GlassCard tint={theme.pastel.rose}>
        <Text style={[styles.text, { color: theme.colors.text }]}>🚨 Local Incidents</Text>
        <Text style={[styles.sub, { color: theme.colors.text }]}>Incident reports will be shown here.</Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  sub: { fontSize: 16 },
});
