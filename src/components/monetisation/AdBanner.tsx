// src/components/monetisation/AdBanner.tsx
// Beta 4 – Mock ad placeholder for monetisation testing

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { Typography, Spacing, BorderRadius, Shadows } from '@/config/theme';

export default function AdBanner() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.adContent}>
        <View style={[styles.adPlaceholder, { backgroundColor: colors.divider }]}>
          <Ionicons name="megaphone-outline" size={32} color={colors.textDisabled} />
        </View>
        <View style={styles.adInfo}>
          <Text style={[styles.adLabel, { color: colors.textSecondary }]}>SPONSORED</Text>
          <Text style={[styles.adTitle, { color: colors.text }]}>Your Ad Here</Text>
          <Text style={[styles.adDescription, { color: colors.textSecondary }]}>
            Reach thousands of South Africans. Tap to learn more.
          </Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.adButton, { backgroundColor: colors.primary }]} onPress={() => {}}>
        <Text style={styles.adButtonText}>Learn More</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  adContent: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  adPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adInfo: {
    flex: 1,
    gap: 4,
  },
  adLabel: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.mono,
    letterSpacing: 1,
  },
  adTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  adDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    lineHeight: 18,
  },
  adButton: {
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  adButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
  },
});