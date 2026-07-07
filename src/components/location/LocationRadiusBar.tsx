// src/components/location/LocationRadiusBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocationContext } from '@/contexts/LocationContext';
import { useTheme } from '@/contexts';
import { Typography, Spacing } from '@/config/theme';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

interface Props {
  onCityPress: () => void;
}

export default function LocationRadiusBar({ onCityPress }: Props) {
  const { currentCity, radiusKm, setRadius } = useLocationContext();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* City pill (left) */}
      <TouchableOpacity
        style={[styles.cityPill, { borderColor: theme.colors.border }]}
        onPress={onCityPress}
      >
        <Ionicons name="location" size={14} color={theme.colors.primary} />
        <Text style={[styles.cityText, { color: theme.colors.text }]} numberOfLines={1}>
          {currentCity?.name || 'Select city'}
        </Text>
        <Ionicons name="chevron-down" size={14} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      {/* Radius pills (right) */}
      <View style={styles.radiusRow}>
        {RADIUS_OPTIONS.map((r) => {
          const isActive = r === (radiusKm || 25);
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setRadius(r)}
              style={[
                styles.radiusPill,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.radiusPillText,
                  { color: isActive ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                {r}km
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 12,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  cityText: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    maxWidth: 100,
  },
  radiusRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  radiusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  radiusPillText: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
  },
});