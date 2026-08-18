// src/components/live/ForYouCard.tsx
// Full-screen vertical card for Discover "For You" feed

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { LiveStream } from '@/services/live/liveService';
import CreatorBadge from './CreatorBadge';

interface ForYouCardProps {
  stream: LiveStream;
  onPress: () => void;
}

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.75; // 75% of screen height

export default function ForYouCard({ stream, onPress }: ForYouCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, { height: CARD_HEIGHT }]}
    >
      {/* Background image */}
      <Image
        source={{ uri: stream.thumbnailUrl }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      {/* Dark overlay */}
      <View style={styles.overlay} />

      {/* Top badges */}
      <View style={styles.topRow}>
        {stream.isLive ? (
          <View style={styles.liveBadge}>
            <Ionicons name="radio" size={12} color="#FFFFFF" />
            <Text style={styles.badgeText}>LIVE</Text>
            <Text style={styles.viewerCount}>{stream.viewerCount}</Text>
          </View>
        ) : (
          <View style={styles.upcomingBadge}>
            <Ionicons name="time-outline" size={12} color="#FFFFFF" />
            <Text style={styles.badgeText}>UPCOMING</Text>
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{stream.category.toUpperCase()}</Text>
        </View>
      </View>

      {/* Bottom info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {stream.title}
        </Text>

        <View style={styles.channelRow}>
          <Image source={{ uri: stream.channelAvatar }} style={styles.avatar} />
          <Text style={styles.channelName} numberOfLines={1}>
            {stream.channelName}
          </Text>
          <CreatorBadge verified={stream.verified} />
        </View>

        {/* Play button hint */}
        <View style={styles.playHint}>
          <Ionicons name="play-circle" size={48} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF4757',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFA726',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewerCount: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  bottomInfo: {
    padding: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  channelName: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  playHint: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});