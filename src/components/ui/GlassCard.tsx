// src/components/ui/GlassCard.tsx
// Beta 4 - Phase 1: Reusable glassmorphism card wrapper

import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '@/config/theme'; // fixed import path

interface GlassCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tint?: string;
  noPadding?: boolean;
}

export default function GlassCard({ children, onPress, style, tint, noPadding }: GlassCardProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  const cardStyle: ViewStyle = {
    backgroundColor: tint || theme.glass.bg,
    borderColor: theme.glass.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: noPadding ? 0 : 16,
    ...(style as object),
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
