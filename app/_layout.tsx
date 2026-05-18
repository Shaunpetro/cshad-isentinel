// app/_layout.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { ThemeProvider, useTheme } from "@/contexts";

function TestScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>
        CSHAD iSentinel News
      </Text>
      <Text style={[styles.text, { color: colors.text }]}>
        OTA TEST SUCCESSFUL ✅
      </Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <TestScreen />
      </ThemeProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontFamily: "DMSans-Bold", marginBottom: 16 },
  text: { fontSize: 16, fontFamily: "DMSans-Regular" },
});