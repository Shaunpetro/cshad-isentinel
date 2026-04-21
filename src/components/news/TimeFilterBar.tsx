// src/components/news/TimeFilterBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'live', label: 'Live', icon: 'radio' },
  { id: 'today', label: 'Today', icon: 'today' },
  { id: 'week', label: 'Week', icon: 'calendar' },
  { id: 'month', label: 'Month', icon: 'calendar-outline' },
  { id: 'all', label: 'All', icon: 'time' },
];

export function TimeFilterBar({
  activeFilter,
  onFilterChange,
  lastUpdated,
}: TimeFilterBarProps) {
  const { colors } = useTheme();

  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
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
                {option.label}
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
            Updated {formatLastUpdated(lastUpdated)}
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
  filterOptionActive: {
    // backgroundColor set dynamically
  },
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