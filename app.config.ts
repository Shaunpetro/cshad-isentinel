// v1.263_001/app.config.ts
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: "PSHAD Sentinel iHub",
  slug: "pshad-sentinel-ihub",
  version: "1.263.4",
  orientation: "portrait",
  icon: "./assets/icons/app-icon.png",
  scheme: "pshad-sentinel",
  userInterfaceStyle: "automatic",

  splash: {
    image: "./assets/splash/splash.png",
    resizeMode: "contain",
    backgroundColor: "#1C1C1C",
  },

  assetBundlePatterns: ["**/*"],

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.atg.pshad.sentinel",
    config: {
      googleMapsApiKey: "AIzaSyBhOSPYnYnoraCNu44xqtTw6C-_8KZF4ew",
    },
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
    },
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icons/adaptive-icon.png",
      backgroundColor: "#1C1C1C",
    },
    package: "com.atg.pshad.sentinel",
    config: {
      googleMaps: {
        apiKey: "AIzaSyBhOSPYnYnoraCNu44xqtTw6C-_8KZF4ew",
      },
    },
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/icons/app-icon.png",
  },

  plugins: [
    "expo-router",
    "expo-font",
    "expo-splash-screen",
    "expo-localization",
    "expo-secure-store",
    "expo-dev-client",
    [
      "expo-notifications",
      {
        icon: "./assets/icons/notification-icon.png",
        color: "#00D4AA",
        defaultChannel: "default",
        sounds: [],
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    buildPhase: "001",
    phaseMonth: "March 2026",
    buildDate: new Date().toISOString(),
    developer: "ATG Development",
    eas: {
      projectId: "",
    },
  },
});