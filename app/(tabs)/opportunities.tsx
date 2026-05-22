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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts';
import { useOpportunities } from '@/hooks/useOpportunities';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { OpportunityDetailModal } from '@/components/opportunities/OpportunityDetailModal';
import { FilterSheet } from '@/components/opportunities/FilterSheet';
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
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // Test subscription toggle
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Extract filter options
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

  // Filter state
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedSubmissionType, setSelectedSubmissionType] = useState<string | null>(null);

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedProvince) count++;
    if (selectedSubcategory) count++;
    if (selectedSubmissionType) count++;
    return count;
  }, [selectedProvince, selectedSubcategory, selectedSubmissionType]);

  const filteredOpportunities = useMemo(() => {
    let list = opportunities;
    if (selectedProvince) list = list.filter((opp) => opp.province === selectedProvince);
    if (selectedSubcategory) list = list.filter((opp) => opp.subcategory === selectedSubcategory);
    if (selectedSubmissionType) list = list.filter((opp) => opp.submission_type === selectedSubmissionType);
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

  const handleApplyFilters = () => {
    setFilterSheetVisible(false);
  };

  const handleClearFilters = () => {
    setSelectedProvince(null);
    setSelectedSubcategory(null);
    setSelectedSubmissionType(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Tabs + Filter Button */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <View style={styles.tabsRow}>
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
        <Pressable
          style={styles.filterButton}
          onPress={() => setFilterSheetVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color={colors.text} />
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Subscription Toggle (for testing) */}
      <Pressable
        style={[styles.toggleButton, { backgroundColor: isSubscribed ? colors.success : colors.warning }]}
        onPress={() => setIsSubscribed(!isSubscribed)}
      >
        <Text style={styles.toggleButtonText}>
          {isSubscribed ? 'Premium Subscribed' : 'Free User (Tap to subscribe)'}
        </Text>
      </Pressable>

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

      {/* Filter Sheet */}
      <FilterSheet
        visible={filterSheetVisible}
        provinces={filterOptions.provinces}
        subcategories={filterOptions.subcategories}
        submissionTypes={filterOptions.submissionTypes}
        selectedProvince={selectedProvince}
        selectedSubcategory={selectedSubcategory}
        selectedSubmissionType={selectedSubmissionType}
        onSelectProvince={setSelectedProvince}
        onSelectSubcategory={setSelectedSubcategory}
        onSelectSubmissionType={setSelectedSubmissionType}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClose={() => setFilterSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 0.5,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, gap: 4 },
  tabText: { fontSize: Typography.sizes.label },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
  },
  toggleButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  toggleButtonText: { color: '#FFFFFF', fontFamily: 'DMSans-Bold', fontSize: Typography.sizes.label },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingTop: Spacing.md },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyText: { fontSize: Typography.sizes.body, fontFamily: 'DMSans-Regular', marginTop: Spacing.md },
  errorText: { fontSize: Typography.sizes.body, fontFamily: 'DMSans-Medium', marginTop: Spacing.md, textAlign: 'center' },
});