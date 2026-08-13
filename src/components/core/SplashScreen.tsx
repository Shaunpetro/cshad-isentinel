// src/components/core/SplashScreen.tsx
// Beta 4 – Fixed splash with 5% padding, responsive subtitle, refined logo size

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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Logo size: 48% of screen width, capped at 260px (less likely to overflow)
const LOGO_SIZE = Math.min(SCREEN_WIDTH * 0.48, 260);

// Responsive subtitle font size
const SUBTITLE_FONT_SIZE = Math.min(SCREEN_WIDTH * 0.042, Typography.sizes.body);

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
        toValue: 0.85,
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

      <Animated.Text
        style={[
          styles.subtitle,
          { opacity: subtitleOpacity },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        Community Safety &amp; Opportunities
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
    paddingHorizontal: "5%",   // ← 5% horizontal spacing
    zIndex: 9999,
  },
  logoWrapper: {
    alignItems: "center",
    marginTop: -40,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  mainLogo: {
    width: "100%",
    height: "100%",
  },
  subtitle: {
    color: Colors.carbon.white,
    fontSize: SUBTITLE_FONT_SIZE,
    fontFamily: Typography.fonts.medium,
    marginTop: 20,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
    width: "100%",
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