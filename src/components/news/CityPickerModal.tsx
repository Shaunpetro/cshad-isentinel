// src/components/news/CityPickerModal.tsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing } from "@/config/theme";
import {
  getAllCities,
  searchLocations,
  type SACity,
} from "@/services/location";

interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCity: (city: SACity) => void;
  currentCityId: string;
  onDetectLocation?: () => Promise<SACity | null>;
  isDetecting?: boolean;
}

interface SectionData {
  title: string;
  data: SACity[];
}

interface DetectedLocationState {
  city: SACity | null;
  status: "idle" | "detecting" | "success" | "error";
  error?: string;
}

export function CityPickerModal({
  visible,
  onClose,
  onSelectCity,
  currentCityId,
  onDetectLocation,
  isDetecting = false,
}: CityPickerModalProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SACity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Detected location state
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocationState>({
    city: null,
    status: "idle",
  });

  const allCities = getAllCities();

  // Check if currently detecting (either from prop or internal state)
  const isCurrentlyDetecting = isDetecting || detectedLocation.status === "detecting";

  // Handle detect location with proper feedback
  const handleDetectLocation = useCallback(async () => {
    if (!onDetectLocation) return;

    setDetectedLocation({ city: null, status: "detecting" });

    try {
      const city = await onDetectLocation();

      if (city) {
        setDetectedLocation({ city, status: "success" });
        // Auto-select after a brief moment to show the user what was detected
        setTimeout(() => {
          onSelectCity(city);
          onClose();
        }, 1500);
      } else {
        setDetectedLocation({
          city: null,
          status: "error",
          error: t("location.unavailable"),
        });
      }
    } catch (error) {
      console.error("[CityPicker] Detect location error:", error);
      setDetectedLocation({
        city: null,
        status: "error",
        error: t("location.permissionDenied"),
      });
    }
  }, [onDetectLocation, onSelectCity, onClose, t]);

  // Debounced search function
  const performSearch = useCallback(
    async (query: string) => {
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
      } catch (error) {
        console.error("[CityPicker] Search error:", error);
        setSearchError(t("common.error"));
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [t]
  );

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
      setSearchQuery("");
      setSearchResults([]);
      setSearchError(null);
      setDetectedLocation({ city: null, status: "idle" });
    }
  }, [visible]);

  // Filter major cities by search query
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

    if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
      const majorCityNames = new Set(
        allCities.map((c) => c.name.toLowerCase())
      );
      const uniqueSearchResults = searchResults.filter(
        (city) => !majorCityNames.has(city.name.toLowerCase())
      );

      if (uniqueSearchResults.length > 0) {
        result.push({
          title: `🔍 ${t("common.search")}`,
          data: uniqueSearchResults,
        });
      }
    }

    if (filteredMajorCities.length > 0) {
      result.push({
        title: `🏙️ ${t("location.selectCity")}`,
        data: filteredMajorCities,
      });
    }

    return result;
  }, [searchQuery, searchResults, filteredMajorCities, allCities, t]);

  const handleSelectCity = (city: SACity) => {
    onSelectCity(city);
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  const renderCityItem = ({ item }: { item: SACity }) => {
    const isSelected = item.id === currentCityId;
    const isCustom = item.isCustom;

    return (
      <TouchableOpacity
        style={[
          styles.cityItem,
          {
            backgroundColor: colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
          isSelected && { backgroundColor: colors.primary + "10" },
        ]}
        onPress={() => handleSelectCity(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cityInfo}>
          <View style={styles.cityNameRow}>
            <Text
              style={[
                styles.cityName,
                { color: isSelected ? colors.primary : colors.text },
              ]}
            >
              {item.name}
            </Text>
            {isCustom && (
              <View
                style={[styles.customBadge, { backgroundColor: colors.info }]}
              >
                <Text style={styles.customBadgeText}>{t("common.more")}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.provinceName, { color: colors.textSecondary }]}>
            {item.province} • {item.provinceCode}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {section.title}
      </Text>
    </View>
  );

  const renderEmptyComponent = () => {
    if (isSearching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("common.loading")}
          </Text>
        </View>
      );
    }

    if (searchError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={48}
            color={colors.warning}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {searchError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => performSearch(searchQuery)}
          >
            <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery.trim().length >= 2) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={48} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t("common.noResults")}
          </Text>
        </View>
      );
    }

    return null;
  };

  // Render detected location feedback
  const renderDetectedLocationSection = () => {
    if (detectedLocation.status === "idle") return null;

    return (
      <View
        style={[
          styles.detectedContainer,
          {
            backgroundColor:
              detectedLocation.status === "success"
                ? colors.success + "20"
                : detectedLocation.status === "error"
                  ? colors.danger + "20"
                  : colors.surface,
            borderColor:
              detectedLocation.status === "success"
                ? colors.success
                : detectedLocation.status === "error"
                  ? colors.danger
                  : colors.border,
          },
        ]}
      >
        {detectedLocation.status === "detecting" && (
          <>
            <ActivityIndicator size="small" color={colors.primary} />
            <View style={styles.detectedTextContainer}>
              <Text style={[styles.detectedTitle, { color: colors.text }]}>
                {t("location.detecting")}
              </Text>
              <Text
                style={[styles.detectedSubtitle, { color: colors.textSecondary }]}
              >
                {t("common.loading")}
              </Text>
            </View>
          </>
        )}

        {detectedLocation.status === "success" && detectedLocation.city && (
          <>
            <View
              style={[
                styles.detectedIcon,
                { backgroundColor: colors.success + "30" },
              ]}
            >
              <Ionicons name="checkmark" size={20} color={colors.success} />
            </View>
            <View style={styles.detectedTextContainer}>
              <Text style={[styles.detectedTitle, { color: colors.text }]}>
                {detectedLocation.city.name}
              </Text>
              <Text
                style={[styles.detectedSubtitle, { color: colors.textSecondary }]}
              >
                {detectedLocation.city.province} •{" "}
                {detectedLocation.city.latitude.toFixed(4)},{" "}
                {detectedLocation.city.longitude.toFixed(4)}
              </Text>
            </View>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.success}
            />
          </>
        )}

        {detectedLocation.status === "error" && (
          <>
            <View
              style={[
                styles.detectedIcon,
                { backgroundColor: colors.danger + "30" },
              ]}
            >
              <Ionicons name="close" size={20} color={colors.danger} />
            </View>
            <View style={styles.detectedTextContainer}>
              <Text style={[styles.detectedTitle, { color: colors.text }]}>
                {t("location.unavailable")}
              </Text>
              <Text
                style={[styles.detectedSubtitle, { color: colors.textSecondary }]}
              >
                {detectedLocation.error || t("common.error")}
              </Text>
            </View>
            <TouchableOpacity onPress={handleDetectLocation}>
              <Text style={[styles.retryLink, { color: colors.primary }]}>
                {t("common.retry")}
              </Text>
            </TouchableOpacity>
          </>
        )}
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
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("location.selectCity")}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Detect Location Button */}
        {onDetectLocation && detectedLocation.status === "idle" && (
          <TouchableOpacity
            style={[
              styles.detectButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
              },
            ]}
            onPress={handleDetectLocation}
            disabled={isCurrentlyDetecting}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate" size={20} color={colors.primary} />
            <Text style={[styles.detectButtonText, { color: colors.primary }]}>
              {t("tip.useCurrentLocation")}
            </Text>
          </TouchableOpacity>
        )}

        {/* Detected Location Feedback */}
        {renderDetectedLocationSection()}

        {/* Search Input */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t("location.searchCity")}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.searchSpinner}
            />
          )}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  headerSpacer: {
    width: 40,
  },
  detectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  detectButtonText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  detectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  detectedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  detectedTextContainer: {
    flex: 1,
  },
  detectedTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  detectedSubtitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  retryLink: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    paddingVertical: Spacing.md,
  },
  searchSpinner: {
    marginLeft: Spacing.sm,
  },
  sectionHeader: {
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  cityInfo: {
    flex: 1,
  },
  cityNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityName: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  customBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  customBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: Typography.fonts.bold,
  },
  provinceName: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
});