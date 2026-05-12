// src/components/core/OnboardingScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, BorderRadius } from '@/config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: 'shield-checkmark-outline',
    title: 'Welcome to CSHAD iSentinel News',
    subtitle: 'South Africa\'s privacy‑first community safety intelligence app.\nReal‑time news, weather, load shedding, and hazards — all anonymous.',
  },
  {
    icon: 'location-outline',
    title: 'Know Your Surroundings',
    subtitle: 'We need your location to show local incident maps and alerts.\nYou can change this anytime in Settings.',
    action: 'enableLocation',
  },
  {
    icon: 'notifications-outline',
    title: 'Stay Alert, Stay Safe',
    subtitle: 'Get notified about breaking news, severe weather, and power outages in your area.',
    action: 'enableNotifications',
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') setLocationGranted(true);
  };

  const requestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') setNotificationsGranted(true);
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        bounces={false}
      >
        {SLIDES.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Ionicons name={slide.icon} size={80} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{slide.subtitle}</Text>

            {/* Permission buttons (show only on relevant slides) */}
            {slide.action === 'enableLocation' && !locationGranted && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={requestLocation}>
                <Ionicons name="locate" size={20} color="#fff" />
                <Text style={styles.actionText}>Enable Location</Text>
              </TouchableOpacity>
            )}
            {slide.action === 'enableLocation' && locationGranted && (
              <View style={styles.permissionGranted}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={[styles.permissionGrantedText, { color: '#4CAF50' }]}>Location granted</Text>
              </View>
            )}

            {slide.action === 'enableNotifications' && !notificationsGranted && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={requestNotifications}>
                <Ionicons name="notifications" size={20} color="#fff" />
                <Text style={styles.actionText}>Enable Notifications</Text>
              </TouchableOpacity>
            )}
            {slide.action === 'enableNotifications' && notificationsGranted && (
              <View style={styles.permissionGranted}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={[styles.permissionGrantedText, { color: '#4CAF50' }]}>Notifications granted</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <TouchableOpacity key={index} onPress={() => goToSlide(index)}>
              <View style={[styles.dot, { backgroundColor: index === currentIndex ? colors.primary : colors.border }]} />
            </TouchableOpacity>
          ))}
        </View>

        {isLastSlide ? (
          <TouchableOpacity style={[styles.finishBtn, { backgroundColor: colors.primary }]} onPress={onComplete}>
            <Text style={styles.finishText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.surface }]} onPress={() => goToSlide(currentIndex + 1)}>
            <Text style={[styles.nextText, { color: colors.primary }]}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  actionText: { color: '#fff', fontSize: Typography.sizes.body, fontFamily: Typography.fonts.bold, marginLeft: Spacing.sm },
  permissionGranted: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  permissionGrantedText: { marginLeft: Spacing.sm, fontSize: Typography.sizes.body, fontFamily: Typography.fonts.medium },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  nextText: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.bold, marginRight: Spacing.xs },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D4AA',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  finishText: { color: '#fff', fontSize: Typography.sizes.body, fontFamily: Typography.fonts.bold, marginRight: Spacing.xs },
});