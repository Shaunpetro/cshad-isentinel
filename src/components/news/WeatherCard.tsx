// src/components/news/WeatherCard.tsx
// Phase 3A – Compact current‑weather widget for the News screen

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GlassCard from '../ui/GlassCard';
import { useTheme } from '../../contexts';

interface WeatherCardProps {
  cityName: string;
  temperature: number;
  description: string;
  icon: string; // OpenWeatherMap icon code (e.g., "01d")
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  '01d': 'sunny',
  '01n': 'moon',
  '02d': 'partly-sunny',
  '02n': 'cloudy-night',
  '03d': 'cloud',
  '03n': 'cloud',
  '04d': 'cloud',
  '04n': 'cloud',
  '09d': 'rainy',
  '09n': 'rainy',
  '10d': 'rainy',
  '10n': 'rainy',
  '11d': 'thunderstorm',
  '11n': 'thunderstorm',
  '13d': 'snow',
  '13n': 'snow',
  '50d': 'cloud',
  '50n': 'cloud',
};

export default function WeatherCard({ cityName, temperature, description, icon }: WeatherCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const iconName = ICON_MAP[icon] || 'cloud';

  return (
    <GlassCard style={styles.card} tint={theme.pastel.green}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => router.push('safety' as any)}
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <Ionicons name={iconName} size={36} color={theme.colors.text} />
          <View style={styles.info}>
            <Text style={[styles.city, { color: theme.colors.text }]}>{cityName}</Text>
            <Text style={[styles.temp, { color: theme.colors.text }]}>
              {Math.round(temperature)}°C
            </Text>
            <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>{description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>
      </TouchableOpacity>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  touchable: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1 },
  city: { fontSize: 14, fontWeight: '600' },
  temp: { fontSize: 24, fontWeight: 'bold' },
  desc: { fontSize: 12, textTransform: 'capitalize' },
});