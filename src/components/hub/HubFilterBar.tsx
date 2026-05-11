// src/components/hub/HubFilterBar.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';

export type HubFilter = 'tips' | 'live' | 'weather' | 'infrastructure' | 'national' | 'hazards' | 'all';

interface FilterConfig {
  id: HubFilter;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeColor?: string;
}

const FILTERS: FilterConfig[] = [
  { id: 'tips', labelKey: 'alerts.communityTips', icon: 'chatbubbles', activeColor: '#FF9800' },
  { id: 'live', labelKey: 'time.live', icon: 'radio', activeColor: '#D32F2F' },
  { id: 'weather', labelKey: 'alerts.weather.title', icon: 'cloudy', activeColor: '#2196F3' },
  { id: 'infrastructure', labelKey: 'alerts.infrastructure', icon: 'flash', activeColor: '#9C27B0' },
  { id: 'hazards', labelKey: 'alerts.hazards', icon: 'warning', activeColor: '#FF6D00' },
  { id: 'national', labelKey: 'news.national', icon: 'globe', activeColor: '#4CAF50' },
  { id: 'all', labelKey: 'map.showAll', icon: 'list', activeColor: '#757575' },
];

interface HubFilterBarProps {
  activeFilter: HubFilter;
  onFilterChange: (filter: HubFilter) => void;
  counts?: Partial<Record<HubFilter, number>>;
}

export function HubFilterBar({
  activeFilter,
  onFilterChange,
  counts = {},
}: HubFilterBarProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const getShortLabel = (filter: FilterConfig): string => {
    const fullLabel = t(filter.labelKey);
    if (filter.id === 'infrastructure') return t('alerts.infrastructure').substring(0, 5);
    if (filter.id === 'hazards') return t('alerts.hazards').substring(0, 7);
    if (filter.id === 'tips') return t('map.showTips');
    return fullLabel;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          const count = counts[filter.id];
          const activeColor = filter.activeColor || colors.primary;

          return (
            <Pressable
              key={filter.id}
              style={[
                styles.filterButton,
                {
                  backgroundColor: isActive
                    ? activeColor
                    : isDark
                    ? colors.surface
                    : colors.background,
                  borderColor: isActive ? activeColor : colors.border,
                },
              ]}
              onPress={() => onFilterChange(filter.id)}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={isActive ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterLabel,
                  { color: isActive ? '#FFFFFF' : colors.text },
                ]}
              >
                {getShortLabel(filter)}
              </Text>
              {count !== undefined && count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isActive
                        ? 'rgba(255,255,255,0.3)'
                        : activeColor + '30',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      { color: isActive ? '#FFFFFF' : activeColor },
                    ]}
                  >
                    {count > 99 ? '99+' : count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  filterLabel: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
  },
});

export default HubFilterBar;