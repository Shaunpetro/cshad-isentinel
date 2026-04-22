// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { useAppReady } from "@/hooks/useAppReady";
import { CustomSplashScreen } from "@/components/core/SplashScreen";
import { useNotifications } from "@/hooks/useNotifications";
import { ThemeProvider, useTheme } from "@/contexts";

// Inner component that uses theme
function RootLayoutInner() {
  const { isReady, showCustomSplash, onLayoutReady, onSplashComplete } =
    useAppReady();

  // Get theme
  const { colors } = useTheme();

  // Initialize push notifications
  const { isInitialized: notificationsReady, error: notificationError } =
    useNotifications();

  // Log notification status in development
  React.useEffect(() => {
    if (notificationsReady) {
      if (notificationError) {
        console.log('[RootLayout] Notifications note:', notificationError);
      } else {
        console.log('[RootLayout] Notifications initialized');
      }
    }
  }, [notificationsReady, notificationError]);

  // Still loading fonts/resources — native splash stays visible
  if (!isReady) {
    return null;
  }

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      onLayout={onLayoutReady}
    >
      {/* Main app navigation */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {/* Custom animated splash on top */}
      {showCustomSplash && (
        <CustomSplashScreen onComplete={onSplashComplete} />
      )}

      <StatusBar style={colors.statusBar} />
    </View>
  );
}

// Root component with providers
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
  root: {
    flex: 1,
  },
});