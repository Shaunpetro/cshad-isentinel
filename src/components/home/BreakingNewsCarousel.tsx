// src/components/home/BreakingNewsCarousel.tsx
// Beta 4 – Breaking news carousel with integrated location & radius picker

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts';
import type { NewsItem } from '../../types';
import type { SACity } from '@/services/location';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];
const SLIDE_INTERVAL = 45000; // 45 seconds
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
  const slideAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePress = useCallback(
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
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card || theme.colors.surface, borderColor: theme.colors.border }]}>
      {/* Header: city pill + radius pills */}
      <View style={styles.header}>
        {/* City pill (left) */}
        <TouchableOpacity
          style={[styles.cityPill, { borderColor: theme.colors.border }]}
          onPress={onCityPress}
        >
          <Ionicons name="location" size={14} color={theme.colors.primary} />
          <Text style={[styles.cityText, { color: theme.colors.text }]} numberOfLines={1}>
            {currentCity?.name || 'Select city'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Radius pills (right) */}
        <View style={styles.radiusRow}>
          {RADIUS_OPTIONS.map((r) => {
            const isActive = r === (radiusKm || 25);
            return (
              <TouchableOpacity
                key={r}
                onPress={() => onRadiusChange(r)}
                style={[
                  styles.radiusPill,
                  {
                    backgroundColor: isActive ? theme.colors.primary : 'transparent',
                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.radiusPillText, { color: isActive ? '#FFFFFF' : theme.colors.text }]}
                >
                  {r}km
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Breaking news headline */}
      <TouchableOpacity
        onPress={() => handlePress(currentArticle)}
        activeOpacity={0.9}
        style={styles.headlineArea}
      >
        <Animated.View style={[styles.headlineRow, { opacity: slideAnim }]}>
          <View style={styles.badgeContainer}>
            <View style={[styles.liveDot, { backgroundColor: theme.colors.danger }]} />
            <Text style={[styles.breakingLabel, { color: theme.colors.danger }]}>BREAKING</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
            {currentArticle.title}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - CARD_HORIZONTAL_PADDING,
    alignSelf: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  cityText: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    maxWidth: 80,
  },
  radiusRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  radiusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  radiusPillText: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
  },
  headlineArea: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakingLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});