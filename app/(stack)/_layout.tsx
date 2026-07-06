// app/(stack)/_layout.tsx
// Beta 4 - Phase 1: Stack navigator with glass header, logo, floating home button, global settings icon

import React, { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { TouchableOpacity, Platform, View, StyleSheet, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';

export default function StackLayout() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [blink, setBlink] = useState(false);

  // Blink effect for the Live icon
  useEffect(() => {
    const isHome = pathname === '/' || pathname.endsWith('index');
    if (isHome) {
      const interval = setInterval(() => setBlink((prev) => !prev), 800);
      return () => clearInterval(interval);
    }
  }, [pathname]);

  const logoSrc = require('../../assets/brand/cshad-isentinel-logo-main.png');
  const liveIconColor = blink ? '#FBC4C4' : theme.colors.text; // pastel matt light red

  return (
    <>
      <Stack
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: theme.isDark ? theme.colors.background : '#FFFFFF',
            borderBottomColor: theme.glass.border,
            borderBottomWidth: 1,
          } as any,
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitle: ({ children }) => {
            // Home screen: logo + blinking Live icon + "Live" (tappable)
            if (children === 'Live') {
              return (
                <TouchableOpacity
                onPress={() => router.push('live' as any)}
                  style={styles.homeTitleContainer}
                >
                  <Image source={logoSrc} style={styles.headerLogo} resizeMode="contain" />
                  <Ionicons name="play-circle-outline" size={22} color={liveIconColor} />
                  <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Live</Text>
                </TouchableOpacity>
              );
            }
            // Other screens: logo + title
            return (
              <View style={[
                styles.headerTitleContainer,
                navigation?.canGoBack?.() && { marginLeft: 8 },
              ]}>
                <Image source={logoSrc} style={styles.headerLogo} resizeMode="contain" />
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{children}</Text>
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

      {/* Centered Floating Home Button – hidden on home */}
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
  homeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 46,
    height: 46,
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