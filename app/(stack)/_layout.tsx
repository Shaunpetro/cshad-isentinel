// app/(stack)/_layout.tsx
// Beta 4 - Phase 1: Stack navigator with glass header, logo, floating home button, global settings icon

import React from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { TouchableOpacity, Platform, View, StyleSheet, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { StatusBar } from 'expo-status-bar';

export default function StackLayout() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const statusBarStyle = theme.colors.statusBar === 'light' ? 'light' : 'dark';

  // Choose logo based on theme
  const logoSrc = theme.isDark
    ? require('../../assets/brand/cshad-isentinel-logo-main.png')
    : require('../../assets/brand/main-logo-light.png');

  return (
    <>
      <StatusBar style={statusBarStyle} translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.glass.bg,
            borderBottomColor: theme.glass.border,
            borderBottomWidth: 1,
          } as any,
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitle: ({ children }) => (
            <View style={styles.headerTitleContainer}>
              <Image source={logoSrc} style={styles.headerLogo} resizeMode="contain" />
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{children}</Text>
            </View>
          ),
          headerLeft: ({ canGoBack }) => {
            if (!canGoBack) return null;
            return (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginLeft: Platform.OS === 'android' ? 8 : 0 }}
              >
                <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            );
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('settings' as any)} style={{ marginRight: 8 }}>
              <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      >
        {/* Home screen: custom right icons (notification + settings) */}
        <Stack.Screen
          name="index"
          options={{
            title: 'Live',
            headerLeft: () => null,
            headerRight: () => (
              <View style={{ flexDirection: 'row', gap: 16, marginRight: 8 }}>
                <TouchableOpacity onPress={() => {}}>
                  <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('settings' as any)}>
                  <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen name="news" options={{ title: 'News' }} />
        <Stack.Screen name="opportunities" options={{ title: 'Opportunities' }} />
        <Stack.Screen name="map" options={{ title: 'Map' }} />
        <Stack.Screen name="safety" options={{ title: 'Safety Hub' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="live" options={{ title: 'Live Videos' }} />
        <Stack.Screen name="incidents" options={{ title: 'Incidents' }} />
        <Stack.Screen name="article/[id]" options={{ title: 'Article' }} />
      </Stack>

      {/* Floating Home Button – hidden on the home screen itself */}
      {pathname !== '/' && !pathname.endsWith('index') && (
        <TouchableOpacity
          onPress={() => router.navigate('index' as any)}
          style={[styles.fab, { backgroundColor: theme.glass.bg, borderColor: theme.glass.border }]}
          activeOpacity={0.8}
        >
          <Ionicons name="home" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
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