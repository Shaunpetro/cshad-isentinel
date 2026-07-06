// app/(stack)/live.tsx
// Phase 2: Live Hub screen with live streams, mini-player, and upcoming content

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts';
import { useLiveStreams } from '../../src/hooks/useLiveStreams';
import StreamCard from '../../src/components/live/StreamCard';
import LivePlayer from '../../src/components/live/LivePlayer';
import type { LiveStream } from '@/services/live/liveService';

export default function LiveHubScreen() {
  const theme = useTheme();
  const { liveNow, upcoming, isLoading, isRefreshing, error, refresh } = useLiveStreams();
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);

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

  const renderItem = ({ item }: { item: LiveStream }) => (
    <StreamCard
      stream={item}
      onPress={() => setActiveStream(item)}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Active mini-player */}
      {activeStream && (
        <LivePlayer
          videoId={activeStream.videoId}
          title={activeStream.title}
          channelName={activeStream.channelName}
          isLive={activeStream.isLive}
        />
      )}

      {/* Live Now section */}
      {liveNow.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            🔴 Live Now
          </Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View>
      {upcoming.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            ⏯️ Upcoming & Recent
          </Text>
        </View>
      )}
    </View>
  );

  const allStreams = [...liveNow, ...upcoming];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={allStreams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No streams available at the moment.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  list: { padding: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  errorText: { fontSize: 16, textAlign: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
