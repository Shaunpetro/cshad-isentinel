// src/components/news/BreakingNewsCarousel.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing } from '@/config/theme';
import type { NewsItem } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_MARGIN = Spacing.sm;

interface BreakingNewsCarouselProps {
  articles: NewsItem[];
  onArticlePress: (article: NewsItem) => void;
}

export function BreakingNewsCarousel({
  articles,
  onArticlePress,
}: BreakingNewsCarouselProps) {
  const { colors } = useTheme();

  if (articles.length === 0) {
    return null;
  }

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return colors.danger;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.info;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.liveIndicator, { backgroundColor: colors.danger }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>BREAKING</Text>
          </View>
        </View>
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          {articles.length} alerts
        </Text>
      </View>

      {/* Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        snapToAlignment="start"
      >
        {articles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderLeftColor: getSeverityColor(article.severity),
                borderColor: colors.border,
              },
            ]}
            onPress={() => onArticlePress(article)}
            activeOpacity={0.8}
          >
            {/* Severity Badge */}
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(article.severity) },
              ]}
            >
              <Text style={styles.severityText}>
                {article.severity.toUpperCase()}
              </Text>
            </View>

            {/* Content */}
            <Text
              style={[styles.cardTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {article.title}
            </Text>

            <Text
              style={[styles.cardSummary, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {article.summary}
            </Text>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.locationRow}>
                <Ionicons
                  name="location"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.locationText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {article.locationName || 'Unknown'}
                </Text>
              </View>
              <Text style={[styles.timeText, { color: colors.primary }]}>
                {getTimeAgo(article.publishedAt)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 1,
  },
  countText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg - CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    padding: Spacing.md,
    marginHorizontal: CARD_MARGIN,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  cardSummary: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    marginLeft: 4,
    flex: 1,
  },
  timeText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
  },
});