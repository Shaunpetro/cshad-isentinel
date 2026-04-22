// src/components/news/NewsList.tsx
import React from "react";
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Typography, Spacing } from "@/config/theme";
import { NewsCard } from "./NewsCard";
import type { NewsItem } from "@/types";

interface Props {
  articles: NewsItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastSynced: string | null;
  onRefresh: () => void;
  onArticlePress: (article: NewsItem) => void;
  ListHeaderComponent?: React.ReactElement;
}

export function NewsList({
  articles,
  isLoading,
  isRefreshing,
  error,
  onRefresh,
  onArticlePress,
  ListHeaderComponent,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Loading state - but still show header
  if (isLoading && articles.length === 0) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {ListHeaderComponent}
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t("common.loading")}
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Error state - still show header so user can change filters
  if (error && articles.length === 0) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {ListHeaderComponent}
        <View style={styles.stateContainer}>
          <Text style={styles.stateIcon}>⚠️</Text>
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            {t("common.error")}
          </Text>
          <Text style={[styles.stateMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={onRefresh}
          >
            <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Empty state - still show header so user can change filters
  if (articles.length === 0) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {ListHeaderComponent}
        <View style={styles.stateContainer}>
          <Text style={styles.stateIcon}>📰</Text>
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            {t("news.noNews")}
          </Text>
          <Text style={[styles.stateMessage, { color: colors.textSecondary }]}>
            {t("news.pullToRefresh")}
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Normal list with articles
  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NewsCard article={item} onPress={onArticlePress} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    minHeight: 300,
  },
  loadingText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.md,
  },
  stateIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  stateTitle: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  stateMessage: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
});