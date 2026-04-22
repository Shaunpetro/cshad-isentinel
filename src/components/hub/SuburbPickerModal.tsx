// src/components/hub/SuburbPickerModal.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import {
  searchSuburbs,
  getUserArea,
  saveUserArea,
  clearUserArea,
  type SavedArea,
} from '@/services/infrastructure';

interface SuburbPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuburbSelected: (area: SavedArea | null) => void;
}

export function SuburbPickerModal({
  visible,
  onClose,
  onSuburbSelected,
}: SuburbPickerModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SavedArea[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentArea, setCurrentArea] = useState<SavedArea | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load current area on mount
  useEffect(() => {
    if (visible) {
      loadCurrentArea();
      setSearchQuery('');
      setResults([]);
      setError(null);
    }
  }, [visible]);

  const loadCurrentArea = async () => {
    const area = await getUserArea();
    setCurrentArea(area);
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        const areas = await searchSuburbs(searchQuery);
        setResults(areas);

        if (areas.length === 0 && searchQuery.length >= 2) {
          setError('No areas found. Try a different search term.');
        }
      } catch (err) {
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectArea = useCallback(
    async (area: SavedArea) => {
      await saveUserArea(area);
      setCurrentArea(area);
      onSuburbSelected(area);
      onClose();
    },
    [onSuburbSelected, onClose]
  );

  const handleClearArea = useCallback(async () => {
    await clearUserArea();
    setCurrentArea(null);
    onSuburbSelected(null);
    onClose();
  }, [onSuburbSelected, onClose]);

  const renderAreaItem = useCallback(
    ({ item }: { item: SavedArea }) => {
      const isSelected = currentArea?.id === item.id;

      return (
        <Pressable
          style={[
            styles.areaItem,
            {
              backgroundColor: isSelected ? colors.primary + '15' : colors.surface,
              borderColor: isSelected ? colors.primary : colors.border,
            },
          ]}
          onPress={() => handleSelectArea(item)}
        >
          <View style={styles.areaInfo}>
            <Text
              style={[
                styles.areaName,
                { color: isSelected ? colors.primary : colors.text },
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={[styles.areaDetails, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.region}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </Pressable>
      );
    },
    [currentArea, colors, handleSelectArea]
  );

  const renderHeader = useCallback(
    () => (
      <View>
        {/* Current Selection */}
        {currentArea && (
          <View style={[styles.currentSection, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              CURRENT AREA
            </Text>
            <View
              style={[
                styles.currentArea,
                { backgroundColor: colors.primary + '15', borderColor: colors.primary },
              ]}
            >
              <View style={styles.currentInfo}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={styles.currentText}>
                  <Text style={[styles.currentName, { color: colors.primary }]}>
                    {currentArea.name}
                  </Text>
                  <Text style={[styles.currentDetails, { color: colors.textSecondary }]}>
                    {currentArea.region}
                  </Text>
                </View>
              </View>
              <Pressable
                style={[styles.clearButton, { backgroundColor: colors.danger + '15' }]}
                onPress={handleClearArea}
                hitSlop={8}
              >
                <Ionicons name="close" size={16} color={colors.danger} />
                <Text style={[styles.clearText, { color: colors.danger }]}>Clear</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Search Results Label */}
        {searchQuery.length >= 2 && (
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
            {isSearching
              ? 'SEARCHING...'
              : results.length > 0
              ? `FOUND ${results.length} AREAS`
              : 'NO RESULTS'}
          </Text>
        )}

        {/* Search Hint */}
        {searchQuery.length < 2 && !currentArea && (
          <View style={styles.hintContainer}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
              Search for your area to see local load shedding schedules. Data from EskomCalendar.co.za
            </Text>
          </View>
        )}
      </View>
    ),
    [currentArea, searchQuery, isSearching, results.length, colors, handleClearArea]
  );

  const renderEmpty = useCallback(() => {
    if (isSearching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Searching areas...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={colors.textDisabled} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{error}</Text>
        </View>
      );
    }

    if (searchQuery.length >= 2) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={48} color={colors.textDisabled} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No areas found for "{searchQuery}"
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textDisabled }]}>
            Try searching for a city or suburb name
          </Text>
        </View>
      );
    }

    return null;
  }, [isSearching, error, searchQuery, colors]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              paddingTop: Platform.OS === 'ios' ? insets.top || Spacing.md : Spacing.md,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="flash" size={24} color={colors.warning} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Load Shedding Area
              </Text>
            </View>
            <Pressable
              style={[styles.closeButton, { backgroundColor: colors.background }]}
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Search Input */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search area (e.g., Sandton, Cape Town)..."
              placeholderTextColor={colors.textDisabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Results List */}
        <FlatList
          data={results}
          renderItem={renderAreaItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        {/* Attribution */}
        <View style={[styles.attribution, { borderTopColor: colors.border }]}>
          <Text style={[styles.attributionText, { color: colors.textDisabled }]}>
            Data from EskomCalendar.co.za
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    paddingVertical: Platform.OS === 'ios' ? Spacing.xs : 0,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  currentSection: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  currentArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  currentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  currentText: {
    flex: 1,
  },
  currentName: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  currentDetails: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  clearText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    lineHeight: Typography.sizes.body * 1.5,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  areaDetails: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  attribution: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  attributionText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
});

export default SuburbPickerModal;