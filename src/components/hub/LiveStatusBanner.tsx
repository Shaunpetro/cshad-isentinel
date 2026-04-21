// src/components/hub/LiveStatusBanner.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';

interface LiveStatusBannerProps {
  activeIncidents: number;
  breakingCount: number;
  onViewIncidents?: () => void;
  onViewBreaking?: () => void;
}

export function LiveStatusBanner({
  activeIncidents,
  breakingCount,
  onViewIncidents,
  onViewBreaking,
}: LiveStatusBannerProps) {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for live indicator
  useEffect(() => {
    if (activeIncidents > 0 || breakingCount > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
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
  }, [activeIncidents, breakingCount, pulseAnim]);

  const hasActivity = activeIncidents > 0 || breakingCount > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Live Indicator */}
      <Animated.View
        style={[
          styles.liveIndicator,
          {
            backgroundColor: hasActivity ? colors.danger : colors.success,
            opacity: hasActivity ? pulseAnim : 1,
          },
        ]}
      />

      {/* Status Content */}
      <View style={styles.content}>
        {/* Active Incidents */}
        <Pressable
          onPress={onViewIncidents}
          style={({ pressed }) => [
            styles.statusItem,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.danger + '20' }]}>
            <Ionicons name="warning" size={16} color={colors.danger} />
          </View>
          <View style={styles.statusText}>
            <Text style={[styles.statusCount, { color: colors.text }]}>
              {activeIncidents}
            </Text>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Active
            </Text>
          </View>
        </Pressable>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Breaking Stories */}
        <Pressable
          onPress={onViewBreaking}
          style={({ pressed }) => [
            styles.statusItem,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="flash" size={16} color={colors.warning} />
          </View>
          <View style={styles.statusText}>
            <Text style={[styles.statusCount, { color: colors.text }]}>
              {breakingCount}
            </Text>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Breaking
            </Text>
          </View>
        </Pressable>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Live Badge */}
        <View style={styles.liveBadge}>
          <Animated.View
            style={[
              styles.liveDot,
              {
                backgroundColor: hasActivity ? colors.danger : colors.success,
                opacity: pulseAnim,
              },
            ]}
          />
          <Text style={[styles.liveText, { color: hasActivity ? colors.danger : colors.success }]}>
            {hasActivity ? 'LIVE' : 'CLEAR'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  liveIndicator: {
    height: 3,
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    flex: 1,
  },
  statusCount: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    lineHeight: Typography.sizes.heading + 2,
  },
  statusLabel: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 36,
    marginHorizontal: Spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 1,
  },
});