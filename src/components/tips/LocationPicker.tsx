// src/components/tips/LocationPicker.tsx
/**
 * Location picker with GPS auto-detect
 * Shows fuzzed location for privacy (Rule 1)
 * Supports light/dark theme
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing, BorderRadius } from "@/config/theme";
import { fuzzLocation, isValidSALocation } from "@/services/tips";
import type { GeoPoint } from "@/types";

interface LocationPickerProps {
  value: GeoPoint | null;
  locationName: string;
  onChange: (location: GeoPoint | null, name: string) => void;
  error?: string;
}

export function LocationPicker({
  value,
  locationName,
  onChange,
  error,
}: LocationPickerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleGetLocation = async () => {
    setIsLoading(true);
    setLocationError(null);

    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError(
          t("location.permissionDenied") +
            ". You can still submit without location."
        );
        setIsLoading(false);
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const rawLocation: GeoPoint = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Validate it's in South Africa
      if (!isValidSALocation(rawLocation)) {
        setLocationError("Location appears to be outside South Africa.");
        setIsLoading(false);
        return;
      }

      // Fuzz for privacy (~100m precision)
      const fuzzedLocation = fuzzLocation(rawLocation, 100);

      // Try to get area name
      let areaName = "";
      try {
        const [address] = await Location.reverseGeocodeAsync(rawLocation);
        if (address) {
          const parts = [
            address.district,
            address.city,
            address.region,
          ].filter(Boolean);
          areaName = parts.join(", ");
        }
      } catch {
        // Reverse geocoding failed, use coordinates
        areaName = `${fuzzedLocation.latitude.toFixed(3)}, ${fuzzedLocation.longitude.toFixed(3)}`;
      }

      onChange(fuzzedLocation, areaName);
    } catch (err) {
      console.error("Location error:", err);
      setLocationError("Could not get location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    onChange(null, "");
    setLocationError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t("tip.location")} ({t("common.item")})
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        📍 Location is rounded to ~100m for your privacy
      </Text>

      {value ? (
        // Location selected
        <View
          style={[
            styles.selectedBox,
            {
              backgroundColor: colors.success + "20",
              borderColor: colors.success,
            },
          ]}
        >
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedIcon}>📍</Text>
            <View style={styles.selectedText}>
              <Text style={[styles.selectedName, { color: colors.text }]}>
                {locationName || "Location set"}
              </Text>
              <Text
                style={[styles.selectedCoords, { color: colors.textSecondary }]}
              >
                ~{value.latitude.toFixed(3)}, {value.longitude.toFixed(3)}
              </Text>
            </View>
          </View>
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Text style={[styles.clearText, { color: colors.textSecondary }]}>
              ✕
            </Text>
          </Pressable>
        </View>
      ) : (
        // No location - show button
        <Pressable
          onPress={handleGetLocation}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.locationButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary,
            },
            pressed && { backgroundColor: colors.primary + "20" },
            isLoading && styles.buttonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.buttonIcon}>📍</Text>
          )}
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            {isLoading
              ? t("location.detecting")
              : t("tip.useCurrentLocation")}
          </Text>
        </Pressable>
      )}

      {/* Errors */}
      {(locationError || error) && (
        <Text style={[styles.error, { color: colors.danger }]}>
          {locationError || error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.xs,
  },
  hint: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginBottom: Spacing.sm,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  selectedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  selectedText: {
    flex: 1,
  },
  selectedName: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  selectedCoords: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.mono,
    marginTop: 2,
  },
  clearButton: {
    padding: Spacing.sm,
  },
  clearText: {
    fontSize: Typography.sizes.heading,
  },
  error: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.sm,
  },
});