// app/apply-journalist.tsx
import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useTheme } from "@/contexts";

export default function ApplyJournalistScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    Linking.openURL("https://cshad-isentinel-md.vercel.app/register/journalist");
    const timeout = setTimeout(() => {
      router.back();
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, marginBottom: 16 }}>Opening registration page…</Text>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}