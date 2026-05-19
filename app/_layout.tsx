// app/_layout.tsx
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as Updates from "expo-updates";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { useAppReady } from "@/hooks/useAppReady";
import { CustomSplashScreen } from "@/components/core/SplashScreen";
import { useNotifications } from "@/hooks/useNotifications";
import { ThemeProvider, useTheme } from "@/contexts";

// ── OTA overlay (same as before, never blocks the app) ──
function OTAOverlay() {
  const { colors } = useTheme();
  const [status, setStatus] = useState<"checking" | "updating" | "done" | "error">("checking");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (__DEV__) {
      setStatus("done");
      return;
    }

    const run = async () => {
      try {
        const check = await Updates.checkForUpdateAsync();
        if (check.isAvailable) {
          setStatus("updating");
          await Updates.fetchUpdateAsync();
          Updates.reloadAsync();
        } else {
          setStatus("done");
        }
      } catch (e: any) {
        setStatus("error");
        setErrorMsg(e.message || "Update check failed");
      }
    };

    const safety = setTimeout(() => setStatus("done"), 5000);
    run();
    return () => clearTimeout(safety);
  }, []);

  if (status === "done") return null;

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background + "F0" }]}>
      {status !== "error" && <ActivityIndicator size="small" color={colors.primary} />}
      <Text style={[styles.overlayText, { color: colors.primary }]}>
        {status === "checking" ? "Checking for updates..." :
         status === "updating" ? "Updating..." : "Update check failed"}
      </Text>
      {errorMsg && (
        <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
      )}
    </View>
  );
}

// ── Main layout: tabs load immediately; location requested on‑demand ──
function RootLayoutInner() {
  const { isReady, showCustomSplash, onLayoutReady, onSplashComplete } = useAppReady();
  const { colors } = useTheme();
  const { isInitialized: notificationsReady, error: notificationError } = useNotifications();

  React.useEffect(() => {
    if (notificationsReady) {
      if (notificationError) console.log("[RootLayout] Notifications note:", notificationError);
      else console.log("[RootLayout] Notifications initialized");
    }
  }, [notificationsReady, notificationError]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} onLayout={onLayoutReady}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {showCustomSplash && <CustomSplashScreen onComplete={onSplashComplete} />}
      <OTAOverlay />
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
  overlay: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999,
  },
  overlayText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "DMSans-Medium",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    marginLeft: 8,
  },
});