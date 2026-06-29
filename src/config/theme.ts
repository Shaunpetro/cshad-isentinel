// beta4/src/config/theme.ts
/**
 * Design System — Colors, Typography, Spacing
 * Carbon-inspired dark theme with bright accents
 */

export const Colors = {
  // Primary carbon palette
  carbon: {
    black: "#1C1C1C", // Matt carbon black (splash, backgrounds)
    charcoal: "#2B2B2B", // Cards, surfaces
    steel: "#404040", // Borders, inactive elements
    silver: "#8A8A8A", // Secondary text
    white: "#FFFFFF", // Primary text, icons
  },

  // Semantic accent colors
  semantic: {
    primary: "#00D4AA", // Teal — brand, active, success
    danger: "#FF4757", // Red — critical alerts, errors, SOS
    warning: "#FFA726", // Orange — warnings, medium severity
    info: "#42A5F5", // Blue — information, links
    success: "#66BB6A", // Green — verified, safe, completed
  },

  // Severity levels for map pins and alerts
  severity: {
    critical: "#FF4757", // Red — critical/emergency
    high: "#FFA726", // Orange — high severity
    medium: "#42A5F5", // Blue — medium severity
    low: "#66BB6A", // Green — low severity
  },

  // Special purpose
  special: {
    premium: "#FFD700", // Gold — premium features, donations
    anonymous: "#9C27B0", // Purple — anonymity indicators
    verified: "#2196F3", // Blue — official/verified sources
  },

  // Transparent overlays
  overlay: {
    light: "rgba(255, 255, 255, 0.1)",
    medium: "rgba(0, 0, 0, 0.5)",
    heavy: "rgba(0, 0, 0, 0.8)",
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const Typography = {
  fonts: {
    regular: "DMSans-Regular",
    medium: "DMSans-Medium",
    bold: "DMSans-Bold",
    mono: "DMMono-Regular",
  },

  sizes: {
    hero: 32,
    title: 24,
    heading: 20,
    body: 16,
    caption: 14,
    label: 12,
    tiny: 10,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

// ---- Theme Objects ----

export const DarkTheme = {
  dark: true,
  colors: {
    background: Colors.carbon.black,
    surface: Colors.carbon.charcoal,
    card: Colors.carbon.charcoal,
    border: Colors.carbon.steel,
    notification: Colors.semantic.danger,
    primary: Colors.semantic.primary,
    text: Colors.carbon.white,

    // Added semantic colors missing from previous version
    textSecondary: Colors.carbon.silver,
    textDisabled: Colors.carbon.steel,
    textInverse: Colors.carbon.black,
    divider: Colors.carbon.steel,
    danger: Colors.semantic.danger,
    warning: Colors.semantic.warning,
    info: Colors.semantic.info,
    success: Colors.semantic.success,
    statusBar: 'light' as const,
  },
  text: {
    primary: Colors.carbon.white,
    secondary: Colors.carbon.silver,
    disabled: Colors.carbon.steel,
    inverse: Colors.carbon.black,
  },
  glass: {
    bg: 'rgba(20,20,20,0.7)',
    border: 'rgba(255,255,255,0.1)',
  },
  pastel: {
    blue: '#2C3E50',
    green: '#2D4A3E',
    peach: '#5D4037',
    lavender: '#4A3B5C',
    mint: '#1E4D3A',
    rose: '#5C3B4A',
  },
} as const;

export const LightTheme = {
  dark: false,
  colors: {
    background: "#FAFAFA",
    surface: Colors.carbon.white,
    card: Colors.carbon.white,
    border: "#E0E0E0",
    notification: Colors.semantic.danger,
    primary: Colors.semantic.primary,
    text: Colors.carbon.black,

    // Added semantic colors
    textSecondary: Colors.carbon.steel,
    textDisabled: Colors.carbon.silver,
    textInverse: Colors.carbon.white,
    divider: "#E8E8E8",
    danger: Colors.semantic.danger,
    warning: Colors.semantic.warning,
    info: Colors.semantic.info,
    success: Colors.semantic.success,
    statusBar: 'dark' as const,
  },
  text: {
    primary: Colors.carbon.black,
    secondary: Colors.carbon.steel,
    disabled: Colors.carbon.silver,
    inverse: Colors.carbon.white,
  },
  glass: {
    bg: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,255,255,0.3)',
  },
  pastel: {
    blue: '#D0E4F5',
    green: '#D4EDDA',
    peach: '#FDE2D3',
    lavender: '#E8D5F5',
    mint: '#D5F5E3',
    rose: '#F5D5E0',
  },
} as const;

// ---- Shadows (Android elevation + iOS shadow) ----

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;