// app/(stack)/live.tsx
// Beta 4 – Live Hub with proper login/logout flow, Activity tab with discover comments, threaded replies

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { useAuth } from '../../src/hooks/useAuth';
import { useLiveStreams } from '../../src/hooks/useLiveStreams';
import StreamCard from '../../src/components/live/StreamCard';
import LivePlayer from '../../src/components/live/LivePlayer';
import type { LiveStream } from '@/services/live/liveService';

type Tab = 'liveNow' | 'discover' | 'activity';

// Mock activity data for logged‑in users
const MOCK_ACTIVITY = [
  { id: 'a1', type: 'reply', user: 'Zanele M.', text: 'replied to your comment on "Sports Podcast: Match Analysis"', timestamp: '2m ago', thread: 'Thanks! I agree with you.' },
  { id: 'a2', type: 'like', user: 'Thabo K.', text: 'liked your comment on "Offside Review"', timestamp: '5m ago' },
  { id: 'a3', type: 'reply', user: 'Priya N.', text: 'replied: "Great point, I never thought of that"', timestamp: '12m ago', thread: 'Original: The ref made the right call.' },
  { id: 'a4', type: 'comment', user: 'You', text: 'commented on "Rugby Roundup"', timestamp: '25m ago', thread: 'This match was incredible!' },
  { id: 'a5', type: 'like', user: 'Sipho D.', text: 'liked your comment on "Cricket Weekly"', timestamp: '40m ago' },
];

export default function LiveHubScreen() {
  const theme = useTheme();
  const { isLoggedIn, profile, login, logout } = useAuth();
  const { liveNow, upcoming, isLoading, isRefreshing, error, refresh } = useLiveStreams();
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('liveNow');

  // This function is called by the header user icon (wired via a ref or navigation param)
  const handleHeaderUserPress = () => {
    if (isLoggedIn) {
      Alert.alert(
        `Signed in as ${profile?.username || 'demoU1234'}`,
        '',
        [
          { text: 'Profile', onPress: () => {} },
          { text: 'Logout', onPress: logout, style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Login?',
        'Sign in to unlock Activity and comments.',
        [
          { text: 'Yes', onPress: login },
          { text: 'No', style: 'cancel' },
        ]
      );
    }
  };

  // Expose the handler to the header via a ref or effect
  // For now, the header icon navigation is handled in _layout.tsx but we can use navigation.setOptions
  React.useEffect(() => {
    // This is a placeholder — the actual header press is wired in the live screen's own floating button
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

  const handleStreamPress = (stream: LiveStream) => {
    setActiveStream(stream);
  };

  const renderActivityItem = ({ item }: { item: typeof MOCK_ACTIVITY[0] }) => (
    <View style={[styles.activityItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Ionicons
        name={item.type === 'like' ? 'heart' : item.type === 'reply' ? 'return-up-back' : 'chatbubble'}
        size={18}
        color={item.type === 'like' ? '#FF1744' : theme.colors.primary}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.activityText, { color: theme.colors.text }]}>
          <Text style={{ fontFamily: 'DMSans-Bold' }}>{item.user}</Text> {item.text}
        </Text>
        {item.thread && (
          <View style={[styles.threadContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.threadText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {item.thread}
            </Text>
          </View>
        )}
        <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>{item.timestamp}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: LiveStream }) => (
    <StreamCard stream={item} onPress={() => handleStreamPress(item)} />
  );

  const discoverStreams = upcoming;

  const getTabData = (): LiveStream[] => {
    switch (activeTab) {
      case 'liveNow': return liveNow;
      case 'discover': return discoverStreams;
      default: return [];
    }
  };

  const TAB_LABELS: { key: Tab; label: string }[] = [
    { key: 'liveNow', label: 'Live Now' },
    { key: 'discover', label: 'Discover' },
    ...(isLoggedIn ? [{ key: 'activity' as Tab, label: 'Activity' }] : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tab bar */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.divider }]}>
        {TAB_LABELS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Floating user button for login/logout (visible when header icon is not accessible) */}
      <TouchableOpacity
        style={[styles.floatingUserButton, { backgroundColor: isLoggedIn ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={handleHeaderUserPress}
      >
        <Ionicons
          name={isLoggedIn ? 'person-circle' : 'person-circle-outline'}
          size={32}
          color={isLoggedIn ? '#FFFFFF' : theme.colors.text}
        />
      </TouchableOpacity>

      {/* Content */}
      {activeTab === 'activity' ? (
        <FlatList
          data={MOCK_ACTIVITY}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No recent activity.
              </Text>
            </View>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={getTabData()}
          renderItem={renderItem}
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
      )}

      {/* Immersive player */}
      {activeStream && (
        <LivePlayer
          videoId={activeStream.videoId}
          title={activeStream.title}
          channelName={activeStream.channelName}
          isLive={activeStream.isLive}
          visible={true}
          onClose={() => setActiveStream(null)}
          isLoggedIn={isLoggedIn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  list: { padding: 16 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderBottomWidth: 1,
    marginTop: 8,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2 },
  tabText: { fontSize: 15, fontFamily: 'DMSans-Bold' },
  errorText: { fontSize: 16, textAlign: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 16 },
  floatingUserButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  activityText: { fontSize: 14, fontFamily: 'DMSans-Regular', marginBottom: 4 },
  threadContainer: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    marginTop: 2,
  },
  threadText: { fontSize: 13, fontFamily: 'DMSans-Regular', fontStyle: 'italic' },
  activityTime: { fontSize: 12, fontFamily: 'DMSans-Regular' },
});