// app.config.ts
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const expoConfig: ExpoConfig = {
    name: "CSHAD iSentinel News",
    slug: "cshad-isentinel-news", // TEMPORARY: hardcoded for preview-prod build
    owner: "shaunpetro",           // TEMPORARY: hardcoded for preview-prod build
    version: "3.2608.02",
    runtimeVersion: "3.2608.02",
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
      versionCode: 16,
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
      "expo-tracking-transparency",
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ?? "ca-app-pub-6042612781832936~9491041854",
          iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ?? "",
          userTrackingUsageDescription:
            "This identifier is used to show you more relevant ads and keep CSHAD iSentinel free.",
          delayAppMeasurementInit: true,
        },
      ],
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
        projectId: "41d9d284-b014-48ab-9238-fe2c0724fd98", // TEMPORARY: hardcoded for preview-prod build
      },
    },
  };

  return expoConfig;
};