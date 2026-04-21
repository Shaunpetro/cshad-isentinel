// src/components/hub/FeedCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius, Shadows } from '@/config/theme';

// Extended type to include weather and infrastructure
export type FeedItemType = 'news' | 'tip' | 'report' | 'official' | 'breaking' | 'weather' | 'infrastructure';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  summary?: string;
  description?: string;
  source: string | {
    name: string;
    avatar?: string;
    isVerified?: boolean;
  };
  sourceType?: 'rss' | 'community' | 'official' | 'journalist';
  location?: string | {
    latitude: number;
    longitude: number;
  };
  locationName?: string;
  distance?: string;
  timestamp: string | Date;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  category?: string;
  imageUrl?: string;
  stats?: {
    views?: number;
    comments?: number;
    shares?: number;
  };
  isBreaking?: boolean;
  isVerified?: boolean;
}

interface FeedCardProps {
  item: FeedItem;
  onPress?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
  onViewMap?: () => void;
}

const TYPE_CONFIG: Record<FeedItemType, {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = {
  news: { label: 'NEWS', icon: 'newspaper', color: '#00D4AA' },
  tip: { label: 'COMMUNITY TIP', icon: 'chatbubble-ellipses', color: '#FF9800' },
  report: { label: 'JOURNALIST REPORT', icon: 'document-text', color: '#9C27B0' },
  official: { label: 'OFFICIAL', icon: 'shield-checkmark', color: '#2196F3' },
  breaking: { label: 'BREAKING', icon: 'flash', color: '#FF1744' },
  weather: { label: 'WEATHER ALERT', icon: 'cloudy', color: '#03A9F4' },
  infrastructure: { label: 'INFRASTRUCTURE', icon: 'construct', color: '#795548' },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#FF1744',
  high: '#FF5722',
  medium: '#FFC107',
  low: '#4CAF50',
};

export function FeedCard({
  item,
  onPress,
  onShare,
  onFollow,
  onViewMap,
}: FeedCardProps) {
  const { colors } = useTheme();
  
  // Determine the display type
  const displayType = item.isBreaking ? 'breaking' : item.type;
  const typeConfig = TYPE_CONFIG[displayType] || TYPE_CONFIG.news;
  const severityColor = item.severity ? SEVERITY_COLORS[item.severity] : undefined;

  // Normalize source to object format
  const sourceObj = typeof item.source === 'string' 
    ? { name: item.source, isVerified: item.isVerified }
    : item.source;

  // Get location display string
  const locationDisplay = item.locationName || 
    (typeof item.location === 'string' ? item.location : undefined);

  // Get description (support both summary and description)
  const descriptionText = item.summary || item.description;

  const formatNumber = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatTimestamp = (timestamp: string | Date): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
    >
      {/* Severity indicator bar */}
      {severityColor && (
        <View style={[styles.severityBar, { backgroundColor: severityColor }]} />
      )}

      {/* Header */}
      <View style={styles.header}>
        {/* Source info */}
        <View style={styles.sourceContainer}>
          {sourceObj.avatar ? (
            <Image source={{ uri: sourceObj.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: typeConfig.color + '20' }]}>
              <Ionicons name={typeConfig.icon} size={16} color={typeConfig.color} />
            </View>
          )}
          <View style={styles.sourceInfo}>
            <View style={styles.sourceNameRow}>
              <Text style={[styles.sourceName, { color: colors.text }]} numberOfLines={1}>
                {sourceObj.name}
              </Text>
              {sourceObj.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color={colors.info} />
              )}
            </View>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>

        {/* Type badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '20' }]}>
          <Ionicons name={typeConfig.icon} size={12} color={typeConfig.color} />
          <Text style={[styles.typeLabel, { color: typeConfig.color }]}>
            {typeConfig.label}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Breaking indicator */}
        {item.isBreaking && (
          <View style={[styles.breakingBadge, { backgroundColor: colors.danger }]}>
            <Ionicons name="flash" size={12} color="#FFFFFF" />
            <Text style={styles.breakingText}>BREAKING</Text>
          </View>
        )}

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        {descriptionText && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
            {descriptionText}
          </Text>
        )}

        {/* Image */}
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Location */}
        {locationDisplay && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.primary }]}>
              {locationDisplay}
            </Text>
            {item.distance && (
              <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
                • {item.distance}
              </Text>
            )}
          </View>
        )}

        {/* Unverified warning for tips */}
        {item.type === 'tip' && !item.isVerified && (
          <View style={[styles.unverifiedBadge, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="alert-circle" size={12} color={colors.warning} />
            <Text style={[styles.unverifiedText, { color: colors.warning }]}>
              Unverified community report
            </Text>
          </View>
        )}

        {/* Weather alert indicator */}
        {item.type === 'weather' && (
          <View style={[styles.unverifiedBadge, { backgroundColor: '#03A9F4' + '20' }]}>
            <Ionicons name="cloudy" size={12} color="#03A9F4" />
            <Text style={[styles.unverifiedText, { color: '#03A9F4' }]}>
              Weather Service Alert
            </Text>
          </View>
        )}

        {/* Infrastructure alert indicator */}
        {item.type === 'infrastructure' && (
          <View style={[styles.unverifiedBadge, { backgroundColor: '#795548' + '20' }]}>
            <Ionicons name="construct" size={12} color="#795548" />
            <Text style={[styles.unverifiedText, { color: '#795548' }]}>
              Infrastructure Update
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        {/* Stats */}
        <View style={styles.stats}>
          {item.stats?.views !== undefined && (
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {formatNumber(item.stats.views)}
              </Text>
            </View>
          )}
          {item.stats?.comments !== undefined && (
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {formatNumber(item.stats.comments)}
              </Text>
            </View>
          )}
          {/* Show category if no stats */}
          {!item.stats?.views && !item.stats?.comments && item.category && (
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.category}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onViewMap && (
            <Pressable onPress={onViewMap} style={styles.actionButton}>
              <Ionicons name="map-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
          {onShare && (
            <Pressable onPress={onShare} style={styles.actionButton}>
              <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
          {onFollow && (
            <Pressable onPress={onFollow} style={styles.actionButton}>
              <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
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
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  severityBar: {
    height: 3,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    paddingBottom: 0,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceName: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
  },
  timestamp: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  typeLabel: {
    fontSize: 10,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 0.5,
  },
  content: {
    padding: Spacing.md,
  },
  breakingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  breakingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    lineHeight: Typography.sizes.body * 1.3,
  },
  description: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    lineHeight: Typography.sizes.caption * 1.5,
    marginTop: Spacing.xs,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 4,
  },
  locationText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
  },
  distanceText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
    marginTop: Spacing.sm,
  },
  unverifiedText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
});