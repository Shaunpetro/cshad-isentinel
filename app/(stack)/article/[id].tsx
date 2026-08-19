// app/(stack)/article/[id].tsx
// Beta 4 – Rich article rendering with paragraphs, images, videos, lists, and interstitials

import React, { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Share, ActivityIndicator,
  Linking, NativeSyntheticEvent, NativeScrollEvent, Image as RNImage,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import MapView, { Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";
import { Typography, Spacing, BorderRadius } from "../../../src/config/theme";
import { SeverityBadge, SourceBadge, VerifiedBadge } from "../../../src/components/news";
import { timeAgo, formatDate, extractBestImage, parseArticleHtml } from "../../../src/utils/formatters";
import { useNewsArticle } from "../../../src/hooks/useNews";
import { useTheme, usePremium } from "../../../src/contexts";
import { AdBanner } from "../../../src/ads/AdBanner";
import AudioAdModal from "../../../src/components/monetisation/AudioAdModal";
import { SubscriptionModal } from "../../../src/components/opportunities/SubscriptionModal";
import { useInterstitialAd } from "../../../src/ads/useInterstitialAd";

function YouTubeVideoBlock({ videoId, caption }: { videoId: string; caption?: string }) {
  const { colors } = useTheme();
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <View style={styles.videoBlock}>
      <Pressable
        onPress={() => WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${videoId}`)}
        style={[styles.videoThumbContainer, { backgroundColor: colors.surface }]}
      >
        <RNImage source={{ uri: thumbnail }} style={styles.videoThumb} resizeMode="cover" />
        <View style={styles.playOverlay}>
          <Ionicons name="play-circle" size={56} color="#FFFFFF" />
        </View>
      </Pressable>
      {caption ? (
        <Text selectable style={[styles.imageCaption, { color: colors.textSecondary }]}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

export default function NewsDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isSubscribed } = usePremium();

  const { article, isLoading, error } = useNewsArticle(id);
  const [audioModalVisible, setAudioModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);

  const { showIfReady } = useInterstitialAd();
  const midArticleShown = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const getCategoryLabel = (category: string): string => {
    const key = `news.categories.${category}`;
    const translated = t(key);
    return translated !== key ? translated.toUpperCase() : category.toUpperCase();
  };

  const handleShare = async () => {
    if (!article) return;
    const articleDeepLink = `cshad-isentinel://article/${article.id}`;
    const appStoreLink = "https://play.google.com/store/apps/details?id=cshad.isentinel.news";
    const message = `${article.title}\n\nRead the full article in the CSHAD iSentinel app:\n${articleDeepLink}\n\nDownload the app: ${appStoreLink}`;
    try {
      await Share.share({ title: article.title, message, url: articleDeepLink });
    } catch (err) {
      try {
        await Share.share({ title: article.title, message: appStoreLink });
      } catch (fallbackErr) {
        console.error("[NewsDetail] Share error:", fallbackErr);
      }
    }
  };

  const handleOpenSource = async () => {
    if (article?.sourceUrl) {
      await WebBrowser.openBrowserAsync(article.sourceUrl);
    }
  };

  const handleSubscribe = () => {
    setAudioModalVisible(false);
    setSubscriptionModalVisible(true);
  };

  const handleAudioPress = () => {
    if (!isSubscribed) showIfReady();
    setAudioModalVisible(true);
  };

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isSubscribed || midArticleShown.current) return;
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const scrolled = contentOffset.y + layoutMeasurement.height;
      const halfContent = contentSize.height * 0.5;
      if (scrolled >= halfContent) {
        midArticleShown.current = true;
        showIfReady();
      }
    },
    [isSubscribed, showIfReady]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "", headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t("common.loading")}</Text>
        </View>
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: t("common.error"), headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textDisabled} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>{error ? t("common.error") : t("common.noResults")}</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error || t("common.noResults")}</Text>
          <Pressable style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: "#FFFFFF" }]}>{t("common.back")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Determine content: prefer full raw HTML, then plain body, then summary
  const hasFullBody = Boolean(article.rawBody || article.body);
  const rawHtml = article.rawBody || article.body || article.summary;
  const blocks = parseArticleHtml(rawHtml, article.sourceUrl || '');
  const heroImage = extractBestImage(article.imageUrl, article.rawBody || article.body, article.summary);

  // Remove hero image from inline blocks to avoid duplication
  const filteredBlocks = heroImage
    ? blocks.filter((b) => !(b.type === 'image' && b.url === heroImage))
    : blocks;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={handleAudioPress} style={styles.headerButton}>
                <Ionicons name="volume-medium-outline" size={24} color={colors.text} />
              </Pressable>
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
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {heroImage ? (
          <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" transition={300} />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: colors.surface }]}>
            <Ionicons name="newspaper-outline" size={64} color={colors.textDisabled} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <Text style={[styles.category, { color: colors.primary }]}>{getCategoryLabel(article.category)}</Text>
            <SeverityBadge severity={article.severity} />
          </View>

          <Text selectable style={[styles.title, { color: colors.text }]}>{article.title}</Text>

          <View style={styles.sourceRow}>
            <SourceBadge sourceType={article.sourceType || 'media'} sourceName={article.source} size="medium" />
            <VerifiedBadge isVerified={article.isVerified} showLabel={true} size="medium" />
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{timeAgo(article.publishedAt)}</Text>
            </View>
            {article.locationName && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text selectable style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>{article.locationName}</Text>
              </View>
            )}
          </View>

          {/* Inline audio prompt */}
          <Pressable
            onPress={handleAudioPress}
            style={[styles.audioPromptCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
          >
            <View style={styles.audioPromptContent}>
              <Ionicons name="volume-medium" size={28} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.audioPromptTitle, { color: colors.primary }]}>
                  Listen to this article
                </Text>
                <Text style={[styles.audioPromptSubtitle, { color: colors.textSecondary }]}>
                  {isSubscribed ? 'Premium audio reader' : 'Audio reader with a short ad'}
                </Text>
              </View>
              <Ionicons name="play-circle" size={32} color={colors.primary} />
            </View>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* If no full body, show summary and source link */}
          {!hasFullBody && (
            <View style={[styles.summaryOnlyContainer, { borderColor: colors.border }]}>
              <Text style={[styles.summaryOnlyText, { color: colors.textSecondary }]}>
                This article is only available as a summary in the feed.
              </Text>
              {article.sourceUrl && (
                <Pressable
                  onPress={handleOpenSource}
                  style={[styles.sourceButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.sourceButtonText}>Read full article at source</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Render rich blocks */}
          {filteredBlocks.map((block, index) => {
            switch (block.type) {
              case 'heading':
                return (
                  <Text selectable key={`h-${index}`} style={[styles.heading, { color: colors.text }]}>
                    {block.text}
                  </Text>
                );
              case 'image':
                return (
                  <View key={`img-${index}`} style={styles.mediaBlock}>
                    <Image
                      source={{ uri: block.url }}
                      style={styles.inlineImage}
                      contentFit="cover"
                      transition={200}
                    />
                    {block.caption ? (
                      <Text selectable style={[styles.imageCaption, { color: colors.textSecondary }]}>
                        {block.caption}
                      </Text>
                    ) : null}
                  </View>
                );
              case 'list':
                return (
                  <View key={`list-${index}`} style={styles.listContainer}>
                    {block.items.map((item, i) => (
                      <View key={i} style={styles.listItem}>
                        <Text style={[styles.listBullet, { color: colors.primary }]}>
                          {block.ordered ? `${i + 1}.` : '•'}
                        </Text>
                        <Text selectable style={[styles.listText, { color: colors.text }]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              case 'video':
                return (
                  <YouTubeVideoBlock
                    key={`video-${index}`}
                    videoId={block.videoId}
                    caption={block.caption}
                  />
                );
              case 'quote':
                return (
                  <View key={`quote-${index}`} style={[styles.quoteContainer, { borderLeftColor: colors.primary }]}>
                    <Text selectable style={[styles.quoteText, { color: colors.text }]}>“{block.text}”</Text>
                    {block.source ? (
                      <Text style={[styles.quoteSource, { color: colors.textSecondary }]}>— {block.source}</Text>
                    ) : null}
                  </View>
                );
              default:
                return (
                  <Text selectable key={`p-${index}`} style={[styles.articleBody, { color: colors.text }]}>
                    {block.text}
                  </Text>
                );
            }
          })}

          {/* Banner ad after article body */}
          <View style={{ marginTop: Spacing.lg, marginBottom: Spacing.lg }}>
            <AdBanner />
          </View>

          {/* Location Map */}
          {article.location && (
            <View style={styles.mapSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 {t("map.incidentDetails")}</Text>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{ latitude: article.location.latitude, longitude: article.location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                  scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false}
                >
                  <Marker coordinate={{ latitude: article.location.latitude, longitude: article.location.longitude }} title={article.title} description={article.locationName} />
                </MapView>
              </View>
              <Text style={[styles.mapCaption, { color: colors.textDisabled }]}>{article.locationName || t("map.confidence.approximate")}</Text>
            </View>
          )}

          <View style={[styles.publishedRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.publishedLabel, { color: colors.textDisabled }]}>{t("news.lastUpdated")}:</Text>
            <Text style={[styles.publishedDate, { color: colors.textSecondary }]}>{formatDate(article.publishedAt)}</Text>
          </View>
        </View>
      </ScrollView>

      <AudioAdModal
        visible={audioModalVisible}
        articleBody={article.body || article.summary}
        onClose={() => setAudioModalVisible(false)}
        onSubscribe={handleSubscribe}
        isSubscribed={isSubscribed}
      />

      <SubscriptionModal
        visible={subscriptionModalVisible}
        onClose={() => setSubscriptionModalVisible(false)}
        onSelectPlan={(plan: any) => {
          setSubscriptionModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  headerButton: { padding: Spacing.sm },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: Spacing.md },
  loadingText: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.regular },
  heroImage: { width: "100%", height: 250 },
  heroPlaceholder: { width: "100%", height: 200, justifyContent: "center", alignItems: "center" },
  content: { padding: Spacing.lg },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  category: { fontSize: Typography.sizes.tiny, fontFamily: Typography.fonts.mono, letterSpacing: 1 },
  title: { fontSize: Typography.sizes.title, fontFamily: Typography.fonts.bold, lineHeight: Typography.sizes.title * 1.2, marginBottom: Spacing.md },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.md },
  infoRow: { flexDirection: "row", alignItems: "center", gap: Spacing.lg, marginBottom: Spacing.md },
  infoItem: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  infoText: { fontSize: Typography.sizes.caption, fontFamily: Typography.fonts.regular },
  audioPromptCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  audioPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  audioPromptTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
  },
  audioPromptSubtitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
  summaryOnlyContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryOnlyText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginBottom: Spacing.sm,
  },
  sourceButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  sourceButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
  },
  divider: { height: 1, marginVertical: Spacing.lg },
  articleBody: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.regular, lineHeight: Typography.sizes.body * 1.8, marginBottom: Spacing.md },
  heading: { fontSize: Typography.sizes.heading, fontFamily: Typography.fonts.bold, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  mediaBlock: { marginBottom: Spacing.md },
  inlineImage: { width: '100%', height: 200, borderRadius: BorderRadius.md },
  imageCaption: { fontSize: Typography.sizes.caption, fontFamily: Typography.fonts.regular, marginTop: Spacing.xs, textAlign: 'center' },
  listContainer: { marginBottom: Spacing.md },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.xs, gap: Spacing.sm },
  listBullet: { fontSize: Typography.sizes.body, fontFamily: 'DMSans-Bold', lineHeight: Typography.sizes.body * 1.8 },
  listText: { flex: 1, fontSize: Typography.sizes.body, fontFamily: Typography.fonts.regular, lineHeight: Typography.sizes.body * 1.8 },
  videoBlock: { marginBottom: Spacing.md },
  videoThumbContainer: { position: 'relative', borderRadius: BorderRadius.md, overflow: 'hidden' },
  videoThumb: { width: '100%', height: 200 },
  playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  quoteContainer: { marginBottom: Spacing.md, paddingLeft: Spacing.md, borderLeftWidth: 3 },
  quoteText: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.regular, fontStyle: 'italic', lineHeight: Typography.sizes.body * 1.6 },
  quoteSource: { fontSize: Typography.sizes.caption, fontFamily: Typography.fonts.regular, marginTop: Spacing.xs },
  mapSection: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.bold, marginBottom: Spacing.sm },
  mapContainer: { height: 180, borderRadius: BorderRadius.lg, overflow: "hidden" },
  map: { flex: 1 },
  mapCaption: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.regular, marginTop: Spacing.xs, textAlign: "center" },
  publishedRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingTop: Spacing.md, borderTopWidth: 1 },
  publishedLabel: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.regular },
  publishedDate: { fontSize: Typography.sizes.label, fontFamily: Typography.fonts.mono },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  errorTitle: { fontSize: Typography.sizes.heading, fontFamily: Typography.fonts.bold, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  errorText: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.regular, textAlign: "center", marginBottom: Spacing.xl },
  backButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md },
  backButtonText: { fontSize: Typography.sizes.body, fontFamily: Typography.fonts.bold },
});