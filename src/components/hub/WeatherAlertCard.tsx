// src/components/hub/WeatherAlertCard.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import {
  getWeatherAlertColor,
  getWeatherAlertIcon,
  getWeatherIconUrl,
} from '@/services/weather';
import type { WeatherAlert, CurrentWeather } from '@/services/weather';

interface WeatherAlertCardProps {
  alert?: WeatherAlert;
  currentWeather?: CurrentWeather;
  locationName?: string;
  onPress?: () => void;
  onDismiss?: () => void;
}

export function WeatherAlertCard({
  alert,
  currentWeather,
  locationName,
  onPress,
  onDismiss,
}: WeatherAlertCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // If there's an active alert, show alert card
  if (alert) {
    const alertColor = getWeatherAlertColor(alert.severity);
    const alertIcon = getWeatherAlertIcon(alert.type);

    const timeUntilEnd = alert.end.getTime() - Date.now();
    const hoursLeft = Math.max(0, Math.floor(timeUntilEnd / (1000 * 60 * 60)));
    const minutesLeft = Math.max(0, Math.floor((timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60)));

    // Format time remaining
    const getTimeLeftText = (): string => {
      if (hoursLeft > 0) {
        return `${hoursLeft}h ${minutesLeft}m ${t('alerts.weather.timeLeft')}`;
      }
      if (minutesLeft > 0) {
        return `${minutesLeft}m ${t('alerts.weather.timeLeft')}`;
      }
      return '';
    };

    return (
      <Pressable
        style={[
          styles.alertContainer,
          {
            backgroundColor: colors.surface,
            borderLeftColor: alertColor,
          },
        ]}
        onPress={onPress}
      >
        {/* Dismiss button */}
        {onDismiss && (
          <Pressable
            style={styles.dismissButton}
            onPress={onDismiss}
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        )}

        {/* Alert icon */}
        <View style={[styles.alertIconContainer, { backgroundColor: alertColor + '20' }]}>
          <Ionicons name={alertIcon as any} size={24} color={alertColor} />
        </View>

        {/* Content */}
        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={[styles.alertSeverity, { color: alertColor }]}>
              {t('alerts.weather.alert')}
            </Text>
            {(hoursLeft > 0 || minutesLeft > 0) && (
              <Text style={[styles.alertTime, { color: colors.textSecondary }]}>
                {getTimeLeftText()}
              </Text>
            )}
          </View>

          <Text style={[styles.alertTitle, { color: colors.text }]} numberOfLines={2}>
            {alert.title}
          </Text>

          <Text style={[styles.alertDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {alert.description}
          </Text>

          {locationName && (
            <View style={styles.alertLocation}>
              <Ionicons name="location" size={12} color={colors.textDisabled} />
              <Text style={[styles.alertLocationText, { color: colors.textDisabled }]}>
                {locationName}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  // No alert - show current weather summary
  if (currentWeather) {
    return (
      <Pressable
        style={[styles.weatherContainer, { backgroundColor: colors.surface }]}
        onPress={onPress}
      >
        <Image
          source={{ uri: getWeatherIconUrl(currentWeather.icon, '2x') }}
          style={styles.weatherIcon}
        />

        <View style={styles.weatherContent}>
          <Text style={[styles.weatherTemp, { color: colors.text }]}>
            {currentWeather.temperature}°C
          </Text>
          <Text style={[styles.weatherDesc, { color: colors.textSecondary }]}>
            {currentWeather.description}
          </Text>
          {locationName && (
            <Text style={[styles.weatherLocation, { color: colors.textDisabled }]}>
              {locationName}
            </Text>
          )}
        </View>

        <View style={styles.weatherDetails}>
          <View style={styles.weatherDetailItem}>
            <Ionicons name="water-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.weatherDetailText, { color: colors.textSecondary }]}>
              {currentWeather.humidity}%
            </Text>
          </View>
          <View style={styles.weatherDetailItem}>
            <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.weatherDetailText, { color: colors.textSecondary }]}>
              {currentWeather.windSpeed} km/h
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} />
      </Pressable>
    );
  }

  // No weather data
  return null;
}

const styles = StyleSheet.create({
  alertContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    gap: Spacing.sm,
  },
  dismissButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 1,
    padding: 4,
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
    paddingRight: Spacing.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertSeverity: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
    letterSpacing: 0.5,
  },
  alertTime: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  alertTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    lineHeight: Typography.sizes.caption * 1.4,
  },
  alertLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  alertLocationText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  weatherIcon: {
    width: 50,
    height: 50,
  },
  weatherContent: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
  },
  weatherDesc: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    textTransform: 'capitalize',
  },
  weatherLocation: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
  weatherDetails: {
    alignItems: 'flex-end',
    gap: 4,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherDetailText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
});

export default WeatherAlertCard;