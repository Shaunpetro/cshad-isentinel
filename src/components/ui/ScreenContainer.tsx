// src/components/ui/ScreenContainer.tsx
// Beta 4 – Full‑height container with consistent 5% horizontal padding

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface ScreenContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenContainer({ children, style }: ScreenContainerProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '5%',
  },
});