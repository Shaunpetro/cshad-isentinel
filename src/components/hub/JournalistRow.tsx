// src/components/hub/JournalistRow.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import { JournalistCard, type Journalist } from './JournalistCard';

interface JournalistRowProps {
  journalists: Journalist[];
  onJournalistPress?: (journalist: Journalist) => void;
  onFollowPress?: (journalist: Journalist) => void;
  onViewAllPress?: () => void;
}

export function JournalistRow({
  journalists,
  onJournalistPress,
  onFollowPress,
  onViewAllPress,
}: JournalistRowProps) {
  const { colors } = useTheme();

  if (journalists.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="people" size={18} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Journalists in Your Area
          </Text>
        </View>
        {onViewAllPress && (
          <Pressable onPress={onViewAllPress} style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>
              View All
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Verified reporters covering your area
      </Text>

      {/* Scrollable journalist cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {journalists.map((journalist) => (
          <JournalistCard
            key={journalist.id}
            journalist={journalist}
            onPress={() => onJournalistPress?.(journalist)}
            compact
          />
        ))}

        {/* View All Card */}
        {onViewAllPress && (
          <Pressable
            onPress={onViewAllPress}
            style={({ pressed }) => [
              styles.viewAllCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.viewAllIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.viewAllCardText, { color: colors.text }]}>
              View
            </Text>
            <Text style={[styles.viewAllCardText, { color: colors.text }]}>
              All
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
  },
  subtitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    paddingHorizontal: Spacing.md,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  viewAllCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    width: 80,
  },
  pressed: {
    opacity: 0.7,
  },
  viewAllIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  viewAllCardText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
    textAlign: 'center',
  },
});