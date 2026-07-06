// src/components/live/CreatorBadge.tsx
// Phase 2: Badge for verified creators

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';

interface CreatorBadgeProps {
  verified: boolean;
}

export default function CreatorBadge({ verified }: CreatorBadgeProps) {
  const theme = useTheme();

  if (!verified) return null;

  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.success + '20' }]}>
      <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
      <Text style={[styles.text, { color: theme.colors.success }]}>Verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});