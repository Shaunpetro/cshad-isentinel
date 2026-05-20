// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Typography } from "@/config/theme";
import { useTheme } from "@/contexts";

type TabIcon = React.ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: string;
  titleKey: string;
  icon: TabIcon;
  iconFocused: TabIcon;
}

const TABS: TabConfig[] = [
  {
    name: "index",
    titleKey: "tabs.news",
    icon: "newspaper-outline",
    iconFocused: "newspaper",
  },
  {
    name: "map",
    titleKey: "tabs.map",
    icon: "map-outline",
    iconFocused: "map",
  },
  {
    name: "opportunities",
    titleKey: "tabs.opportunities",
    icon: "ribbon-outline",
    iconFocused: "ribbon",
  },
  {
    name: "tip",
    titleKey: "tabs.tip",
    icon: "shield-outline",
    iconFocused: "shield",
  },
  {
    name: "alerts",
    titleKey: "tabs.alerts",
    icon: "notifications-outline",
    iconFocused: "notifications",
  },
  {
    name: "settings",
    titleKey: "tabs.settings",
    icon: "settings-outline",
    iconFocused: "settings",
  },
];

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.fonts.medium,
          fontSize: Typography.sizes.tiny,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.titleKey),
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}