// v1.263_001/app/+not-found.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link, Stack } from "expo-router";
import { Colors, Typography, Spacing } from "@/config/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.icon}>🔍</Text>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.message}>
          This screen does not exist in PSHAD Sentinel.
        </Text>
        <Link href="/" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Return to Home</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.carbon.black,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.title,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  message: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.semantic.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.carbon.black,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
});