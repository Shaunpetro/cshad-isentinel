// src/hooks/useNotifications.ts
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  initializePushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  type PushTokenResult,
} from '../services/notifications';

export interface UseNotificationsResult {
  isInitialized: boolean;
  token: string | null;
  error: string | null;
  lastNotification: Notifications.Notification | null;
}

/**
 * Hook to manage push notification lifecycle
 * Call this once in root layout
 */
export function useNotifications(): UseNotificationsResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Initialize push notifications
    async function init() {
      try {
        const result: PushTokenResult = await initializePushNotifications();
        
        if (result.success && result.token) {
          setToken(result.token);
          console.log('[useNotifications] Token:', result.token);
        } else if (result.error) {
          setError(result.error);
          console.log('[useNotifications] Note:', result.error);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('[useNotifications] Error:', message);
      } finally {
        setIsInitialized(true);
      }
    }

    init();

    // Listen for notifications received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('[useNotifications] Received:', notification);
      setLastNotification(notification);
    });

    // Listen for user interaction with notifications
    responseListener.current = addNotificationResponseListener((response) => {
      console.log('[useNotifications] Response:', response);
      // Handle navigation or actions based on notification data here
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    isInitialized,
    token,
    error,
    lastNotification,
  };
}