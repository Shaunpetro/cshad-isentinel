// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "@/config/theme";
import { useTheme } from "@/contexts";

type TabIcon = React.ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: string;
  title: string;
  icon: TabIcon;
  iconFocused: TabIcon;
}

const TABS: TabConfig[] = [
  {
    name: "index",
    title: "News",
    icon: "newspaper-outline",
    iconFocused: "newspaper",
  },
  {
    name: "map",
    title: "Map",
    icon: "map-outline",
    iconFocused: "map",
  },
  {
    name: "tip",
    title: "Report",
    icon: "shield-outline",
    iconFocused: "shield",
  },
  {
    name: "alerts",
    title: "Alerts",
    icon: "notifications-outline",
    iconFocused: "notifications",
  },
  {
    name: "settings",
    title: "Settings",
    icon: "settings-outline",
    iconFocused: "settings",
  },
];

export default function TabLayout() {
  const { colors } = useTheme();

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
          height: 60,
          paddingBottom: 8,
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
            title: tab.title,
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