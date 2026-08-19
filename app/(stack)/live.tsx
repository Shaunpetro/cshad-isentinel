// app/(stack)/live.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Dimensions, Image,
} from 'react-native';
import { useTheme, usePremium } from '@/contexts';
import { useLiveStreams } from '../../src/hooks/useLiveStreams';
import StreamCard from '../../src/components/live/StreamCard';
import ForYouVideoCard from '../../src/components/live/ForYouVideoCard';
import ForYouAudioCard from '../../src/components/live/ForYouAudioCard';
import LivePlayer from '../../src/components/live/LivePlayer';
import { AdBanner } from '@/ads/AdBanner';
import { useInterstitialAd } from '@/ads/useInterstitialAd';
import { MOCK_FOR_YOU_FEED, ForYouItem } from '@/services/forYouFeed';
import type { LiveStream } from '@/services/live/liveService';

type Tab = 'liveNow' | 'discover';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISCOVER_ITEM_HEIGHT = SCREEN_HEIGHT * 0.78;

export default function LiveHubScreen() {
  const theme = useTheme();
  const { isSubscribed } = usePremium();
  const { liveNow, upcoming, isLoading, isRefreshing, error, refresh } = useLiveStreams();
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('liveNow');
  const { showIfReady } = useInterstitialAd();
  const [forYouItems, setForYouItems] = useState<ForYouItem[]>(MOCK_FOR_YOU_FEED);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleOpenStream = useCallback(
    (stream: LiveStream) => {
      if (!isSubscribed) showIfReady();
      setActiveStream(stream);
    },
    [isSubscribed, showIfReady]
  );

  const handleDoubleTapLike = useCallback((itemId: string) => {
    setForYouItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, likes: item.likes + 1 } : item
      )
    );
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
      </View>
    );
  }

  const upcomingForHeader = upcoming;
  const forYouData = forYouItems;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'liveNow' && styles.activeTab]}
          onPress={() => setActiveTab('liveNow')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'liveNow' ? theme.colors.primary : theme.colors.textSecondary }]}>
            Live Now
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'discover' ? theme.colors.primary : theme.colors.textSecondary }]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'liveNow' && (
        <FlatList
          data={liveNow.length > 0 ? liveNow : upcoming}
          renderItem={({ item }) => (
            <StreamCard stream={item} onPress={() => handleOpenStream(item)} />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No live or upcoming streams right now.
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={{ marginTop: 16 }}>
              <AdBanner />
            </View>
          }
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[theme.colors.primary]} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === 'discover' && (
        <FlatList
          data={forYouData}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) =>
            item.type === 'video' ? (
              <ForYouVideoCard
                item={item}
                isActive={index === activeIndex}
                onDoubleTapLike={() => handleDoubleTapLike(item.id)}
              />
            ) : (
              <ForYouAudioCard
                item={item}
                isActive={index === activeIndex}
                onDoubleTapLike={() => handleDoubleTapLike(item.id)}
              />
            )
          }
          snapToInterval={DISCOVER_ITEM_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            upcomingForHeader.length > 0 ? (
              <View style={{ paddingBottom: 16 }}>
                <View style={styles.upcomingSection}>
                  <Text style={[styles.upcomingTitle, { color: theme.colors.text }]}>Upcoming</Text>
                  <FlatList
                    data={upcomingForHeader}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.upcomingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                        onPress={() => handleOpenStream(item)}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: item.thumbnailUrl }} style={styles.upcomingThumb} resizeMode="cover" />
                        <Text style={[styles.upcomingCardTitle, { color: theme.colors.text }]} numberOfLines={2}>
                          {item.title}
                        </Text>
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                  />
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No For You content yet.</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[theme.colors.primary]} />}
          onViewableItemsChanged={({ viewableItems }) => {
            if (viewableItems.length > 0) {
              setActiveIndex(viewableItems[0].index ?? 0);
            }
          }}
          viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        />
      )}

      {activeStream && (
        <LivePlayer
          videoId={activeStream.videoId}
          title={activeStream.title}
          channelName={activeStream.channelName}
          isLive={activeStream.isLive}
          visible={true}
          onClose={() => setActiveStream(null)}
          isLoggedIn={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  list: { padding: 16 },
  tabBar: { flexDirection: 'row', marginHorizontal: 16, borderBottomWidth: 1, marginTop: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2 },
  tabText: { fontSize: 15, fontFamily: 'DMSans-Bold' },
  errorText: { fontSize: 16, textAlign: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 16 },
  upcomingSection: { marginTop: 16 },
  upcomingTitle: { fontSize: 20, fontFamily: 'DMSans-Bold', marginLeft: 16, marginBottom: 12 },
  upcomingCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  upcomingThumb: { width: '100%', height: 90 },
  upcomingCardTitle: { padding: 8, fontSize: 14, fontFamily: 'DMSans-Medium' },
});