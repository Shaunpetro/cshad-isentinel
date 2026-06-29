// src/components/ui/GlassButton.tsx
// Beta 4 - Phase 1: Reusable glassmorphism button with home variant

import React from 'react';
import { TouchableOpacity, Text, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '@/config/theme';

interface GlassButtonProps {
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'home';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export default function GlassButton({ title, icon, onPress, variant = 'primary', style, textStyle, disabled }: GlassButtonProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  const isHome = variant === 'home';

  const buttonStyle: ViewStyle = {
    backgroundColor: isHome ? theme.pastel.blue : theme.glass.bg,
    borderColor: theme.glass.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: disabled ? 0.5 : 1,
    ...(style as object),
  };

  const labelStyle: TextStyle = {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 16,
    ...(textStyle as object),
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={buttonStyle} disabled={disabled}>
      {icon && <Ionicons name={icon} size={20} color={theme.colors.text} />}
      {title && <Text style={labelStyle}>{title}</Text>}
    </TouchableOpacity>
  );
}
