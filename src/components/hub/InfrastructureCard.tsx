// src/components/hub/InfrastructureCard.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import type { InfrastructureAlert, LoadsheddingStatus, InfrastructureType } from '@/services/infrastructure';

interface InfrastructureCardProps {
  alert?: InfrastructureAlert;
  loadshedding?: LoadsheddingStatus;
  onPress?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

/**
 * Get infrastructure alert icon
 */
function getInfrastructureIcon(type: InfrastructureType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'electricity':
      return 'flash';
    case 'water':
      return 'water';
    case 'roads':
      return 'car';
    case 'telecom':
      return 'cellular';
    default:
      return 'construct';
  }
}

/**
 * Get infrastructure alert color
 */
function getInfrastructureColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#D32F2F';
    case 'major':
      return '#F57C00';
    case 'minor':
      return '#FBC02D';
    default:
      return '#1976D2';
  }
}

export function InfrastructureCard({
  alert,
  loadshedding,
  onPress,
  onDismiss,
  compact = false,
}: InfrastructureCardProps) {
  const { colors } = useTheme();

  // Load shedding specific card
  if (loadshedding && loadshedding.stage > 0) {
    const stageColor = loadshedding.stage >= 6 ? '#D32F2F' : 
                       loadshedding.stage >= 4 ? '#F57C00' : '#FBC02D';

    return (
      <Pressable
        style={[
          styles.container,
          compact && styles.containerCompact,
          { 
            backgroundColor: colors.surface,
            borderLeftColor: stageColor,
          },
        ]}
        onPress={onPress}
      >
        {onDismiss && (
          <Pressable style={styles.dismissButton} onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={16} color={colors.textDisabled} />
          </Pressable>
        )}

        <View style={[styles.iconContainer, { backgroundColor: stageColor + '20' }]}>
          <Ionicons name="flash" size={compact ? 20 : 24} color={stageColor} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.typeLabel, { color: stageColor }]}>
              LOAD SHEDDING
            </Text>
            <View style={[styles.stageBadge, { backgroundColor: stageColor }]}>
              <Text style={styles.stageText}>Stage {loadshedding.stage}</Text>
            </View>
          </View>

          {!compact && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {getStageDescription(loadshedding.stage)}
            </Text>
          )}

          <View style={styles.footer}>
            <Text style={[styles.source, { color: colors.textDisabled }]}>
              {loadshedding.source}
            </Text>
            {loadshedding.nextStages && loadshedding.nextStages.length > 0 && (
              <Text style={[styles.nextStage, { color: colors.textSecondary }]}>
                Stage {loadshedding.nextStages[0].stage} at{' '}
                {formatTime(loadshedding.nextStages[0].startTime)}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  // Generic infrastructure alert card
  if (alert) {
    const alertColor = getInfrastructureColor(alert.severity);
    const alertIcon = getInfrastructureIcon(alert.type);

    return (
      <Pressable
        style={[
          styles.container,
          compact && styles.containerCompact,
          { 
            backgroundColor: colors.surface,
            borderLeftColor: alertColor,
          },
        ]}
        onPress={onPress}
      >
        {onDismiss && (
          <Pressable style={styles.dismissButton} onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={16} color={colors.textDisabled} />
          </Pressable>
        )}

        <View style={[styles.iconContainer, { backgroundColor: alertColor + '20' }]}>
          <Ionicons name={alertIcon} size={compact ? 20 : 24} color={alertColor} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.typeLabel, { color: alertColor }]}>
              {alert.type.toUpperCase()}
            </Text>
            <Text style={[styles.severity, { color: alertColor }]}>
              {alert.severity.toUpperCase()}
            </Text>
          </View>

          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={compact ? 1 : 2}
          >
            {alert.title}
          </Text>

          {!compact && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {alert.description}
            </Text>
          )}

          <View style={styles.footer}>
            {alert.affectedAreas && alert.affectedAreas.length > 0 && (
              <View style={styles.areaRow}>
                <Ionicons name="location" size={12} color={colors.textDisabled} />
                <Text style={[styles.areaText, { color: colors.textDisabled }]} numberOfLines={1}>
                  {alert.affectedAreas.join(', ')}
                </Text>
              </View>
            )}
            <Text style={[styles.source, { color: colors.textDisabled }]}>
              {alert.source}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return null;
}

function getStageDescription(stage: number): string {
  if (stage >= 6) return 'Severe power cuts expected. Prepare for extended outages.';
  if (stage >= 4) return 'Significant power cuts. Check your schedule.';
  if (stage >= 2) return 'Moderate power cuts in effect.';
  return 'Light power cuts. Limited impact expected.';
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    gap: Spacing.sm,
  },
  containerCompact: {
    padding: Spacing.sm,
    marginVertical: 4,
  },
  dismissButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    zIndex: 1,
    padding: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 0.5,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stageText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
    color: '#FFFFFF',
  },
  severity: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
  },
  title: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: 4,
  },
  description: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    lineHeight: Typography.sizes.caption * 1.4,
    marginBottom: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  areaText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    flex: 1,
  },
  source: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  nextStage: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.medium,
  },
});

export default InfrastructureCard;