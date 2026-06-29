// app/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { useAppReady } from "@/hooks/useAppReady";
import { CustomSplashScreen } from "@/components/core/SplashScreen";
import { useNotifications } from "@/hooks/useNotifications";
import { ThemeProvider, useTheme } from "@/contexts";
import { PersistentFeedbackButton } from "@/components/feedback/PersistentFeedbackButton";
import { UpdateBanner } from "@/components/common/UpdateBanner";

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
        <SafeAreaView style={errorStyles.container}>
          <Text style={errorStyles.title}>Startup Error</Text>
          <Text style={errorStyles.message}>{this.state.error.message}</Text>
        </SafeAreaView>
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

function RootLayoutInner() {
  const { isReady, showCustomSplash, onLayoutReady, onSplashComplete } = useAppReady();
  const { colors } = useTheme();
  const { isInitialized: notificationsReady, error: notificationError } = useNotifications();        

  useEffect(() => {
    if (notificationsReady) {
      if (notificationError) console.log("[RootLayout] Notifications note:", notificationError);     
      else console.log("[RootLayout] Notifications initialized");
    }
  }, [notificationsReady, notificationError]);

  if (!isReady) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} onLayout={onLayoutReady}>    
      <StatusBar style={colors.statusBar === 'light' ? 'light' : 'dark'} />
      <UpdateBanner />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background} }}>
        {/* CHANGED: (tabs) → (stack) */}
        <Stack.Screen name="(stack)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <PersistentFeedbackButton />
      {showCustomSplash && <CustomSplashScreen onComplete={onSplashComplete} />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <ErrorBoundary>
          <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }} edges={["top"]}>
            <RootLayoutInner />
          </SafeAreaView>
        </ErrorBoundary>
      </ThemeProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });