// src/services/notifications/pushService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { setupNotificationChannel, canReceivePushNotifications, getProjectId } from './config';
import { supabase } from '../supabase/config';

export interface PushTokenResult {
  success: boolean;
  token?: string;
  error?: string;
}

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Request notification permissions from user
 */
export async function requestPermissions(): Promise<PermissionResult> {
  if (!canReceivePushNotifications()) {
    return { granted: false, canAskAgain: false };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return { granted: true, canAskAgain: false };
  }

  const { status, canAskAgain } = await Notifications.requestPermissionsAsync();

  return {
    granted: status === 'granted',
    canAskAgain: canAskAgain ?? false,
  };
}

/**
 * Get the Expo push token for this device
 */
export async function getPushToken(): Promise<PushTokenResult> {
  try {
    if (!canReceivePushNotifications()) {
      return {
        success: false,
        error: 'Push notifications require a physical device',
      };
    }

    await setupNotificationChannel();

    const { granted } = await requestPermissions();
    if (!granted) {
      return {
        success: false,
        error: 'Notification permissions not granted',
      };
    }

    const projectId = getProjectId();
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    return {
      success: true,
      token: tokenData.data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PushService] Error getting push token:', message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Register push token with Supabase backend
 */
export async function registerTokenWithBackend(token: string): Promise<boolean> {
  try {
    const deviceType = Platform.OS;

    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          token,
          device_type: deviceType,
          last_used_at: new Date().toISOString(),
        },
        {
          onConflict: 'token',
        }
      );

    if (error) {
      console.error('[PushService] Error registering token:', error.message);
      return false;
    }

    console.log('[PushService] Token registered successfully');
    return true;
  } catch (error) {
    console.error('[PushService] Error registering token:', error);
    return false;
  }
}

/**
 * Initialize push notifications – call on app start
 */
export async function initializePushNotifications(): Promise<PushTokenResult> {
  const result = await getPushToken();

  if (result.success && result.token) {
    await registerTokenWithBackend(result.token);
  }

  return result;
}

/**
 * Send a real push notification via Expo's free push service
 */
export async function sendRealPushNotification(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!canReceivePushNotifications()) {
      return { success: false, error: 'Push notifications only work on a physical device.' };
    }

    const tokenResult = await getPushToken();
    if (!tokenResult.success || !tokenResult.token) {
      return { success: false, error: tokenResult.error || 'No push token available.' };
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: tokenResult.token,
        title: '🛡️ CSHAD iSentinel News',
        body: 'Push notifications are working! 🎉',
        sound: 'default',
        priority: 'high',
        badge: 1,
      }),
    });

    const data = await response.json();

    if (response.ok && data.data?.status === 'ok') {
      console.log('[PushService] Real push sent successfully');
      return { success: true };
    }

    console.error('[PushService] Expo push API error:', data);
    return { success: false, error: data.errors?.[0]?.message || 'Failed to send push notification.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PushService] sendRealPush error:', message);
    return { success: false, error: message };
  }
}

/**
 * Add listener for received notifications (foreground)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for notification responses (user tapped notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Schedule a local notification (legacy test, kept for quick testing)
 */
export async function scheduleTestNotification(): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🛡️ CSHAD iSentinel News',
      body: 'Push notifications are working!',
      data: { test: true },
    },
    trigger: {
      seconds: 2,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });

  return id;
}