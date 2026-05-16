// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { ThemeProvider, useTheme } from "@/contexts";

function RootLayoutInner() {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
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

const styles = StyleSheet.create({ root: { flex: 1 } });