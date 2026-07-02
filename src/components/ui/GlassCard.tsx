// src/components/ui/GlassCard.tsx
// Beta 4 - Phase 1: Reusable glassmorphism card wrapper with real blur

import React, { ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts';

interface GlassCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  tint?: string;
  noPadding?: boolean;
}

export default function GlassCard({ children, onPress, style, tint, noPadding }: GlassCardProps) {
  const theme = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: tint || theme.glass.bg,
    borderColor: theme.glass.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: noPadding ? 0 : 16,
    overflow: 'hidden', // needed for BlurView containment
    ...(style as object),
  };

  const content = (
    <>
      <BlurView intensity={theme.isDark ? 30 : 50} style={StyleSheet.absoluteFill} tint={theme.isDark ? 'dark' : 'light'} />
      <View style={{ padding: noPadding ? 0 : 16 }}>{children}</View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={cardStyle}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}