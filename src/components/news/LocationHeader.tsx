// src/components/news/LocationHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing } from "@/config/theme";
import { type SACity } from "@/services/location";

interface LocationHeaderProps {
  city: SACity;
  onChangeCity: () => void;
  isLoading?: boolean;
}

export function LocationHeader({
  city,
  onChangeCity,
  isLoading = false,
}: LocationHeaderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={onChangeCity}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      <View
        style={[
          styles.locationIcon,
          { backgroundColor: `${colors.primary}20` },
        ]}
      >
        <Ionicons name="location" size={18} color={colors.primary} />
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[styles.cityName, { color: colors.text }]}
          numberOfLines={1}
        >
          {isLoading ? t("location.detecting") : city.name}
        </Text>
        <Text
          style={[styles.provinceName, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {city.province}
        </Text>
      </View>

      <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  locationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.xs,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  cityName: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  provinceName: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
  },
});