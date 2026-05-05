// app.config.ts
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: "CSHAD iSentinel News",
  slug: "cshad-isentinel-news",
  version: "1.263.4",
  orientation: "portrait",
  icon: "./assets/brand/app-icon-cshad.png",
  scheme: "cshad-isentinel",
  userInterfaceStyle: "automatic",

  splash: {
    image: "./assets/brand/ihub-main-logo.png",
    resizeMode: "contain",
    backgroundColor: "#1C1C1C",
  },

  assetBundlePatterns: ["**/*"],

  ios: {
    supportsTablet: true,
    bundleIdentifier: "cshad.isentinel.news",
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    },
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
    },
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/brand/app-icon-cshad.png",
      backgroundColor: "#1C1C1C",
    },
    package: "cshad.isentinel.news",
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
      },
    },
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/brand/app-icon-cshad.png",
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
        icon: "./assets/brand/app-icon-cshad.png",
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
    developer: "Petro@ATG",
    eas: {
      projectId: "41d9d284-b014-48ab-9238-fe2c0724fd98",
    },
  },
});