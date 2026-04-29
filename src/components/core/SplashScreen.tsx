import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Colors, Typography } from "@/config/theme";

const { width } = Dimensions.get("window");

interface Props {
  onComplete: () => void;
}

export function CustomSplashScreen({ onComplete }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const devLogoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered fade-in sequence
    Animated.sequence([
      // 1. Main logo fades in and scales up
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // 2. Subtitle fades in
      Animated.timing(subtitleOpacity, {
        toValue: 0.7,
        duration: 400,
        useNativeDriver: true,
      }),

      // 3. Developer logo fades in
      Animated.timing(devLogoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold for 1 second then signal completion
      setTimeout(onComplete, 1000);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Main Logo — centered, slightly above middle */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require("@assets/brand/ihub-main-logo.png")}
          style={styles.mainLogo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Powered by AI
      </Animated.Text>

      {/* ATG Developer Logo — bottom */}
      <Animated.View
        style={[styles.devLogoWrapper, { opacity: devLogoOpacity }]}
      >
        <Image
          source={require("@assets/brand/main-dev-logo.png")}
          style={styles.devLogo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.carbon.black,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  logoWrapper: {
    alignItems: "center",
    marginTop: -50, // Push slightly above true center
  },
  mainLogo: {
    width: Math.min(width * 0.6, 300),
    height: Math.min(width * 0.6, 300),
  },
  subtitle: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    marginTop: 20,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  devLogoWrapper: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  devLogo: {
    width: 80,
    height: 80,
  },
});