// src/components/home/BreakingNewsCarousel.tsx
// Beta 4 – Breaking news carousel with section header, swipeable headlines, city & radius controls

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts';
import RadiusPickerModal from '../location/RadiusPickerModal';
import type { NewsItem } from '../../types';
import type { SACity } from '@/services/location';

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];
const SLIDE_INTERVAL = 45000;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 64; // 32px padding on each side
const ITEM_WIDTH = CARD_WIDTH; // each item fills the card width

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
  const flatListRef = useRef<FlatList<NewsItem>>(null);
  const autoSlideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUserInteracting = useRef(false);

  const handleArticlePress = useCallback(
    (article: NewsItem) => {
      router.push({ pathname: '/(stack)/article/[id]', params: { id: article.id } });
    },
    [router]
  );

  // Auto‑slide logic
  useEffect(() => {
    if (!articles || articles.length === 0) return;
    if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);

    autoSlideTimer.current = setInterval(() => {
      if (isUserInteracting.current) return;
      setCurrentIndex((prev) => {
        const next = (prev + 1) % articles.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, SLIDE_INTERVAL);

    return () => {
      if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
    };
  }, [articles]);

  const onScrollBeginDrag = () => { isUserInteracting.current = true; };
  const onScrollEndDrag = () => {
    // Resume auto‑slide after a short delay
    setTimeout(() => { isUserInteracting.current = false; }, 3000);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  if (isLoading || !articles || articles.length === 0) {
    return null;
  }

  const renderItem = ({ item }: { item: NewsItem }) => {
    const hasImage = !!item.imageUrl;
    return (
      <TouchableOpacity
        style={[styles.itemContainer, { backgroundColor: theme.colors.card || theme.colors.surface }]}
        onPress={() => handleArticlePress(item)}
        activeOpacity={0.9}
      >
        {hasImage && (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} contentFit="cover" />
        )}
        <View style={styles.headlineTextContainer}>
          <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={3}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* Section header */}
      <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
        🚨 Breaking News
      </Text>

      {/* Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.card || theme.colors.surface, borderColor: theme.colors.border }]}>
        {/* Controls row: city pill + radius dropdown */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.cityPill, { borderColor: theme.colors.border }]}
            onPress={onCityPress}
          >
            <Ionicons name="location" size={14} color={theme.colors.primary} />
            <Text style={[styles.pillText, { color: theme.colors.text }]} numberOfLines={1}>
              {currentCity?.name || 'Select city'}
            </Text>
            <Ionicons name="chevron-down" size={12} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.radiusPill, { borderColor: theme.colors.border }]}
            onPress={() => setRadiusVisible(true)}
          >
            <Ionicons name="radio-outline" size={14} color={theme.colors.primary} />
            <Text style={[styles.pillText, { color: theme.colors.text }]}>{radiusKm} km</Text>
            <Ionicons name="chevron-down" size={12} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Swipeable headline row */}
        <FlatList
          ref={flatListRef}
          data={articles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={styles.listContent}
        />
      </View>

      <RadiusPickerModal
        visible={radiusVisible}
        selected={radiusKm}
        onSelect={onRadiusChange}
        onClose={() => setRadiusVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    marginBottom: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
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
  listContent: {
    // No extra padding needed; items fill the width
  },
  itemContainer: {
    width: ITEM_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  headlineTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    lineHeight: 18,
  },
});