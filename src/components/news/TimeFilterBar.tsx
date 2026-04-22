// src/components/news/TimeFilterBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing } from '@/config/theme';
import type { TimeFilter } from '@/services/news';

interface TimeFilterBarProps {
  activeFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
  lastUpdated: Date | null;
}

interface FilterOption {
  id: TimeFilter;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'live', labelKey: 'time.live', icon: 'radio' },
  { id: 'today', labelKey: 'news.today', icon: 'today' },
  { id: 'week', labelKey: 'time.week', icon: 'calendar' },
  { id: 'month', labelKey: 'time.month', icon: 'calendar-outline' },
  { id: 'all', labelKey: 'news.all', icon: 'time' },
];

export function TimeFilterBar({
  activeFilter,
  onFilterChange,
  lastUpdated,
}: TimeFilterBarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t('time.justNow');
    if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
    return t('time.hoursAgo', { count: Math.floor(diffMins / 60) });
  };

  return (
    <View style={styles.container}>
      {/* Filter Options */}
      <View style={[styles.filterRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option.id;
          const isLive = option.id === 'live';

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterOption,
                isActive && [styles.filterOptionActive, { backgroundColor: colors.primary }],
              ]}
              onPress={() => onFilterChange(option.id)}
              activeOpacity={0.7}
            >
              {isLive && isActive && <View style={styles.liveDot} />}
              <Ionicons
                name={option.icon}
                size={14}
                color={isActive ? '#000000' : colors.textSecondary}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterLabel,
                  { color: isActive ? '#000000' : colors.textSecondary },
                  isActive && styles.filterLabelActive,
                ]}
              >
                {t(option.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Last Updated */}
      {lastUpdated && (
        <View style={styles.lastUpdatedRow}>
          <Ionicons name="sync" size={12} color={colors.textDisabled} />
          <Text style={[styles.lastUpdatedText, { color: colors.textDisabled }]}>
            {t('news.lastUpdated')} {formatLastUpdated(lastUpdated)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
  },
  filterOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  filterOptionActive: {},
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4757',
    marginRight: 4,
  },
  filterIcon: {
    marginRight: 3,
  },
  filterLabel: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
  },
  filterLabelActive: {
    fontFamily: Typography.fonts.bold,
  },
  lastUpdatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  lastUpdatedText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
});