// v1.263_001/src/components/news/SafetyMap.tsx
import { Platform } from "react-native";

// Platform-specific exports
export const SafetyMap = Platform.OS === "web"
  ? require("./SafetyMap.web").SafetyMapWeb
  : require("./SafetyMap.native").SafetyMapNative;