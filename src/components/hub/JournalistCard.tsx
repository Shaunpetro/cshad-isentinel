// src/components/hub/JournalistCard.tsx
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

export interface Journalist {
  id: string;
  name: string;
  handle?: string;
  outlet?: string;
  avatar?: string;
  avatarUrl?: string;
  isVerified: boolean;
  verificationType?: 'journalist' | 'official' | 'community';
  followerCount?: number;
  recentReports?: number;
  recentTopics?: string[];
  specialty?: string;
  isFollowing?: boolean;
}

interface JournalistCardProps {
  journalist: Journalist;
  onPress?: () => void;
  onFollow?: () => void;
  compact?: boolean;
}

export function JournalistCard({
  journalist,
  onPress,
  onFollow,
  compact = false,
}: JournalistCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Get verification config with translations
  const getVerificationConfig = (type: string) => {
    switch (type) {
      case 'journalist':
        return { color: '#9C27B0', label: t('journalist.types.journalist', 'Journalist') };
      case 'official':
        return { color: '#2196F3', label: t('journalist.types.official', 'Official') };
      case 'community':
        return { color: '#00BCD4', label: t('journalist.types.community', 'Community') };
      default:
        return { color: '#9C27B0', label: t('journalist.types.journalist', 'Journalist') };
    }
  };

  const verificationType = journalist.verificationType || 'journalist';
  const verificationConfig = getVerificationConfig(verificationType);
  const avatarSource = journalist.avatarUrl || journalist.avatar;
  const followerCount = journalist.followerCount || 0;
  const displayHandle = journalist.handle || journalist.outlet || '';

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  // Get reports text
  const getReportsText = (count: number): string => {
    return `${count} ${t('journalist.reports', 'reports')}`;
  };

  // Get recent reports text
  const getRecentReportsText = (count: number): string => {
    return `${count} ${t('journalist.recentReports', 'recent reports')}`;
  };

  // Get followers text
  const getFollowersText = (count: number): string => {
    return `${formatFollowers(count)} ${t('journalist.followers', 'followers')}`;
  };

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.compactContainer,
          { backgroundColor: colors.surface },
          pressed && styles.pressed,
        ]}
      >
        {/* Avatar */}
        <View style={styles.compactAvatarContainer}>
          {avatarSource ? (
            <Image source={{ uri: avatarSource }} style={styles.compactAvatar} />
          ) : (
            <View style={[styles.compactAvatarPlaceholder, { backgroundColor: verificationConfig.color + '20' }]}>
              <Ionicons name="person" size={20} color={verificationConfig.color} />
            </View>
          )}
          {journalist.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.surface }]}>
              <Ionicons name="checkmark-circle" size={14} color={verificationConfig.color} />
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={[styles.compactName, { color: colors.text }]} numberOfLines={1}>
          {journalist.name.split(' ')[0]}
        </Text>

        {/* Followers or Reports */}
        <Text style={[styles.compactFollowers, { color: colors.textSecondary }]}>
          {journalist.recentReports
            ? getReportsText(journalist.recentReports)
            : formatFollowers(followerCount)
          }
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {avatarSource ? (
          <Image source={{ uri: avatarSource }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: verificationConfig.color + '20' }]}>
            <Ionicons name="person" size={28} color={verificationConfig.color} />
          </View>
        )}
        {journalist.isVerified && (
          <View style={[styles.verifiedBadgeLarge, { backgroundColor: colors.surface }]}>
            <Ionicons name="checkmark-circle" size={18} color={verificationConfig.color} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {journalist.name}
        </Text>
        {displayHandle && (
          <Text style={[styles.handle, { color: colors.textSecondary }]} numberOfLines={1}>
            {displayHandle.startsWith('@') ? displayHandle : `@${displayHandle}`}
          </Text>
        )}
        <View style={styles.metaRow}>
          <View style={[styles.typeBadge, { backgroundColor: verificationConfig.color + '20' }]}>
            <Text style={[styles.typeText, { color: verificationConfig.color }]}>
              {journalist.specialty || verificationConfig.label}
            </Text>
          </View>
          <Text style={[styles.followers, { color: colors.textSecondary }]}>
            {journalist.recentReports
              ? getRecentReportsText(journalist.recentReports)
              : getFollowersText(followerCount)
            }
          </Text>
        </View>
      </View>

      {/* Follow Button */}
      {onFollow && (
        <Pressable
          onPress={onFollow}
          style={({ pressed }) => [
            styles.followButton,
            journalist.isFollowing
              ? { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }
              : { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.followText,
              { color: journalist.isFollowing ? colors.text : '#FFFFFF' },
            ]}
          >
            {journalist.isFollowing ? t('journalist.following', 'Following') : t('journalist.follow', 'Follow')}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Compact styles
  compactContainer: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    width: 80,
    ...Shadows.sm,
  },
  compactAvatarContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  compactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  compactAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 10,
    padding: 2,
  },
  compactName: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
    textAlign: 'center',
  },
  compactFollowers: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
    textAlign: 'center',
  },

  // Full card styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadgeLarge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 12,
    padding: 2,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  handle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.medium,
  },
  followers: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  followButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  followText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
  },
});

export default JournalistCard;