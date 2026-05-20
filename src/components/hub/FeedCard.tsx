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
import { useTranslation } from 'react-i18next';      
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius, Shadows } from '@/config/theme';

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

const TYPE_ICONS: Record<FeedItemType, {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = {
  news: { icon: 'newspaper', color: '#00D4AA' },
  tip: { icon: 'chatbubble-ellipses', color: '#FF9800' },
  report: { icon: 'document-text', color: '#9C27B0' },
  official: { icon: 'shield-checkmark', color: '#2196F3' },
  breaking: { icon: 'flash', color: '#FF1744' },
  weather: { icon: 'cloudy', color: '#03A9F4' },
  infrastructure: { icon: 'construct', color: '#795548' },
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
  const { t } = useTranslation();

  const getTypeLabel = (type: FeedItemType, isBreaking?: boolean): string => {
    if (isBreaking) return t('news.breaking');
    switch (type) {
      case 'news': return t('tabs.news').toUpperCase();
      case 'tip': return t('alerts.communityTips').toUpperCase();
      case 'report': return t('feed.journalistReport', 'JOURNALIST REPORT');
      case 'official': return t('feed.official', 'OFFICIAL');
      case 'breaking': return t('news.breaking');    
      case 'weather': return t('alerts.weather.alert');
      case 'infrastructure': return t('alerts.infrastructure').toUpperCase();
    }
  };

  const displayType = item.isBreaking ? 'breaking' : item.type;
  const typeConfig = TYPE_ICONS[displayType] || TYPE_ICONS.news;
  const severityColor = item.severity ? SEVERITY_COLORS[item.severity] : undefined;

  const sourceObj = typeof item.source === 'string'  
    ? { name: item.source, isVerified: item.isVerified }
    : item.source;

  const locationDisplay = item.locationName ||
    (typeof item.location === 'string' ? item.location : undefined);

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

    if (diffMins < 1) return t('time.justNow');
    if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  const getCategoryLabel = (category: string): string => {
    const key = `news.categories.${category.toLowerCase()}`;
    const translated = t(key);
    return translated !== key ? translated : category;
  };

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
      {severityColor && (
        <View style={[styles.severityBar, { backgroundColor: severityColor }]} />
      )}

      <View style={styles.header}>
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
              {sourceObj.isVerified && item.sourceType === 'journalist' ? (
                <View style={[styles.verifiedJournalistBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                  <Text style={[styles.verifiedJournalistText, { color: colors.primary }]}>
                    {t('journalist.verifiedBadge', 'Verified Journalist')}
                  </Text>
                </View>
              ) : sourceObj.isVerified ? (
                <Ionicons name="checkmark-circle" size={14} color={colors.info} />
              ) : null}
            </View>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatTimestamp(item.timestamp)}      
            </Text>
          </View>
        </View>

        <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '20' }]}>
          <Ionicons name={typeConfig.icon} size={12} color={typeConfig.color} />
          <Text style={[styles.typeLabel, { color: typeConfig.color }]}>
            {getTypeLabel(item.type, item.isBreaking)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {item.isBreaking && (
          <View style={[styles.breakingBadge, { backgroundColor: colors.danger }]}>
            <Ionicons name="flash" size={12} color="#FFFFFF" />
            <Text style={styles.breakingText}>{t('news.breaking')}</Text>
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

        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

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

        {item.type === 'tip' && !item.isVerified && (
          <View style={[styles.unverifiedBadge, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="alert-circle" size={12} color={colors.warning} />
            <Text style={[styles.unverifiedText, { color: colors.warning }]}>
              {t('news.unverified')} {t('alerts.communityTips').toLowerCase()}
            </Text>
          </View>
        )}

        {item.type === 'weather' && (
          <View style={[styles.unverifiedBadge, { backgroundColor: '#03A9F4' + '20' }]}>
            <Ionicons name="cloudy" size={12} color="#03A9F4" />
            <Text style={[styles.unverifiedText, { color: '#03A9F4' }]}>
              {t('alerts.weather.title')}
            </Text>
          </View>
        )}

        {item.type === 'infrastructure' && (
          <View style={[styles.unverifiedBadge, { backgroundColor: '#795548' + '20' }]}>
            <Ionicons name="construct" size={12} color="#795548" />
            <Text style={[styles.unverifiedText, { color: '#795548' }]}>
              {t('alerts.infrastructure')}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
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
          {!item.stats?.views && !item.stats?.comments && item.category && (
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {getCategoryLabel(item.category)}      
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          {onViewMap && (
            <Pressable
              onPress={onViewMap}
              style={styles.actionButton}
              accessibilityLabel="View on map"
            >
              <Ionicons name="map-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
          {onShare && (
            <Pressable
              onPress={onShare}
              style={styles.actionButton}
              accessibilityLabel="Share"
            >
              <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
          {onFollow && (
            <Pressable
              onPress={onFollow}
              style={styles.actionButton}
              accessibilityLabel="Follow story"      
            >
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
    flexWrap: 'wrap',
  },
  sourceName: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
  },
  verifiedJournalistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  verifiedJournalistText: {
    fontSize: 10,
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
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeedCard;