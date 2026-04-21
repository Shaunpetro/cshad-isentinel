// src/services/notifications/config.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Configure notification behavior
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Notification channel for Android
 */
export const NOTIFICATION_CHANNEL = {
  id: 'default',
  name: 'Default',
  description: 'Default notification channel for PSHAD Sentinel',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250] as number[],
  lightColor: '#00D4AA',
};

/**
 * Setup Android notification channel
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL.id, {
      name: NOTIFICATION_CHANNEL.name,
      description: NOTIFICATION_CHANNEL.description,
      importance: NOTIFICATION_CHANNEL.importance,
      vibrationPattern: NOTIFICATION_CHANNEL.vibrationPattern,
      lightColor: NOTIFICATION_CHANNEL.lightColor,
    });
  }
}

/**
 * Check if device can receive push notifications
 */
export function canReceivePushNotifications(): boolean {
  return Device.isDevice;
}

/**
 * Get project ID from Expo config
 */
export function getProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId;
}