import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { validateEnv } from "@/config/env";

// Prevent native splash from auto-hiding
SplashScreen.preventAutoHideAsync();

interface AppReadyState {
  isReady: boolean;
  showCustomSplash: boolean;
  onLayoutReady: () => Promise<void>;
  onSplashComplete: () => void;
  loadError: string | null;
}

export function useAppReady(): AppReadyState {
  const [isReady, setIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // 1. Load custom fonts
        await Font.loadAsync({
          "DMSans-Regular": require("@assets/fonts/DMSans-Regular.ttf"),
          "DMSans-Medium": require("@assets/fonts/DMSans-Medium.ttf"),
          "DMSans-Bold": require("@assets/fonts/DMSans-Bold.ttf"),
          "DMMono-Regular": require("@assets/fonts/DMMono-Regular.ttf"),
        });

        // 2. Validate environment variables
        const { valid, missing } = validateEnv();
        if (!valid) {
          console.warn("Non-critical: missing env vars:", missing);
        }

        // 3. Future: Firebase init, cache preload, etc.

      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown load error";
        console.error("App preparation failed:", message);
        setLoadError(message);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  // Called when root layout is mounted and ready
  const onLayoutReady = useCallback(async () => {
    if (isReady) {
      // Hide the native splash screen
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Called when custom animated splash finishes
  const onSplashComplete = useCallback(() => {
    setShowCustomSplash(false);
  }, []);

  return {
    isReady,
    showCustomSplash,
    onLayoutReady,
    onSplashComplete,
    loadError,
  };
}