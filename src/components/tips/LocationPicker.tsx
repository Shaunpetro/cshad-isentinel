// v1.263_001/src/components/tips/LocationPicker.tsx
/**
 * Location picker with GPS auto-detect
 * Shows fuzzed location for privacy (Rule 1)
 */

import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { Colors, Typography, Spacing, BorderRadius } from "@/config/theme";
import { fuzzLocation, isValidSALocation } from "@/services/tips";
import type { GeoPoint } from "@/types";

interface LocationPickerProps {
  value: GeoPoint | null;
  locationName: string;
  onChange: (location: GeoPoint | null, name: string) => void;
  error?: string;
}

export function LocationPicker({ value, locationName, onChange, error }: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleGetLocation = async () => {
    setIsLoading(true);
    setLocationError(null);

    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        setLocationError("Location permission denied. You can still submit without location.");
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
          const parts = [address.district, address.city, address.region].filter(Boolean);
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
      <Text style={styles.label}>Location (Optional)</Text>
      <Text style={styles.hint}>
        📍 Location is rounded to ~100m for your privacy
      </Text>

      {value ? (
        // Location selected
        <View style={styles.selectedBox}>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedIcon}>📍</Text>
            <View style={styles.selectedText}>
              <Text style={styles.selectedName}>
                {locationName || "Location set"}
              </Text>
              <Text style={styles.selectedCoords}>
                ~{value.latitude.toFixed(3)}, {value.longitude.toFixed(3)}
              </Text>
            </View>
          </View>
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        </View>
      ) : (
        // No location - show button
        <Pressable
          onPress={handleGetLocation}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.locationButton,
            pressed && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.semantic.primary} />
          ) : (
            <Text style={styles.buttonIcon}>📍</Text>
          )}
          <Text style={styles.buttonText}>
            {isLoading ? "Getting location..." : "Use Current Location"}
          </Text>
        </Pressable>
      )}

      {/* Errors */}
      {(locationError || error) && (
        <Text style={styles.error}>{locationError || error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.xs,
  },
  hint: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginBottom: Spacing.sm,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.carbon.charcoal,
    borderWidth: 1,
    borderColor: Colors.semantic.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  buttonPressed: {
    backgroundColor: Colors.semantic.primary + "20",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    color: Colors.semantic.primary,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  selectedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.semantic.success + "20",
    borderWidth: 1,
    borderColor: Colors.semantic.success,
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
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
  },
  selectedCoords: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.mono,
    marginTop: 2,
  },
  clearButton: {
    padding: Spacing.sm,
  },
  clearText: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.heading,
  },
  error: {
    color: Colors.semantic.danger,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.sm,
  },
});