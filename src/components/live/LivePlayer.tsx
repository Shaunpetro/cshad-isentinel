// src/components/live/LivePlayer.tsx
// Beta 4 – TikTok‑style immersive player with theme‑aware background, 10 live comments, timestamps

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  FlatList,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_COMMENTS = [
  { id: '1', user: 'Zanele M.', text: 'Stay safe everyone!', secondsAgo: 2 },
  { id: '2', user: 'Thabo K.', text: 'This is so helpful, thank you', secondsAgo: 5 },
  { id: '3', user: 'Priya N.', text: 'What area is this?', secondsAgo: 12 },
  { id: '4', user: 'Mohammed S.', text: 'Great reporting!', secondsAgo: 18 },
  { id: '5', user: 'Linda Z.', text: 'Keep up the good work', secondsAgo: 25 },
  { id: '6', user: 'Sipho D.', text: 'I can see the crew in the background', secondsAgo: 32 },
  { id: '7', user: 'Amahle N.', text: 'This is live from Soweto?', secondsAgo: 40 },
  { id: '8', user: 'Kabelo T.', text: 'Love the energy', secondsAgo: 47 },
  { id: '9', user: 'Nosipho M.', text: 'Can you wave at us?', secondsAgo: 55 },
  { id: '10', user: 'Thandiwe P.', text: 'More angles please', secondsAgo: 62 },
];

interface LivePlayerProps {
  videoId: string;
  title: string;
  channelName: string;
  isLive: boolean;
  visible: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

export default function LivePlayer({
  videoId,
  title,
  channelName,
  isLive,
  visible,
  onClose,
  isLoggedIn,
}: LivePlayerProps) {
  const theme = useTheme();
  const [embedError, setEmbedError] = useState(false);
  const [viewerCount] = useState(Math.floor(Math.random() * 500) + 50);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [liked, setLiked] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      const newComment = {
        id: `c${Date.now()}`,
        user: ['User123', 'Anonymous', 'LiveViewer'][Math.floor(Math.random() * 3)],
        text: ['Nice!', 'Keep going', 'Wow', 'Amazing'][Math.floor(Math.random() * 4)],
        secondsAgo: 1,
      };
      setComments((prev) => [newComment, ...prev.slice(0, 9)]);
    }, 10000);
    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const tick = setInterval(() => {
      setComments((prev) =>
        prev.map((c) => ({ ...c, secondsAgo: c.secondsAgo + 1 }))
      );
    }, 1000);
    return () => clearInterval(tick);
  }, [visible]);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&modestbranding=1&rel=0&showinfo=0&controls=0&loop=1&origin=https://cshad.isentinel.news`;

  const handleWebViewError = useCallback(() => setEmbedError(true), []);

  const handleOpenInYouTube = useCallback(() => {
    Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
  }, [videoId]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m ago`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      supportedOrientations={['portrait']}
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={[styles.fullScreen, { backgroundColor: theme.colors.background }]}>
        {/* Video layer */}
        {!embedError ? (
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webView}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            onError={handleWebViewError}
            allowsFullscreenVideo
          />
        ) : (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="videocam-off-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
              Stream Unavailable
            </Text>
            <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
              This video cannot be played inside the app.{'\n'}You can watch it on YouTube.
            </Text>
            <TouchableOpacity
              style={[styles.openYouTubeButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleOpenInYouTube}
            >
              <Ionicons name="logo-youtube" size={20} color="#FFFFFF" />
              <Text style={styles.openYouTubeText}>Open in YouTube</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Glass top bar */}
        <BlurView intensity={80} tint={theme.isDark ? 'dark' : 'light'} style={styles.glassHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.channelNameText, { color: theme.colors.text }]} numberOfLines={1}>{channelName}</Text>
            <Text style={[styles.titleText, { color: theme.colors.textSecondary }]} numberOfLines={1}>{title}</Text>
          </View>
          {isLive && (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.livePillText}>LIVE</Text>
              <Text style={styles.viewerCount}>{viewerCount}</Text>
            </View>
          )}
        </BlurView>

        {/* Comments overlay */}
        <View style={styles.commentsContainer}>
          <FlatList
            ref={flatListRef}
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.commentBubble, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.85)' }]}>
                <View style={styles.commentHeader}>
                  <Text style={[styles.commentUser, { color: theme.isDark ? '#CCCCCC' : '#333333' }]}>{item.user}</Text>
                  <Text style={[styles.commentTime, { color: theme.isDark ? '#888888' : '#666666' }]}>{formatTime(item.secondsAgo)}</Text>
                </View>
                <Text style={[styles.commentText, { color: theme.isDark ? '#FFFFFF' : '#1A1A1A' }]}>{item.text}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.commentsList}
            inverted={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Comment input bar */}
          <BlurView intensity={60} tint={theme.isDark ? 'dark' : 'light'} style={styles.commentInputBar}>
            {isLoggedIn ? (
              <>
                <Ionicons name="happy-outline" size={20} color={theme.colors.text} />
                <Text style={[styles.commentPlaceholder, { color: theme.colors.textSecondary }]}>Add a comment…</Text>
                <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.heartButton}>
                  <Ionicons
                    name={liked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={liked ? '#FF1744' : theme.colors.text}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="lock-closed" size={18} color={theme.colors.textSecondary} />
                <Text style={[styles.loginToCommentText, { color: theme.colors.textSecondary }]}>Login to comment</Text>
                <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.heartButton}>
                  <Ionicons
                    name={liked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={liked ? '#FF1744' : theme.colors.text}
                  />
                </TouchableOpacity>
              </>
            )}
          </BlurView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  webView: { flex: 1 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: { fontSize: 20, fontFamily: 'DMSans-Bold', marginTop: 16, marginBottom: 8 },
  errorMessage: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  openYouTubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  openYouTubeText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'DMSans-Bold' },
  glassHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  closeBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  channelNameText: { fontSize: 16, fontFamily: 'DMSans-Bold' },
  titleText: { fontSize: 13, fontFamily: 'DMSans-Regular' },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF1744',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  livePillText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'DMSans-Bold' },
  viewerCount: { color: '#FFFFFF', fontSize: 11, fontFamily: 'DMSans-Regular', marginLeft: 4 },
  commentsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 20,
    maxHeight: '45%',
  },
  commentsList: { paddingBottom: 8 },
  commentBubble: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
    maxWidth: SCREEN_WIDTH * 0.75,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    gap: 8,
  },
  commentUser: { fontSize: 12, fontFamily: 'DMSans-Bold' },
  commentTime: { fontSize: 10, fontFamily: 'DMSans-Regular' },
  commentText: { fontSize: 13, fontFamily: 'DMSans-Regular' },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  commentPlaceholder: { flex: 1, fontSize: 14, fontFamily: 'DMSans-Regular' },
  loginToCommentText: { flex: 1, fontSize: 14, fontFamily: 'DMSans-Regular', fontStyle: 'italic' },
  heartButton: { padding: 4 },
});