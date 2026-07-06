// src/components/live/StreamCard.tsx
// Phase 2: Card displaying a live or upcoming stream

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';
import { LiveStream } from '@/services/live/liveService';
import CreatorBadge from './CreatorBadge';

interface StreamCardProps {
  stream: LiveStream;
  onPress: () => void;
}

export default function StreamCard({ stream, onPress }: StreamCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: stream.thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
        
        {/* Live badge */}
        {stream.isLive && (
          <View style={[styles.liveBadge, { backgroundColor: '#FF4757' }]}>
            <Ionicons name="radio" size={12} color="#FFFFFF" />
            <Text style={styles.liveBadgeText}>LIVE</Text>
            <Text style={styles.liveBadgeCount}>{stream.viewerCount}</Text>
          </View>
        )}

        {/* Duration / "Upcoming" overlay for non‑live */}
        {!stream.isLive && (
          <View style={[styles.upcomingOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <Ionicons name="time-outline" size={14} color="#FFFFFF" />
            <Text style={styles.upcomingText}>UPCOMING</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
          {stream.title}
        </Text>

        <View style={styles.channelRow}>
          <Image source={{ uri: stream.channelAvatar }} style={styles.avatar} />
          <Text style={[styles.channelName, { color: theme.colors.textSecondary }]}>
            {stream.channelName}
          </Text>
          <CreatorBadge verified={stream.verified} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 180,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveBadgeCount: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  upcomingOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  channelName: {
    fontSize: 14,
    flex: 1,
  },
});
