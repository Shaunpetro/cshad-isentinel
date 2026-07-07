// app/(stack)/article/[id].tsx
// Beta 4 – Article detail with full summary, source link, and rich layout

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import MapView, { Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";
import { Typography, Spacing, BorderRadius } from "../../../src/config/theme";
import { SeverityBadge, SourceBadge, VerifiedBadge } from "../../../src/components/news";
import { timeAgo, formatDate } from "../../../src/utils/formatters";
import { useNewsArticle } from "../../../src/hooks/useNews";
import { useTheme } from "../../../src/contexts";

export default function NewsDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { article, isLoading, error } = useNewsArticle(id);

  const getCategoryLabel = (category: string): string => {
    const key = `news.categories.${category}`;
    const translated = t(key);
    return translated !== key ? translated.toUpperCase() : category.toUpperCase();
  };

  const handleShare = async () => {
    if (!article) return;
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.summary}\n\n${t("news.shareArticle")} - CSHAD iSentinel`,
      });
    } catch (err) {
      console.error("[NewsDetail] Share error:", err);
    }
  };

  const handleOpenSource = async () => {
    if (article?.sourceUrl) {
      await WebBrowser.openBrowserAsync(article.sourceUrl);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: "",
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t("common.loading")}
          </Text>
        </View>
      </View>
    );
  }

  // Error / not found
  if (error || !article) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: t("common.error"),
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textDisabled} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            {error ? t("common.error") : t("common.noResults")}
          </Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {error || t("common.noResults")}
          </Text>
          <Pressable
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: "#FFFFFF" }]}>
              {t("common.back")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={handleShare} style={styles.headerButton}>
                <Ionicons name="share-outline" size={24} color={colors.text} />
              </Pressable>
              {article.sourceUrl && (
                <Pressable onPress={handleOpenSource} style={styles.headerButton}>
                  <Ionicons name="open-outline" size={24} color={colors.text} />
                </Pressable>
              )}
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {article.imageUrl ? (
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: colors.surface }]}>
            <Ionicons name="newspaper-outline" size={64} color={colors.textDisabled} />
          </View>
        )}

        <View style={styles.content}>
          {/* Category + Severity */}
          <View style={styles.metaRow}>
            <Text style={[styles.category, { color: colors.primary }]}>
              {getCategoryLabel(article.category)}
            </Text>
            <SeverityBadge severity={article.severity} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>

          {/* Source + Verified */}
          <View style={styles.sourceRow}>
            <SourceBadge
              sourceType={article.sourceType}
              sourceName={article.source}
              size="medium"
            />
            <VerifiedBadge
              isVerified={article.isVerified}
              showLabel={true}
              size="medium"
            />
          </View>

          {/* Time + Location */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {timeAgo(article.publishedAt)}
              </Text>
            </View>
            {article.locationName && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text
                  style={[styles.infoText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {article.locationName}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Full summary as the main article body */}
          <Text style={[styles.articleBody, { color: colors.text }]}>
            {article.summary}
          </Text>

          {/* Read Full Article button */}
          {article.sourceUrl && (
            <Pressable
              style={[styles.readMoreButton, { backgroundColor: colors.primary }]}
              onPress={handleOpenSource}
            >
              <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
              <Text style={styles.readMoreText}>
                {t("news.readMore") || "Read Full Article"}
              </Text>
            </Pressable>
          )}

          {/* Location Map (unchanged) */}
          {article.location && (
            <View style={styles.mapSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📍 {t("map.incidentDetails")}
              </Text>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: article.location.latitude,
                    longitude: article.location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: article.location.latitude,
                      longitude: article.location.longitude,
                    }}
                    title={article.title}
                    description={article.locationName}
                  />
                </MapView>
              </View>
              <Text style={[styles.mapCaption, { color: colors.textDisabled }]}>
                {article.locationName || t("map.confidence.approximate")}
              </Text>
            </View>
          )}

          {/* Published Date */}
          <View style={[styles.publishedRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.publishedLabel, { color: colors.textDisabled }]}>
              {t("news.lastUpdated")}:
            </Text>
            <Text style={[styles.publishedDate, { color: colors.textSecondary }]}>
              {formatDate(article.publishedAt)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  headerButton: { padding: Spacing.sm },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.regular },
  heroImage: { width: "100%", height: 250 },
  heroPlaceholder: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { padding: Spacing.lg },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  category: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.mono,
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography.sizes.title,
    fontFamily: Typography.fonts.bold,
    lineHeight: Typography.sizes.title * 1.2,
    marginBottom: Spacing.md,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  infoText: { fontSize: Typography.sizes.caption, fontFamily: Typography.fonts.regular },
  divider: { height: 1, marginVertical: Spacing.lg },
  articleBody: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    lineHeight: Typography.sizes.body * 1.8,
    marginBottom: Spacing.lg,
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  readMoreText: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  sectionTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  mapSection: { marginBottom: Spacing.xl },
  mapContainer: { height: 180, borderRadius: BorderRadius.lg, overflow: "hidden" },
  map: { flex: 1 },
  mapCaption: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  publishedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  publishedLabel: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.regular },
  publishedDate: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.mono },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
});