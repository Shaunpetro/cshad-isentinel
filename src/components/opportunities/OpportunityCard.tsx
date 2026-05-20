// src/components/opportunities/OpportunityCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { Typography, Spacing, BorderRadius, Shadows } from '@/config/theme';
import type { Opportunity } from '@/services/opportunities';

interface Props {
  opportunity: Opportunity;
  onPress: () => void;
  isSubscribed: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  tender: '#FF9800',
  job: '#2196F3',
  bursary: '#4CAF50',
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  tender: 'document-text',
  job: 'briefcase',
  bursary: 'school',
};

function daysLeft(closingDate: string): string {
  const now = Date.now();
  const end = new Date(closingDate).getTime();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Closed';
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day left';
  return `${diff} days left`;
}

export function OpportunityCard({ opportunity, onPress, isSubscribed }: Props) {
  const { colors } = useTheme();
  const categoryColor = CATEGORY_COLORS[opportunity.category] || colors.primary;
  const icon = CATEGORY_ICONS[opportunity.category] || 'document';
  const province = opportunity.province || opportunity.location_name;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
    >
      <View style={[styles.colorBar, { backgroundColor: categoryColor }]} />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Ionicons name={icon} size={12} color={categoryColor} />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {opportunity.category.charAt(0).toUpperCase() + opportunity.category.slice(1)}
            </Text>
          </View>
          {opportunity.is_premium && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="star" size={10} color={colors.warning} />
              <Text style={[styles.premiumText, { color: colors.warning }]}>PREMIUM</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {opportunity.title}
        </Text>

        {/* Body snippet */}
        <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
          {opportunity.body}
        </Text>

        {/* Meta */}
        <View style={styles.meta}>
          {opportunity.company_name && (
            <Text style={[styles.company, { color: colors.textSecondary }]} numberOfLines={1}>
              {opportunity.company_name}
            </Text>
          )}
          {province && (
            <View style={styles.metaRow}>
              <Ionicons name="location" size={12} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.primary }]} numberOfLines={1}>
                {province}
              </Text>
            </View>
          )}
          {opportunity.subcategory && (
            <View style={styles.metaRow}>
              <Ionicons name="pricetag" size={12} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                {opportunity.subcategory}
              </Text>
            </View>
          )}
          {opportunity.submission_type && (
            <View style={styles.metaRow}>
              <Ionicons
                name={opportunity.submission_type.toLowerCase().includes('online') ? 'globe' : 'document'}
                size={12}
                color={colors.textSecondary}
              />
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                {opportunity.submission_type}
              </Text>
            </View>
          )}
        </View>

        {/* Deadline */}
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.deadline, { color: colors.textSecondary }]}>
            {daysLeft(opportunity.closing_date)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  pressed: { opacity: 0.95 },
  colorBar: { height: 3, width: '100%' },
  content: { padding: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm, gap: 4 },
  categoryText: { fontSize: 10, fontFamily: 'DMSans-Bold', letterSpacing: 0.5 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm, gap: 3 },
  premiumText: { fontSize: 9, fontFamily: 'DMSans-Bold', letterSpacing: 0.5 },
  title: { fontSize: Typography.sizes.body, fontFamily: 'DMSans-Bold', marginBottom: Spacing.xs },
  body: { fontSize: Typography.sizes.caption, fontFamily: 'DMSans-Regular', lineHeight: 18, marginBottom: Spacing.sm },
  meta: { marginBottom: Spacing.sm },
  company: { fontSize: Typography.sizes.caption, fontFamily: 'DMSans-Medium', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: Typography.sizes.label, fontFamily: 'DMSans-Regular' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadline: { fontSize: Typography.sizes.tiny, fontFamily: 'DMSans-Regular' },
});