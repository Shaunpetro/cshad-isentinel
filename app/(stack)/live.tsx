// app/(stack)/live.tsx
// Beta 4 – Live Hub: real video mock, no login

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts';
import { useLiveStreams } from '../../src/hooks/useLiveStreams';
import StreamCard from '../../src/components/live/StreamCard';
import LivePlayer from '../../src/components/live/LivePlayer';
import type { LiveStream } from '@/services/live/liveService';

type Tab = 'liveNow' | 'discover';

export default function LiveHubScreen() {
  const theme = useTheme();
  const { liveNow, upcoming, isLoading, isRefreshing, error, refresh } = useLiveStreams();
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('liveNow');

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

  const tabData: LiveStream[] = activeTab === 'liveNow' ? liveNow : upcoming;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tab bar */}
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

      <FlatList
        data={tabData}
        renderItem={({ item }) => (
          <StreamCard stream={item} onPress={() => setActiveStream(item)} />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No streams available.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[theme.colors.primary]} />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Immersive player */}
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
});