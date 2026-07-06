// app/(stack)/_layout.tsx
// Phase 3E – Redesigned header: left-aligned logo, centered Live section, fixed dark-mode status bar

import React, { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { TouchableOpacity, Platform, View, StyleSheet, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { StatusBar } from 'expo-status-bar';

export default function StackLayout() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const isHome = pathname === '/' || pathname.endsWith('index');
    if (isHome) {
      const interval = setInterval(() => setBlink((prev) => !prev), 800);
      return () => clearInterval(interval);
    }
  }, [pathname]);

  const logoSrc = require('../../assets/brand/cshad-isentinel-logo-main.png');
  const liveIconColor = blink ? '#FBC4C4' : theme.colors.text;

  // Solid background for dark-mode status bar visibility
  const headerBg = theme.isDark ? theme.colors.background : '#FFFFFF';
  const statusBarStyle = theme.isDark ? 'light' : 'dark';

  return (
    <>
      <StatusBar style={statusBarStyle} backgroundColor={headerBg} />
      <Stack
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: headerBg,
            borderBottomColor: theme.glass.border,
            borderBottomWidth: 1,
            height: 56, // compact, adapts to content
          } as any,
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitle: ({ children }) => {
            // All screens: logo left-aligned
            return (
              <View style={styles.headerTitleContainer}>
                <Image source={logoSrc} style={styles.headerLogo} resizeMode="contain" />
                {children === 'Live' ? (
                  // Home: centered Live icon + text
                  <TouchableOpacity
                    onPress={() => router.push('live' as any)}
                    style={styles.liveSection}
                  >
                    <Ionicons name="play-circle-outline" size={22} color={liveIconColor} />
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Live</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{children}</Text>
                )}
              </View>
            );
          },
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
        })}
      >
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

      {/* Floating Home Button */}
      {pathname !== '/' && !pathname.endsWith('index') && (
        <TouchableOpacity
          onPress={() => router.navigate('/')}
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
    flex: 1,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  liveSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
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