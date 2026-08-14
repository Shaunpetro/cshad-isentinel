// app.config.ts
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const expoConfig: ExpoConfig = {
    name: "CSHAD iSentinel News",
    slug: process.env.EAS_SLUG || "cshadnews",
    owner: process.env.EAS_OWNER || "shaunatg",
    version: "3.2608.01",
    runtimeVersion: "3.2608.01",
    orientation: "portrait",
    icon: "./assets/brand/cshad-isentinel-logo-icon.png",
    scheme: "cshad-isentinel",
    userInterfaceStyle: "automatic",

    splash: {
      image: "./assets/brand/cshad-isentinel-logo-fs.png",
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
        foregroundImage: "./assets/brand/cshad-isentinel-logo-icon.png",
        backgroundColor: "#1C1C1C",
      },
      package: "cshad.isentinel.news",
      versionCode: 15,
      googleServicesFile: "./google-services.json",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        },
      },
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/brand/cshad-isentinel-logo-icon.png",
    },

    plugins: [
      "expo-router",
      "expo-font",
      "expo-splash-screen",
      "expo-localization",
      "expo-secure-store",
      "expo-dev-client",
      "expo-sharing",
      "expo-web-browser",
      // "react-native-google-mobile-ads"  ← removed
    ],

    experiments: {
      typedRoutes: true,
    },

    updates: {
      url: "https://u.expo.dev/41d9d284-b014-48ab-9238-fe2c0724fd98",
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 3000,
    },

    extra: {
      buildPhase: "004",
      phaseMonth: "August 2026",
      buildDate: new Date().toISOString(),
      developer: "Petro@ATG",
      eas: {
        projectId: process.env.EAS_PROJECT_ID || "41d9d284-b014-48ab-9238-fe2c0724fd98",
      },
    },
  };

  // @ts-ignore
  expoConfig.newArchEnabled = false;

  return expoConfig;
};