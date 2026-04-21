// src/components/privacy/PrivacyTipCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/config/theme';
import { type PrivacyTip } from '@/services/privacy';

interface PrivacyTipCardProps {
  tips: PrivacyTip[];
}

export function PrivacyTipCard({ tips }: PrivacyTipCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={20} color={Colors.semantic.warning} />
        <Text style={styles.headerTitle}>Privacy Tips</Text>
      </View>

      {tips.map((tip, index) => (
        <View
          key={tip.id}
          style={[styles.tip, index < tips.length - 1 && styles.tipBorder]}
        >
          <View style={styles.tipIcon}>
            <Ionicons
              name={tip.icon as keyof typeof Ionicons.glyphMap}
              size={18}
              color={Colors.semantic.primary}
            />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDescription}>{tip.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.carbon.charcoal,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.carbon.steel,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.carbon.steel,
  },
  headerTitle: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginLeft: Spacing.sm,
  },
  tip: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  tipBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.carbon.steel,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.semantic.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
    marginBottom: 2,
  },
  tipDescription: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    lineHeight: 16,
  },
});