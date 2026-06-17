// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add SVG transformer (unchanged)
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
  // Force Hermes-stable profile for maximum ES5 compatibility
  unstable_transformProfile: 'hermes-stable',
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

module.exports = config;