// src/contexts/ThemeContext.tsx
/**
 * Theme Context
 * Provides app-wide theme state and switching functionality
 * Supports Dark, Light, and System modes
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
  } from 'react';
  import { useColorScheme, Appearance } from 'react-native';
  import {
    AppearanceMode,
    initializePreferences,
    setAppearance as saveAppearance,
    getPreferences,
  } from '@/services/preferences';
  import { Colors, DarkTheme, LightTheme } from '@/config/theme';
  
  // ---- Theme Types ----
  
  export interface ThemeColors {
    // Backgrounds
    background: string;
    surface: string;
    card: string;
    
    // Text
    text: string;
    textSecondary: string;
    textDisabled: string;
    textInverse: string;
    
    // UI Elements
    border: string;
    divider: string;
    
    // Status bar
    statusBar: 'light' | 'dark';
    
    // Keep semantic colors (same for both themes)
    primary: string;
    danger: string;
    warning: string;
    info: string;
    success: string;
  }
  
  export interface ThemeContextValue {
    // Current theme mode
    mode: AppearanceMode;
    
    // Resolved theme (what's actually displayed)
    isDark: boolean;
    
    // Theme colors
    colors: ThemeColors;
    
    // Change theme
    setMode: (mode: AppearanceMode) => Promise<void>;
    
    // Loading state
    isLoading: boolean;
  }
  
  // ---- Theme Definitions ----
  
  const darkColors: ThemeColors = {
    background: Colors.carbon.black,
    surface: Colors.carbon.charcoal,
    card: Colors.carbon.charcoal,
    text: Colors.carbon.white,
    textSecondary: Colors.carbon.silver,
    textDisabled: Colors.carbon.steel,
    textInverse: Colors.carbon.black,
    border: Colors.carbon.steel,
    divider: Colors.carbon.steel,
    statusBar: 'light',
    primary: Colors.semantic.primary,
    danger: Colors.semantic.danger,
    warning: Colors.semantic.warning,
    info: Colors.semantic.info,
    success: Colors.semantic.success,
  };
  
  const lightColors: ThemeColors = {
    background: '#FAFAFA',
    surface: Colors.carbon.white,
    card: Colors.carbon.white,
    text: Colors.carbon.black,
    textSecondary: Colors.carbon.steel,
    textDisabled: Colors.carbon.silver,
    textInverse: Colors.carbon.white,
    border: '#E0E0E0',
    divider: '#E8E8E8',
    statusBar: 'dark',
    primary: Colors.semantic.primary,
    danger: Colors.semantic.danger,
    warning: Colors.semantic.warning,
    info: Colors.semantic.info,
    success: Colors.semantic.success,
  };
  
  // ---- Context ----
  
  const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
  
  // ---- Provider ----
  
  interface ThemeProviderProps {
    children: React.ReactNode;
  }
  
  export function ThemeProvider({ children }: ThemeProviderProps) {
    const systemColorScheme = useColorScheme();
    const [mode, setModeState] = useState<AppearanceMode>('dark');
    const [isLoading, setIsLoading] = useState(true);
  
    // Initialize from stored preferences
    useEffect(() => {
      let mounted = true;
  
      async function init() {
        try {
          const prefs = await initializePreferences();
          if (mounted) {
            setModeState(prefs.appearance);
          }
        } catch (error) {
          console.error('[ThemeContext] Init error:', error);
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      }
  
      init();
  
      return () => {
        mounted = false;
      };
    }, []);
  
    // Listen for system theme changes
    useEffect(() => {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        // Only matters if user has "system" selected
        const currentMode = getPreferences().appearance;
        if (currentMode === 'system') {
          // Force re-render by updating state
          setModeState('system');
        }
      });
  
      return () => subscription.remove();
    }, []);
  
    // Calculate if we should use dark theme
    const isDark = useMemo(() => {
      if (mode === 'system') {
        return systemColorScheme !== 'light';
      }
      return mode === 'dark';
    }, [mode, systemColorScheme]);
  
    // Get current colors
    const colors = useMemo(() => {
      return isDark ? darkColors : lightColors;
    }, [isDark]);
  
    // Set mode and persist
    const setMode = useCallback(async (newMode: AppearanceMode) => {
      setModeState(newMode);
      await saveAppearance(newMode);
      console.log('[ThemeContext] Theme changed to:', newMode);
    }, []);
  
    const value: ThemeContextValue = {
      mode,
      isDark,
      colors,
      setMode,
      isLoading,
    };
  
    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    );
  }
  
  // ---- Hook ----
  
  export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    
    if (context === undefined) {
      throw new Error('useTheme must be used within a ThemeProvider');
    }
    
    return context;
  }
  
  // ---- Utility Hook for Quick Access ----
  
  export function useThemeColors(): ThemeColors {
    const { colors } = useTheme();
    return colors;
  }