// src/components/core/SplashScreen.tsx
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Calculate logo size: 60% of screen width, but capped at 300px
const LOGO_SIZE = Math.min(SCREEN_WIDTH * 0.6, 300);

interface Props {
  onComplete: () => void;
}

export function CustomSplashScreen({ onComplete }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const devLogoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
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
      Animated.timing(subtitleOpacity, {
        toValue: 0.7,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(devLogoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(onComplete, 1000);
    });
  }, []);

  return (
    <View style={styles.container}>
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
          source={require("@assets/brand/cshad-isentinel-logo-main.png")}
          style={styles.mainLogo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Community Safety & Opportunities
      </Animated.Text>

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
    marginTop: -50,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  mainLogo: {
    width: "100%",
    height: "100%",
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