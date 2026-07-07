// src/components/home/BreakingNewsCarousel.tsx
// Phase 1 – Real breaking-news carousel

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import GlassCard from '../ui/GlassCard';
import { useTheme } from '../../contexts';
import type { NewsItem } from '../../types';

interface Props {
  articles: NewsItem[];
  isLoading?: boolean;
}

export default function BreakingNewsCarousel({ articles, isLoading }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const handlePress = useCallback(
    (article: NewsItem) => {
      router.push({ pathname: '/(stack)/article/[id]', params: { id: article.id } });
    },
    [router]
  );

  const renderItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      onPress={() => handlePress(item)}
      style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      activeOpacity={0.8}
    >
      <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.cardSummary, { color: theme.colors.textSecondary }]} numberOfLines={1}>
        {item.summary}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <GlassCard tint={theme.pastel.peach}>
        <Text style={[styles.placeholder, { color: theme.colors.text }]}>
          {t('common.loading')}
        </Text>
      </GlassCard>
    );
  }

  if (articles.length === 0) {
    return (
      <GlassCard tint={theme.pastel.peach}>
        <Text style={[styles.placeholder, { color: theme.colors.text }]}>
          🚨 {t('home.breakingNews')}
        </Text>
        <Text style={[styles.placeholderSub, { color: theme.colors.text }]}>
          No active alerts. Carousel coming soon.
        </Text>
      </GlassCard>
    );
  }

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        🚨 {t('home.breakingNews')}
      </Text>
      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  list: {
    paddingHorizontal: 4,
  },
  card: {
    width: 220,
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardSummary: {
    fontSize: 12,
  },
  placeholder: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeholderSub: {
    fontSize: 14,
  },
});