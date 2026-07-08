// src/components/home/BreakingNewsCarousel.tsx
// Beta 4 – Breaking news card with image, city & radius dropdowns, auto‑sliding headline

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts';
import RadiusPickerModal from '../location/RadiusPickerModal';
import type { NewsItem } from '../../types';
import type { SACity } from '@/services/location';

const SLIDE_INTERVAL = 45000;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = 32;

interface Props {
  articles: NewsItem[];
  isLoading?: boolean;
  currentCity: SACity | null;
  radiusKm: number;
  onCityPress: () => void;
  onRadiusChange: (radius: number) => void;
}

export default function BreakingNewsCarousel({
  articles,
  isLoading,
  currentCity,
  radiusKm,
  onCityPress,
  onRadiusChange,
}: Props) {
  const theme = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [radiusVisible, setRadiusVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleArticlePress = useCallback(
    (article: NewsItem) => {
      router.push({ pathname: '/(stack)/article/[id]', params: { id: article.id } });
    },
    [router]
  );

  useEffect(() => {
    if (!articles || articles.length === 0) return;
    setCurrentIndex(0);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }, SLIDE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [articles]);

  if (isLoading || !articles || articles.length === 0) {
    return null;
  }

  const currentArticle = articles[currentIndex];
  const hasImage = !!currentArticle.imageUrl;

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card || theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {/* Top bar: city pill + radius dropdown */}
        <View style={styles.controlsRow}>
          {/* City pill */}
          <TouchableOpacity
            style={[styles.cityPill, { borderColor: theme.colors.border }]}
            onPress={onCityPress}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={14} color={theme.colors.primary} />
            <Text style={[styles.pillText, { color: theme.colors.text }]} numberOfLines={1}>
              {currentCity?.name || 'Select city'}
            </Text>
            <Ionicons name="chevron-down" size={12} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Radius dropdown */}
          <TouchableOpacity
            style={[styles.radiusPill, { borderColor: theme.colors.border }]}
            onPress={() => setRadiusVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="radio-outline" size={14} color={theme.colors.primary} />
            <Text style={[styles.pillText, { color: theme.colors.text }]}>{radiusKm} km</Text>
            <Ionicons name="chevron-down" size={12} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Article image (if available) */}
        {hasImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentArticle.imageUrl }}
              style={styles.articleImage}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.imageOverlay} />
          </View>
        )}

        {/* Headline area */}
        <TouchableOpacity
          onPress={() => handleArticlePress(currentArticle)}
          activeOpacity={0.9}
          style={[styles.headlineArea, hasImage && styles.headlineOverlay]}
        >
          <Animated.View style={[styles.headlineRow, { opacity: slideAnim }]}>
            <View style={styles.badgeContainer}>
              <View style={[styles.liveDot, { backgroundColor: theme.colors.danger }]} />
              <Text style={[styles.breakingLabel, { color: theme.colors.danger }]}>BREAKING</Text>
            </View>
            <Text
              style={[styles.title, { color: hasImage ? '#FFFFFF' : theme.colors.text }]}
              numberOfLines={2}
            >
              {currentArticle.title}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Radius picker modal */}
      <RadiusPickerModal
        visible={radiusVisible}
        selected={radiusKm}
        onSelect={onRadiusChange}
        onClose={() => setRadiusVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - CARD_HORIZONTAL_PADDING,
    alignSelf: 'center',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    flex: 1,
  },
  radiusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
  },
  imageContainer: {
    position: 'relative',
  },
  articleImage: {
    width: '100%',
    height: 130,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  headlineArea: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 6,
  },
  headlineOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakingLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});