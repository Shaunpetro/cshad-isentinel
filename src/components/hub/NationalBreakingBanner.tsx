// src/components/hub/NationalBreakingBanner.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';

export interface NationalAlert {
  id: string;
  title: string;
  summary: string;
  severity: 'critical' | 'high' | 'medium';
  category: string;
  timestamp: Date;
  source: string;
}

interface NationalBreakingBannerProps {
  alerts: NationalAlert[];
  maxDisplay?: number;
  onAlertPress?: (alert: NationalAlert) => void;
  onDismiss?: (alertId: string) => void;
  onDismissAll?: () => void;
}

export function NationalBreakingBanner({
  alerts,
  maxDisplay = 2,
  onAlertPress,
  onDismiss,
  onDismissAll,
}: NationalBreakingBannerProps) {
  const { colors } = useTheme();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Filter out dismissed alerts and limit to maxDisplay
  const visibleAlerts = alerts
    .filter((a) => !dismissedIds.has(a.id))
    .slice(0, maxDisplay);

  // Pulse animation for critical alerts
  useEffect(() => {
    if (visibleAlerts.some((a) => a.severity === 'critical')) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [visibleAlerts, pulseAnim]);

  const handleDismiss = (alertId: string) => {
    setDismissedIds((prev) => new Set(prev).add(alertId));
    onDismiss?.(alertId);
  };

  const handleDismissAll = () => {
    const allIds = new Set(visibleAlerts.map((a) => a.id));
    setDismissedIds((prev) => new Set([...prev, ...allIds]));
    onDismissAll?.();
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#D32F2F';
      case 'high':
        return '#F57C00';
      default:
        return '#FBC02D';
    }
  };

  const getSeverityIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const cat = category.toLowerCase();
    if (cat.includes('traffic') || cat.includes('road')) return 'car';
    if (cat.includes('power') || cat.includes('electric')) return 'flash';
    if (cat.includes('water')) return 'water';
    if (cat.includes('weather')) return 'thunderstorm';
    if (cat.includes('crime') || cat.includes('safety')) return 'warning';
    return 'megaphone';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={{ opacity: pulseAnim }}>
            <Ionicons name="radio" size={16} color="#D32F2F" />
          </Animated.View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            National Alerts
          </Text>
          <View style={[styles.badge, { backgroundColor: '#D32F2F' }]}>
            <Text style={styles.badgeText}>{visibleAlerts.length}</Text>
          </View>
        </View>
        
        {visibleAlerts.length > 1 && (
          <Pressable onPress={handleDismissAll} hitSlop={8}>
            <Text style={[styles.dismissAllText, { color: colors.textSecondary }]}>
              Dismiss all
            </Text>
          </Pressable>
        )}
      </View>

      {/* Alerts */}
      <ScrollView
        horizontal={visibleAlerts.length > 1}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.alertsContainer}
      >
        {visibleAlerts.map((alert) => {
          const severityColor = getSeverityColor(alert.severity);
          const icon = getSeverityIcon(alert.category);

          return (
            <Pressable
              key={alert.id}
              style={[
                styles.alertCard,
                {
                  backgroundColor: colors.surface,
                  borderLeftColor: severityColor,
                  width: visibleAlerts.length > 1 ? 280 : '100%',
                },
              ]}
              onPress={() => onAlertPress?.(alert)}
            >
              {/* Dismiss button */}
              <Pressable
                style={styles.alertDismiss}
                onPress={() => handleDismiss(alert.id)}
                hitSlop={8}
              >
                <Ionicons name="close" size={16} color={colors.textDisabled} />
              </Pressable>

              {/* Icon */}
              <View style={[styles.alertIcon, { backgroundColor: severityColor + '20' }]}>
                <Ionicons name={icon} size={20} color={severityColor} />
              </View>

              {/* Content */}
              <View style={styles.alertContent}>
                <View style={styles.alertMeta}>
                  <Text style={[styles.alertCategory, { color: severityColor }]}>
                    {alert.category.toUpperCase()}
                  </Text>
                  <Text style={[styles.alertTime, { color: colors.textDisabled }]}>
                    {formatTimeAgo(alert.timestamp)}
                  </Text>
                </View>
                <Text
                  style={[styles.alertTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {alert.title}
                </Text>
                <Text
                  style={[styles.alertSummary, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {alert.summary}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
    color: '#FFFFFF',
  },
  dismissAllText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
  alertsContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  alertCard: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    gap: Spacing.sm,
  },
  alertDismiss: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    zIndex: 1,
    padding: 4,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  alertCategory: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 0.5,
  },
  alertTime: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  alertTitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
    lineHeight: Typography.sizes.caption * 1.3,
    marginBottom: 2,
  },
  alertSummary: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
});

export default NationalBreakingBanner;