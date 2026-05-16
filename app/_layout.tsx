// app/_layout.tsx
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { useAppReady } from "@/hooks/useAppReady";
import { CustomSplashScreen } from "@/components/core/SplashScreen";
import { OnboardingScreen } from "@/components/core/OnboardingScreen";
import { useNotifications } from "@/hooks/useNotifications";
import { ThemeProvider, useTheme } from "@/contexts";

const ONBOARDING_COMPLETED_KEY = "pshad_onboarding_completed";

function RootLayoutInner() {
  const { isReady, showCustomSplash, onLayoutReady, onSplashComplete } =
    useAppReady();
  const { colors } = useTheme();
  const { isInitialized: notificationsReady, error: notificationError } =
    useNotifications();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Check onboarding status after splash
  useEffect(() => {
    if (isReady && !showCustomSplash) {
      AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY).then((value) => {
        if (value !== "true") {
          setShowOnboarding(true);
        }
        setOnboardingChecked(true);
      });
    }
  }, [isReady, showCustomSplash]);

  // OTA update check
  useEffect(() => {
    if (!__DEV__ && isReady) {
      async function checkForUpdate() {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            Alert.alert(
              "Update Ready",
              "A new version is available. Restart now?",
              [
                { text: "Later", style: "cancel" },
                { text: "Restart", onPress: () => Updates.reloadAsync() },
              ]
            );
          }
        } catch (e) {
          // Silently ignore
        }
      }
      checkForUpdate();
    }
  }, [isReady]);

  // Notification setup logs
  React.useEffect(() => {
    if (notificationsReady) {
      if (notificationError) {
        console.log("[RootLayout] Notifications note:", notificationError);
      } else {
        console.log("[RootLayout] Notifications initialized");
      }
    }
  }, [notificationsReady, notificationError]);

  if (!isReady || !onboardingChecked) {
    return null;
  }

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    setShowOnboarding(false);
  };

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      onLayout={onLayoutReady}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {showCustomSplash && <CustomSplashScreen onComplete={onSplashComplete} />}
      {showOnboarding && <OnboardingScreen onComplete={handleOnboardingComplete} />}

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