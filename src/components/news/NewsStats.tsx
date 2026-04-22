// src/components/news/NewsStats.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing } from '@/config/theme';
import type { NewsItem, NewsCategory } from '@/types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface NewsStatsProps {
  articles: NewsItem[];
}

interface CategoryConfig {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface CategoryStat {
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  color: string;
}

export function NewsStats({ articles }: NewsStatsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  // Category config with icons and colors
  const getCategoryConfig = (category: string): CategoryConfig => {
    const configs: Record<string, CategoryConfig> = {
      crime: { icon: 'warning', color: colors.danger },
      safety: { icon: 'shield-checkmark', color: colors.success },
      traffic: { icon: 'car', color: colors.warning },
      weather: { icon: 'cloud', color: colors.info },
      infrastructure: { icon: 'construct', color: '#9C27B0' },
      community: { icon: 'people', color: colors.primary },
      general: { icon: 'newspaper', color: colors.textSecondary },
      politics: { icon: 'megaphone', color: '#FF5722' },
      health: { icon: 'medical', color: '#E91E63' },
      accident: { icon: 'alert-circle', color: '#FF9800' },
      fire: { icon: 'flame', color: '#F44336' },
      water: { icon: 'water', color: '#03A9F4' },
      electricity: { icon: 'flash', color: '#FFC107' },
      other: { icon: 'ellipsis-horizontal', color: '#607D8B' },
    };
    return configs[category] || { icon: 'document', color: colors.textSecondary };
  };

  // Get translated category label
  const getCategoryLabel = (category: string): string => {
    const key = `news.categories.${category}`;
    const translated = t(key);
    return translated !== key 
      ? translated 
      : category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Calculate stats dynamically from articles
  const stats: CategoryStat[] = useMemo(() => {
    // Count articles by category
    const categoryCounts: Record<string, number> = {};
    articles.forEach((article) => {
      const cat = article.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Convert to stats array
    return Object.entries(categoryCounts)
      .map(([category, count]) => {
        const config = getCategoryConfig(category);
        return {
          category,
          icon: config.icon,
          count,
          color: config.color,
        };
      })
      .filter((stat) => stat.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [articles, colors]);

  const maxCount = Math.max(...stats.map((s) => s.count), 1);
  const totalCount = articles.length;

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  if (stats.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name="stats-chart"
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('news.stats.title')}
          </Text>
          <View style={[styles.totalBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.totalText}>{totalCount}</Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Stats Content */}
      {isExpanded && (
        <View style={styles.content}>
          {stats.map((stat) => (
            <View key={stat.category} style={styles.statRow}>
              {/* Icon and Label */}
              <View style={styles.statLabel}>
                <Ionicons
                  name={stat.icon}
                  size={14}
                  color={stat.color}
                  style={styles.statIcon}
                />
                <Text style={[styles.statLabelText, { color: colors.textSecondary }]}>
                  {getCategoryLabel(stat.category)}
                </Text>
              </View>

              {/* Bar */}
              <View style={[styles.barContainer, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${(stat.count / maxCount) * 100}%`,
                      backgroundColor: stat.color,
                    },
                  ]}
                />
              </View>

              {/* Count */}
              <Text style={[styles.statCount, { color: stat.color }]}>
                {stat.count}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
    marginLeft: Spacing.sm,
  },
  totalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: Spacing.sm,
  },
  totalText: {
    color: '#000000',
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  statIcon: {
    marginRight: 6,
  },
  statLabelText: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  statCount: {
    width: 28,
    textAlign: 'right',
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
  },
});