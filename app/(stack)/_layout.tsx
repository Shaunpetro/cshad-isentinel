// app/(stack)/_layout.tsx
// Beta 4 - Phase 1: Stack navigator with glass header, floating home button, status bar

import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { StatusBar } from 'expo-status-bar';

export default function StackLayout() {
  const theme = useTheme();
  const router = useRouter();

  const statusBarStyle = theme.colors.statusBar === 'light' ? 'light' : 'dark';

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.glass.bg,
            borderBottomColor: theme.glass.border,
            borderBottomWidth: 1,
          } as any,
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: ({ canGoBack }) => {
            if (!canGoBack) return null;
            return (
              <TouchableOpacity
                onPress={() => router.navigate('index' as any)}
                style={{ marginLeft: Platform.OS === 'android' ? 8 : 0 }}
              >
                <Ionicons name="home-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            );
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Home', headerLeft: () => null }} />
        <Stack.Screen name="news" options={{ title: 'News' }} />
        <Stack.Screen name="opportunities" options={{ title: 'Opportunities' }} />
        <Stack.Screen name="map" options={{ title: 'Map' }} />
        <Stack.Screen name="safety" options={{ title: 'Safety Hub' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="live" options={{ title: 'Live Hub' }} />
        <Stack.Screen name="incidents" options={{ title: 'Incidents' }} />
        <Stack.Screen name="article/[id]" options={{ title: 'Article' }} />
      </Stack>

      {/* Floating Home Button (visible on all screens except home) */}
      <FloatingHomeButton />
    </>
  );
}

function FloatingHomeButton() {
  const router = useRouter();
  const theme = useTheme();

  // We'll use a simple approach: show only when not on 'index'
  // For now, we always show; later we can use navigation state to hide on home
  return (
    <TouchableOpacity
      onPress={() => router.navigate('index' as any)}
      style={[styles.fab, { backgroundColor: theme.glass.bg, borderColor: theme.glass.border }]}
      activeOpacity={0.8}
    >
      <Ionicons name="home" size={24} color={theme.colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});