// app/(stack)/live.tsx
// Beta 4 – Live Hub with mock auth toggle, activity tab, immersive player

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

export default function LiveHubScreen() {
  const theme = useTheme();
  const { isLoggedIn, profile, activity, login, logout } = useAuth();
  const { liveNow, upcoming, isLoading, isRefreshing, error, refresh } = useLiveStreams();
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('liveNow');

  const handleUserIconPress = () => {
    if (isLoggedIn) {
      Alert.alert(
        profile?.username || 'User',
        'You are logged in.',
        [
          { text: 'Logout', onPress: logout, style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Login',
        'Sign in to unlock Activity and comments.',
        [
          { text: 'Yes', onPress: login },
          { text: 'No', style: 'cancel' },
        ]
      );
    }
  };

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

  const renderActivityItem = ({ item }: { item: typeof activity[0] }) => (
    <View style={[styles.activityItem, { borderBottomColor: theme.colors.divider }]}>
      <Ionicons
        name={item.type === 'like' ? 'heart' : 'chatbubble'}
        size={16}
        color={theme.colors.primary}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.activityText, { color: theme.colors.text }]}>
          <Text style={{ fontFamily: 'DMSans-Bold' }}>{item.user}</Text> {item.text}
        </Text>
      </View>
      <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>{item.timestamp}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: LiveStream }) => (
    <StreamCard
      stream={item}
      onPress={() => handleStreamPress(item)}
    />
  );

  const discoverStreams = upcoming;

  const getTabData = (): LiveStream[] => {
    switch (activeTab) {
      case 'liveNow':
        return liveNow;
      case 'discover':
        return discoverStreams;
      default:
        return [];
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
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'activity' ? (
        <FlatList
          data={activity}
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
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[theme.colors.primary]}
            />
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
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
  },
  errorText: { fontSize: 16, textAlign: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 16 },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activityText: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    marginLeft: 8,
  },
});