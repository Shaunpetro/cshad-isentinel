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
import type {
  InfrastructureAlert,
  LoadsheddingStatus,
  InfrastructureType,
  LoadsheddingSlot,
} from '@/services/infrastructure';

interface InfrastructureCardProps {
  alert?: InfrastructureAlert;
  loadshedding?: LoadsheddingStatus;
  onPress?: () => void;
  onDismiss?: () => void;
  onChangeArea?: () => void;
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

/**
 * Format time slot for display
 */
function formatTimeSlot(slot: LoadsheddingSlot): string {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
}

/**
 * Check if a slot is currently active
 */
function isSlotActive(slot: LoadsheddingSlot): boolean {
  const now = new Date();
  return slot.start <= now && slot.end >= now;
}

/**
 * Get relative time label for slot
 */
function getSlotLabel(slot: LoadsheddingSlot): string {
  const now = new Date();

  if (isSlotActive(slot)) {
    const minsLeft = Math.ceil((slot.end.getTime() - now.getTime()) / 60000);
    if (minsLeft <= 60) return `Ends in ${minsLeft}m`;
    return `Ends in ${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m`;
  }

  const minsUntil = Math.ceil((slot.start.getTime() - now.getTime()) / 60000);
  if (minsUntil <= 60) return `In ${minsUntil}m`;
  if (minsUntil <= 180) return `In ${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m`;

  // Check if it's today or tomorrow
  const slotDate = slot.start.toDateString();
  const todayDate = now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (slotDate === todayDate) return 'Today';
  if (slotDate === tomorrow.toDateString()) return 'Tomorrow';
  return slot.start.toLocaleDateString('en-ZA', { weekday: 'short' });
}

export function InfrastructureCard({
  alert,
  loadshedding,
  onPress,
  onDismiss,
  onChangeArea,
  compact = false,
}: InfrastructureCardProps) {
  const { colors } = useTheme();

  // Load shedding specific card
  if (loadshedding && loadshedding.stage > 0) {
    const stageColor =
      loadshedding.stage >= 6
        ? '#D32F2F'
        : loadshedding.stage >= 4
        ? '#F57C00'
        : '#FBC02D';

    const hasLocalSchedule =
      loadshedding.localSchedule && loadshedding.localSchedule.length > 0;
    const nextSlot = hasLocalSchedule ? loadshedding.localSchedule![0] : null;
    const isCurrentlyActive = nextSlot ? isSlotActive(nextSlot) : false;

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
            <Text style={[styles.typeLabel, { color: stageColor }]}>LOAD SHEDDING</Text>
            <View style={[styles.stageBadge, { backgroundColor: stageColor }]}>
              <Text style={styles.stageText}>Stage {loadshedding.stage}</Text>
            </View>
          </View>

          {/* Local Schedule Display */}
          {hasLocalSchedule && !compact && (
            <View style={styles.scheduleContainer}>
              {/* Next/Current Outage */}
              <View
                style={[
                  styles.nextOutage,
                  {
                    backgroundColor: isCurrentlyActive
                      ? stageColor + '20'
                      : colors.background,
                    borderColor: isCurrentlyActive ? stageColor : colors.border,
                  },
                ]}
              >
                <View style={styles.outageTime}>
                  <Ionicons
                    name={isCurrentlyActive ? 'flash' : 'time-outline'}
                    size={16}
                    color={isCurrentlyActive ? stageColor : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.outageTimeText,
                      { color: isCurrentlyActive ? stageColor : colors.text },
                    ]}
                  >
                    {formatTimeSlot(nextSlot!)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.outageLabel,
                    { color: isCurrentlyActive ? stageColor : colors.textSecondary },
                  ]}
                >
                  {getSlotLabel(nextSlot!)}
                </Text>
              </View>

              {/* Additional Slots */}
              {loadshedding.localSchedule!.length > 1 && (
                <View style={styles.additionalSlots}>
                  {loadshedding.localSchedule!.slice(1, 3).map((slot, index) => (
                    <Text
                      key={index}
                      style={[styles.additionalSlotText, { color: colors.textSecondary }]}
                    >
                      {formatTimeSlot(slot)}
                    </Text>
                  ))}
                  {loadshedding.localSchedule!.length > 3 && (
                    <Text style={[styles.moreSlots, { color: colors.textDisabled }]}>
                      +{loadshedding.localSchedule!.length - 3} more
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* No Local Schedule - Prompt to Select Area */}
          {!hasLocalSchedule && !compact && (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {getStageDescription(loadshedding.stage)}
            </Text>
          )}

          <View style={styles.footer}>
            {/* Source / Location */}
            <View style={styles.sourceRow}>
              {loadshedding.suburbName ? (
                <View style={styles.locationBadge}>
                  <Ionicons name="location" size={12} color={colors.primary} />
                  <Text
                    style={[styles.locationText, { color: colors.primary }]}
                    numberOfLines={1}
                  >
                    {loadshedding.suburbName}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.source, { color: colors.textDisabled }]}>
                  {loadshedding.source}
                </Text>
              )}
            </View>

            {/* Change Area Button */}
            {onChangeArea && (
              <Pressable
                style={[styles.changeAreaButton, { backgroundColor: colors.primary + '15' }]}
                onPress={onChangeArea}
                hitSlop={8}
              >
                <Ionicons
                  name={loadshedding.suburbName ? 'swap-horizontal' : 'add'}
                  size={14}
                  color={colors.primary}
                />
                <Text style={[styles.changeAreaText, { color: colors.primary }]}>
                  {loadshedding.suburbName ? 'Change' : 'Set Area'}
                </Text>
              </Pressable>
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
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {alert.description}
            </Text>
          )}

          <View style={styles.footer}>
            {alert.affectedAreas && alert.affectedAreas.length > 0 && (
              <View style={styles.areaRow}>
                <Ionicons name="location" size={12} color={colors.textDisabled} />
                <Text
                  style={[styles.areaText, { color: colors.textDisabled }]}
                  numberOfLines={1}
                >
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
  scheduleContainer: {
    marginBottom: Spacing.sm,
  },
  nextOutage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  outageTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  outageTimeText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  outageLabel: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  additionalSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  additionalSlotText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    backgroundColor: 'rgba(128,128,128,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moreSlots: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceRow: {
    flex: 1,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.medium,
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
  changeAreaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  changeAreaText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.medium,
  },
});

export default InfrastructureCard;