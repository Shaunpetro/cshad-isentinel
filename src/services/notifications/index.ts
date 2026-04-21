// src/services/notifications/index.ts
export {
    setupNotificationChannel,
    canReceivePushNotifications,
    getProjectId,
    NOTIFICATION_CHANNEL,
  } from './config';
  
  export {
    requestPermissions,
    getPushToken,
    registerTokenWithBackend,
    initializePushNotifications,
    addNotificationReceivedListener,
    addNotificationResponseListener,
    scheduleTestNotification,
    type PushTokenResult,
    type PermissionResult,
  } from './pushService';