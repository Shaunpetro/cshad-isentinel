// src/components/news/CityPickerModal.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  StatusBar,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/config/theme';
import { getAllCities, searchLocations, type SACity } from '@/services/location';

interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (city: SACity) => void;
  currentCityId: string;
  onDetectLocation?: () => void;
  isDetecting?: boolean;
}

interface SectionData {
  title: string;
  data: SACity[];
}

export function CityPickerModal({
  visible,
  onClose,
  onSelectCity,
  currentCityId,
  onDetectLocation,
  isDetecting = false,
}: CityPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SACity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const allCities = getAllCities();

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await searchLocations(query);
      setSearchResults(results);
      console.log('[CityPicker] Search results:', results.length);
    } catch (error) {
      console.error('[CityPicker] Search error:', error);
      setSearchError('Search failed. Check your internet connection.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search - 500ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
    }
  }, [visible]);

  // Filter major cities by search query (for instant local filtering)
  const filteredMajorCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...allCities].sort((a, b) => b.population - a.population);
    }

    const query = searchQuery.toLowerCase();
    return allCities
      .filter(
        (city) =>
          city.name.toLowerCase().includes(query) ||
          city.province.toLowerCase().includes(query)
      )
      .sort((a, b) => b.population - a.population);
  }, [allCities, searchQuery]);

  // Build sections for the list
  const sections: SectionData[] = useMemo(() => {
    const result: SectionData[] = [];

    // If searching and have results, show them first
    if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
      // Filter out duplicates (cities already in major cities list)
      const majorCityNames = new Set(allCities.map(c => c.name.toLowerCase()));
      const uniqueSearchResults = searchResults.filter(
        (city) => !majorCityNames.has(city.name.toLowerCase())
      );

      if (uniqueSearchResults.length > 0) {
        result.push({
          title: '🔍 Search Results',
          data: uniqueSearchResults,
        });
      }
    }

    // Always show major cities (filtered if searching)
    if (filteredMajorCities.length > 0) {
      result.push({
        title: searchQuery.trim() ? '🏙️ Major Cities (Matching)' : '🏙️ Major Cities',
        data: filteredMajorCities,
      });
    }

    return result;
  }, [searchQuery, searchResults, filteredMajorCities, allCities]);

  const handleSelectCity = (city: SACity) => {
    onSelectCity(city);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const renderCityItem = ({ item }: { item: SACity }) => {
    const isSelected = item.id === currentCityId;
    const isCustom = item.isCustom;

    return (
      <TouchableOpacity
        style={[styles.cityItem, isSelected && styles.cityItemSelected]}
        onPress={() => handleSelectCity(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cityInfo}>
          <View style={styles.cityNameRow}>
            <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
              {item.name}
            </Text>
            {isCustom && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          <Text style={styles.provinceName}>
            {item.province} • {item.provinceCode}
          </Text>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={Colors.semantic.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderEmptyComponent = () => {
    if (isSearching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.semantic.primary} />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (searchError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={48}
            color={Colors.semantic.warning}
          />
          <Text style={styles.emptyText}>{searchError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => performSearch(searchQuery)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery.trim().length >= 2) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="location-outline"
            size={48}
            color={Colors.carbon.steel}
          />
          <Text style={styles.emptyText}>No locations found for "{searchQuery}"</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="location-outline"
          size={48}
          color={Colors.carbon.steel}
        />
        <Text style={styles.emptyText}>No cities found</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color={Colors.carbon.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Select Location</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Detect Location Button */}
        {onDetectLocation && (
          <TouchableOpacity
            style={styles.detectButton}
            onPress={onDetectLocation}
            disabled={isDetecting}
            activeOpacity={0.7}
          >
            {isDetecting ? (
              <ActivityIndicator size="small" color={Colors.semantic.primary} />
            ) : (
              <Ionicons
                name="navigate"
                size={20}
                color={Colors.semantic.primary}
              />
            )}
            <Text style={styles.detectButtonText}>
              {isDetecting ? 'Detecting...' : 'Use my current location'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.carbon.silver}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search any SA town or city..."
            placeholderTextColor={Colors.carbon.steel}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching && (
            <ActivityIndicator 
              size="small" 
              color={Colors.semantic.primary} 
              style={styles.searchSpinner}
            />
          )}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.carbon.silver}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Search hint */}
        {searchQuery.length > 0 && searchQuery.length < 2 && (
          <Text style={styles.searchHint}>Type at least 2 characters to search</Text>
        )}

        {/* City List */}
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={renderCityItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          stickySectionHeadersEnabled={false}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.carbon.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.carbon.charcoal,
    borderBottomWidth: 1,
    borderBottomColor: Colors.carbon.steel,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  headerSpacer: {
    width: 40,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.carbon.charcoal,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.semantic.primary,
  },
  detectButtonText: {
    color: Colors.semantic.primary,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
    marginLeft: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.carbon.charcoal,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.carbon.steel,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    paddingVertical: Spacing.md,
  },
  searchSpinner: {
    marginLeft: Spacing.sm,
  },
  searchHint: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  sectionHeader: {
    backgroundColor: Colors.carbon.black,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.carbon.charcoal,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.carbon.steel,
  },
  cityItemSelected: {
    borderColor: Colors.semantic.primary,
    backgroundColor: `${Colors.semantic.primary}10`,
  },
  cityInfo: {
    flex: 1,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityName: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  cityNameSelected: {
    color: Colors.semantic.primary,
  },
  customBadge: {
    backgroundColor: Colors.semantic.info,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  customBadgeText: {
    color: Colors.carbon.white,
    fontSize: 10,
    fontFamily: Typography.fonts.bold,
  },
  provinceName: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    color: Colors.carbon.steel,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.xs,
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.semantic.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.carbon.black,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
});