// app/_layout.tsx
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { useAppReady } from "@/hooks/useAppReady";
import { CustomSplashScreen } from "@/components/core/SplashScreen";
import { OnboardingScreen } from "@/components/core/OnboardingScreen";
import { useNotifications } from "@/hooks/useNotifications";
import { ThemeProvider, useTheme } from "@/contexts";

const ONBOARDING_COMPLETED_KEY = "pshad_onboarding_completed";

// ---------- Error Boundary ----------
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Startup Error</Text>
          <Text style={errorStyles.message}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  title: { fontSize: 20, fontFamily: "DMSans-Bold", color: "#FF4757", marginBottom: 16 },
  message: { fontSize: 14, fontFamily: "DMSans-Regular", color: "#FF4757", textAlign: "center" },
});

// ---------- Inner Layout ----------
function RootLayoutInner() {
  const { isReady, showCustomSplash, onLayoutReady, onSplashComplete } = useAppReady();
  const { colors } = useTheme();
  const { isInitialized: notificationsReady, error: notificationError } = useNotifications();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    if (isReady && !showCustomSplash) {
      AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY).then((value) => {
        if (value !== "true") setShowOnboarding(true);
        setOnboardingChecked(true);
      });
    }
  }, [isReady, showCustomSplash]);

  // OTA updates are now handled automatically by Expo's ON_LOAD policy.
  // No manual check is performed here to avoid race conditions.

  useEffect(() => {
    if (notificationsReady) {
      if (notificationError) console.log("[RootLayout] Notifications note:", notificationError);
      else console.log("[RootLayout] Notifications initialized");
    }
  }, [notificationsReady, notificationError]);

  if (!isReady || !onboardingChecked) return null;

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    setShowOnboarding(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} onLayout={onLayoutReady}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {showCustomSplash && <CustomSplashScreen onComplete={onSplashComplete} />}
      {showOnboarding && <OnboardingScreen onComplete={handleOnboardingComplete} />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <ErrorBoundary>
          <RootLayoutInner />
        </ErrorBoundary>
      </ThemeProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });