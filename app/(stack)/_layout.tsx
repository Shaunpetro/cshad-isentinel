// app/(stack)/_layout.tsx
// Beta 4 - Phase 1: Stack navigator layout with hybrid Home button

import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Platform, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, LightTheme } from '@/config/theme';

export default function StackLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;
  const router = useRouter();

  return (
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
  );
}