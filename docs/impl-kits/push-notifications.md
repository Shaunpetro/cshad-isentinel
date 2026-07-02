docs/impl-kits/push-notifications.md
────────────────────────────────────
1. Purpose
   Re-enable expo-notifications so users receive safety alerts.

2. Library Versions
   expo-notifications           0.20.2
   expo-device                  5.5.1
   expo-constants               14.5.1
   (All match Expo SDK 55 latest patch)

3. Commands
   # install exact versions
   pnpm add -E expo-notifications@0.20.2
   pnpm expo install expo-device@5.5.1 expo-constants@14.5.1

4. Manual Edits
   a) // app.config.ts – add
        plugins: [
          [
            'expo-notifications',
            { icon: './assets/notification-icon.png', color: '#EE2E2E' }
          ]
        ]

   b) // src/services/notifications/pushService.ts  (FULL FILE SHOWN BELOW) …

5. Smoke Test
   expo run:android -d <deviceId>
   # On device tap Settings ▸ Test Push – should receive toast

6. Rollback
   pnpm remove expo-notifications
   git checkout -- app.config.ts
   rm -rf android/*/main/res/drawable/notification_icon.png

7. Commit Messages
   feat: add expo-notifications@0.20.2 and replace FCM token logic
   chore: update .env.example with FCM_SERVER_KEY placeholder

8. Secrets
   In GitHub → Settings → Secrets → ACTIONS
     FCM_SERVER_KEY = <server key>

9. Docs
   https://docs.expo.dev/versions/latest/sdk/notifications/

10. FAQ
   Q: ‘TaskQueue error: channelId null’?
      A: Make sure you created default notification channel in pushService.init().