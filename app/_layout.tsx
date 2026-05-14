// app/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import * as Updates from 'expo-updates';
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { useAppReady } from "@/hooks/useAppReady";
import { CustomSplashScreen } from "@/components/core/SplashScreen";
import { useNotifications } from "@/hooks/useNotifications";
import { ThemeProvider, useTheme } from "@/contexts";

function RootLayoutInner() {
  const { isReady, showCustomSplash, onLayoutReady, onSplashComplete } = useAppReady();
  const { colors } = useTheme();
  const { isInitialized: notificationsReady, error: notificationError } = useNotifications();

  // Check for OTA updates (only in production/preview, not in dev)
  useEffect(() => {
    if (!__DEV__) {
      async function checkForUpdate() {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            // Apply the update on next restart — no prompt needed
          }
        } catch (e) {
          // Silently ignore – update will be picked up next time
        }
      }
      checkForUpdate();
    }
  }, []);

  React.useEffect(() => {
    if (notificationsReady) {
      if (notificationError) {
        console.log("[RootLayout] Notifications note:", notificationError);
      } else {
        console.log("[RootLayout] Notifications initialized");
      }
    }
  }, [notificationsReady, notificationError]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} onLayout={onLayoutReady}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {showCustomSplash && <CustomSplashScreen onComplete={onSplashComplete} />}

      <StatusBar style={colors.statusBar} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});