// app/(stack)/_layout.tsx
// Beta 4 – Responsive header, home logo, no FAB, no AdProvider

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

  const isHome = pathname === '/' || pathname.endsWith('index');
  const isLive = pathname.endsWith('live');

  useEffect(() => {
    if (isHome) {
      const interval = setInterval(() => setBlink((prev) => !prev), 800);
      return () => clearInterval(interval);
    }
  }, [isHome]);

  const logoSrc = require('../../assets/brand/cshad-isentinel-logo-main.png');
  const liveIconColor = blink ? '#FBC4C4' : theme.colors.text;

  const headerHeight = isHome ? 80 : 56;
  const logoStyle = isHome
    ? { width: 76, height: 50, marginBottom: 4 }
    : { width: 60, height: 40 };

  const headerBg = theme.isDark ? theme.colors.background : '#FFFFFF';

  return (
    <>
      <StatusBar
        style={theme.isDark ? 'light' : 'dark'}
        backgroundColor={Platform.OS === 'android' ? headerBg : undefined}
        translucent={false}
      />
      <Stack
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: headerBg,
            borderBottomColor: theme.glass.border,
            borderBottomWidth: 1,
            height: headerHeight,
          } as any,
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          headerTitle: ({ children }) => {
            return (
              <View style={styles.headerTitleContainer}>
                <Image source={logoSrc} style={[styles.headerLogo, logoStyle]} resizeMode="contain" />
                {children === 'Live' ? (
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
            if (isHome || !canGoBack) return null;
            return (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginLeft: Platform.OS === 'android' ? 8 : 0 }}
              >
                <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            );
          },
          headerRight: () => {
            if (isLive) {
              return (
                <View style={{ flexDirection: 'row', gap: 16, marginRight: 8 }}>
                  <TouchableOpacity onPress={() => { /* handled by live screen */ }}>
                    <Ionicons name="person-circle-outline" size={28} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('settings' as any)}>
                    <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              );
            }
            return (
              <TouchableOpacity onPress={() => router.push('settings' as any)} style={{ marginRight: 8 }}>
                <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            );
          },
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
        <Stack.Screen name="live" options={{ title: 'Live Hub' }} />
        <Stack.Screen name="incidents" options={{ title: 'Incidents' }} />
        <Stack.Screen name="article/[id]" options={{ title: 'Article' }} />
      </Stack>
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
});