// app/(tabs)/opportunities.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts';
import { useOpportunities } from '@/hooks/useOpportunities';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { OpportunityDetailModal } from '@/components/opportunities/OpportunityDetailModal';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import type { Opportunity } from '@/services/opportunities';

type Category = 'tender' | 'job' | 'bursary';

const TOP_TABS: { key: Category; icon: string; labelKey: string }[] = [
  { key: 'tender', icon: 'document-text', labelKey: 'opportunities.tenders' },
  { key: 'job', icon: 'briefcase', labelKey: 'opportunities.jobs' },
  { key: 'bursary', icon: 'school', labelKey: 'opportunities.bursaries' },
];

export default function OpportunitiesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>('tender');
  const { opportunities, isLoading, isRefreshing, error, refresh } = useOpportunities(activeCategory);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock subscription flag
  const isSubscribed = false;

  // Extract filter options from current opportunities
  const filterOptions = useMemo(() => {
    const provinces = new Set<string>();
    const subcategories = new Set<string>();
    const submissionTypes = new Set<string>();

    opportunities.forEach((opp) => {
      if (opp.province) provinces.add(opp.province);
      if (opp.subcategory) subcategories.add(opp.subcategory);
      if (opp.submission_type) submissionTypes.add(opp.submission_type);
    });

    return {
      provinces: Array.from(provinces),
      subcategories: Array.from(subcategories),
      submissionTypes: Array.from(submissionTypes),
    };
  }, [opportunities]);

  // Selected filters
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedSubmissionType, setSelectedSubmissionType] = useState<string | null>(null);

  // Apply local filters
  const filteredOpportunities = useMemo(() => {
    let list = opportunities;
    if (selectedProvince) {
      list = list.filter((opp) => opp.province === selectedProvince);
    }
    if (selectedSubcategory) {
      list = list.filter((opp) => opp.subcategory === selectedSubcategory);
    }
    if (selectedSubmissionType) {
      list = list.filter((opp) => opp.submission_type === selectedSubmissionType);
    }
    return list;
  }, [opportunities, selectedProvince, selectedSubcategory, selectedSubmissionType]);

  const handlePress = useCallback((item: Opportunity) => {
    setSelectedOpportunity(item);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Opportunity }) => (
      <OpportunityCard opportunity={item} onPress={() => handlePress(item)} isSubscribed={isSubscribed} />
    ),
    [handlePress, isSubscribed],
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Ionicons name="rocket-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No opportunities found</Text>
      </View>
    );
  };

  const renderFilterChips = (
    options: string[],
    selected: string | null,
    onSelect: (value: string | null) => void
  ) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
      {options.map((option) => {
        const isActive = selected === option;
        return (
          <Pressable
            key={option}
            style={[
              styles.filterChip,
              {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(isActive ? null : option)}
          >
            <Text style={[styles.filterChipText, { color: isActive ? '#FFFFFF' : colors.text }]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Tabs */}
      <View style={[styles.topTabs, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        {TOP_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              activeCategory === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveCategory(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeCategory === tab.key ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeCategory === tab.key ? colors.primary : colors.textSecondary,
                  fontFamily: activeCategory === tab.key ? 'DMSans-Bold' : 'DMSans-Medium',
                },
              ]}
            >
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Filters */}
      {filterOptions.provinces.length > 0 && (
        <View style={styles.filtersContainer}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Province</Text>
          {renderFilterChips(filterOptions.provinces, selectedProvince, setSelectedProvince)}
        </View>
      )}
      {filterOptions.subcategories.length > 0 && (
        <View style={styles.filtersContainer}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Category</Text>
          {renderFilterChips(filterOptions.subcategories, selectedSubcategory, setSelectedSubcategory)}
        </View>
      )}
      {filterOptions.submissionTypes.length > 0 && (
        <View style={styles.filtersContainer}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Submission</Text>
          {renderFilterChips(filterOptions.submissionTypes, selectedSubmissionType, setSelectedSubmissionType)}
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOpportunities}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[colors.primary]} />}
        />
      )}

      {/* Detail Modal */}
      <OpportunityDetailModal
        visible={modalVisible}
        opportunity={selectedOpportunity}
        isSubscribed={isSubscribed}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topTabs: { flexDirection: 'row', paddingTop: 60, paddingBottom: Spacing.sm, borderBottomWidth: 0.5 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, gap: 4 },
  tabText: { fontSize: Typography.sizes.label },
  filtersContainer: { paddingHorizontal: Spacing.md, marginTop: Spacing.sm },
  filterLabel: { fontSize: Typography.sizes.label, fontFamily: 'DMSans-Medium', marginBottom: 4 },
  filterRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: { fontSize: Typography.sizes.label, fontFamily: 'DMSans-Medium' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingTop: Spacing.md },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyText: { fontSize: Typography.sizes.body, fontFamily: 'DMSans-Regular', marginTop: Spacing.md },
  errorText: { fontSize: Typography.sizes.body, fontFamily: 'DMSans-Medium', marginTop: Spacing.md, textAlign: 'center' },
});