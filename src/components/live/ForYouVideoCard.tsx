// src/components/live/ForYouVideoCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, TouchableWithoutFeedback } from 'react-native';
import YouTubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts';
import { ForYouItem } from '@/services/forYouFeed';
import CommentsSheet from './CommentsSheet';

interface Props {
  item: ForYouItem;
  isActive: boolean;
  onDoubleTapLike: () => void;
}

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.78;

export default function ForYouVideoCard({ item, isActive, onDoubleTapLike }: Props) {
  const theme = useTheme();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);

  const lastTap = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, [isActive]);

  const handleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      // Double tap like
      setLiked(true);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
      onDoubleTapLike();
      lastTap.current = null;
    } else {
      // Single tap toggles play/pause
      setPlaying((prev) => !prev);
      lastTap.current = now;
      setTimeout(() => {
        lastTap.current = null;
      }, 300);
    }
  };

  const toggleMute = () => {
    setMuted((prev) => !prev);
  };

  return (
    <View style={[styles.container, { height: CARD_HEIGHT, backgroundColor: theme.colors.background }]}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.videoContainer}>
          <YouTubePlayer
            height={CARD_HEIGHT}
            width={width}
            videoId={item.videoId}
            play={playing}
            mute={muted}
            webViewStyle={{ opacity: 0.99 }}
            initialPlayerParams={{
              controls: false,
              modestbranding: true,
              rel: false,
            }}
          />

          {/* Top-right audio toggle */}
          <Pressable
            style={[styles.audioToggle, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={toggleMute}
          >
            <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={22} color="#FFFFFF" />
          </Pressable>

          {/* Double-tap heart */}
          {showHeart && (
            <View style={styles.heartOverlay}>
              <Ionicons name="heart" size={96} color="#FF4757" />
            </View>
          )}

          {/* Bottom overlay */}
          <View style={styles.bottomOverlay}>
            <View style={styles.bottomRow}>
              <Pressable style={styles.actionButton} onPress={() => setCommentsVisible(true)}>
                <Ionicons name="chatbubble-outline" size={26} color="#FFFFFF" />
                <Text style={styles.actionCount}>{item.comments.length}</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={handleTap}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#FF4757' : '#FFFFFF'} />
                <Text style={styles.actionCount}>{item.likes}</Text>
              </Pressable>
            </View>
            <Text style={styles.channelName}>{item.channelName}</Text>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.date}>{new Date(item.publishedAt).toLocaleDateString()}</Text>
            <Text style={styles.tags}>{item.tags.join(' ')}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <CommentsSheet
        visible={commentsVisible}
        comments={item.comments}
        onClose={() => setCommentsVisible(false)}
        title={item.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width },
  videoContainer: { flex: 1, position: 'relative' },
  audioToggle: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginBottom: 8,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
  },
  channelName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 4,
  },
  tags: {
    color: '#AAAAAA',
    fontSize: 12,
  },
});