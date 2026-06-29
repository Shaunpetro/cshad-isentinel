import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const expoConfig: ExpoConfig = {
    name: "CSHAD iSentinel News",
    slug: "cshadnews",
    owner: process.env.EAS_OWNER || "shaunatg", // fallback to shaunatg
    version: "2.2606.01", // Updated to June 2026, Phase 01
    runtimeVersion: {
      policy: "appVersion",
    },
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
      versionCode: 9, // Kept at 9 to match last AAB
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
    ],

    experiments: {
      typedRoutes: true,
    },

    updates: {
      url: "https://u.expo.dev/ce9ad511-1168-4d71-941d-35a5f4214892",
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 3000,
    },

    extra: {
      buildPhase: "004",
      phaseMonth: "June 2026",
      buildDate: new Date().toISOString(),
      developer: "Petro@ATG",
      eas: {
        projectId: process.env.EAS_PROJECT_ID || "ce9ad511-1168-4d71-941d-35a5f4214892",
      },
    },
  };

  // @ts-ignore - newArchEnabled is valid but not in the installed type definitions
  expoConfig.newArchEnabled = false;

  return expoConfig;
};