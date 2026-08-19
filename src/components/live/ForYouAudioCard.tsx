// src/components/live/ForYouAudioCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated, TouchableWithoutFeedback } from 'react-native';
import { Audio } from 'expo-av';
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

export default function ForYouAudioCard({ item, isActive, onDoubleTapLike }: Props) {
  const theme = useTheme();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const lastTap = useRef<number | null>(null);

  useEffect(() => {
    if (playing) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [playing, pulseAnim]);

  const playAudio = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: item.mediaUrl! });
      setSound(sound);
      await sound.playAsync();
      setPlaying(true);
    } catch (err) {
      console.warn('[ForYouAudioCard] play error', err);
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (playing) {
      await pauseAudio();
    } else if (sound) {
      await sound.playAsync();
      setPlaying(true);
    } else {
      await playAudio();
    }
  };

  useEffect(() => {
    if (isActive && !playing) {
      playAudio();
    } else if (!isActive && playing) {
      pauseAudio();
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const handleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      setLiked(true);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
      onDoubleTapLike();
      lastTap.current = null;
    } else {
      togglePlayPause();
      lastTap.current = now;
      setTimeout(() => { lastTap.current = null; }, 300);
    }
  };

  return (
    <View style={[styles.container, { height: CARD_HEIGHT, backgroundColor: theme.colors.background }]}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.audioContainer}>
          <View style={[styles.placeholder, { backgroundColor: theme.colors.surface }]}>
            <Animated.View style={[styles.ripple, { transform: [{ scale: pulseAnim }], borderColor: theme.colors.primary }]}>
              <Ionicons name="mic" size={48} color={theme.colors.primary} />
            </Animated.View>
            <Text style={[styles.audioHint, { color: theme.colors.textSecondary }]}>
              {playing ? 'Playing…' : 'Tap to play'}
            </Text>
          </View>

          {showHeart && (
            <View style={styles.heartOverlay}>
              <Ionicons name="heart" size={96} color="#FF4757" />
            </View>
          )}

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
  audioContainer: { flex: 1, position: 'relative' },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioHint: {
    fontSize: 14,
    marginTop: 16,
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