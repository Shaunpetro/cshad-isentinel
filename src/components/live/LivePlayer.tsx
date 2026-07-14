// src/components/live/LivePlayer.tsx
// Beta 4 – Live & Discover player: swipe, threaded comments, branded icons, no duplicate styles

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
  PanResponder,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------- mock data ----------
const LIVE_COMMENTS = [
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

const DISCOVER_COMMENTS = [
  {
    id: 'd1', user: 'Sipho M.', text: 'This analysis is spot on!', secondsAgo: 120,
    replies: [
      { id: 'dr1', user: 'You', text: 'Thanks Sipho! Glad you liked it.', secondsAgo: 90 },
      { id: 'dr2', user: 'Zanele K.', text: 'I totally agree with both of you.', secondsAgo: 60 },
    ],
    repostCount: 5, likeCount: 23, replyCount: 2,
  },
  {
    id: 'd2', user: 'Thabo J.', text: 'Can you cover the upcoming elections next?', secondsAgo: 300,
    replies: [
      { id: 'dr3', user: 'Sports Talk ZA', text: 'Great idea! We\'ll put it on the list.', secondsAgo: 240 },
    ],
    repostCount: 3, likeCount: 15, replyCount: 1,
  },
  {
    id: 'd3', user: 'Linda N.', text: 'The ref definitely made a mistake there.', secondsAgo: 600,
    replies: [],
    repostCount: 0, likeCount: 8, replyCount: 0,
  },
  {
    id: 'd4', user: 'Priya M.', text: 'Best podcast I\'ve heard all week.', secondsAgo: 900,
    replies: [
      { id: 'dr4', user: 'You', text: 'Thank you! We work hard to bring these insights.', secondsAgo: 800 },
    ],
    repostCount: 7, likeCount: 34, replyCount: 1,
  },
  {
    id: 'd5', user: 'Mohammed S.', text: 'Please do more rugby coverage!', secondsAgo: 1200,
    replies: [],
    repostCount: 1, likeCount: 12, replyCount: 0,
  },
];

// ---------- types ----------
interface LivePlayerProps {
  videoId: string;
  title: string;
  channelName: string;
  isLive: boolean;
  visible: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m ago`;
}

// ---------- component ----------
export default function LivePlayer({
  videoId,
  title,
  channelName,
  isLive,
  visible,
  onClose,
  isLoggedIn,
  onSwipeUp,
  onSwipeDown,
  hasPrev = false,
  hasNext = false,
}: LivePlayerProps) {
  const theme = useTheme();
  const [embedError, setEmbedError] = useState(false);
  const [viewerCount] = useState(Math.floor(Math.random() * 500) + 50);
  const [liveComments, setLiveComments] = useState(LIVE_COMMENTS);
  const [likeCount, setLikeCount] = useState(142);
  const [liked, setLiked] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // discover engagement state (mocked)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [repostedComments, setRepostedComments] = useState<Set<string>>(new Set());
  const [discoverComments, setDiscoverComments] = useState(DISCOVER_COMMENTS);

  // ---------- live simulation ----------
  useEffect(() => {
    if (!visible || !isLive) return;
    const interval = setInterval(() => {
      setLiveComments((prev) => [{
        id: `c${Date.now()}`,
        user: ['User123', 'Anonymous', 'LiveViewer'][Math.floor(Math.random() * 3)],
        text: ['Nice!', 'Keep going', 'Wow', 'Amazing'][Math.floor(Math.random() * 4)],
        secondsAgo: 1,
      }, ...prev.slice(0, 9)]);
      setLikeCount((p) => p + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, [visible, isLive]);

  useEffect(() => {
    if (!visible || !isLive) return;
    const tick = setInterval(() => {
      setLiveComments((prev) => prev.map((c) => ({ ...c, secondsAgo: c.secondsAgo + 1 })));
    }, 1000);
    return () => clearInterval(tick);
  }, [visible, isLive]);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&modestbranding=1&rel=0&showinfo=0&controls=0&loop=1&origin=https://cshad.isentinel.news`;

  // ---------- live actions ----------
  const handleReply = (username: string) => {
    if (!isLoggedIn) return;
    setReplyTo(username);
  };

  const handleSubmitReply = () => {
    if (!replyTo) return;
    setLiveComments((prev) => [{
      id: `r${Date.now()}`,
      user: 'You',
      text: `@${replyTo} Thanks!`,
      secondsAgo: 1,
    }, ...prev.slice(0, 9)]);
    setReplyTo(null);
  };

  const handleToggleLike = () => {
    if (!isLoggedIn) return;
    setLiked(!liked);
    setLikeCount((p) => liked ? p - 1 : p + 1);
  };

  // ---------- discover actions ----------
  const toggleLikeComment = (id: string) => {
    if (!isLoggedIn) return;
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setDiscoverComments((prev) => prev.map((c) => c.id === id
      ? { ...c, likeCount: c.likeCount + (likedComments.has(id) ? -1 : 1) }
      : c
    ));
  };

  const toggleRepost = (id: string) => {
    if (!isLoggedIn) return;
    setRepostedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setDiscoverComments((prev) => prev.map((c) => c.id === id
      ? { ...c, repostCount: c.repostCount + (repostedComments.has(id) ? -1 : 1) }
      : c
    ));
  };

  // ---------- swipe detect (discover) ----------
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 30,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -50) {
          if (hasNext && onSwipeUp) onSwipeUp();
          else if (!hasNext) {
            Alert.alert('End of list', 'No more videos. Refresh?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Refresh', onPress: () => {} },
            ]);
          }
        } else if (gesture.dy > 50) {
          if (hasPrev && onSwipeDown) onSwipeDown();
        }
      },
    })
  ).current;

  // ---------- render helpers ----------
  const renderLiveComment = ({ item }: any) => (
    <View style={[styles.commentBubble, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.85)' }]}>
      <View style={styles.commentHeader}>
        <Text style={[styles.commentUser, { color: theme.isDark ? '#CCCCCC' : '#333333' }]}>{item.user}</Text>
        <Text style={[styles.commentTime, { color: theme.isDark ? '#888888' : '#666666' }]}>{formatTime(item.secondsAgo)}</Text>
      </View>
      <Text style={[styles.commentText, { color: theme.isDark ? '#FFFFFF' : '#1A1A1A' }]}>{item.text}</Text>
      <TouchableOpacity onPress={() => handleReply(item.user)} style={styles.liveReplyButton}>
        <Text style={styles.liveReplyText}>Reply</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDiscoverComment = ({ item }: any) => {
    const liked = likedComments.has(item.id);
    const reposted = repostedComments.has(item.id);
    const iconColor = isLoggedIn ? (liked ? theme.pastel.rose : theme.colors.primary) : theme.colors.textSecondary;
    const repostColor = isLoggedIn ? (reposted ? theme.pastel.mint : theme.colors.primary) : theme.colors.textSecondary;
    const replyColor = isLoggedIn ? theme.colors.primary : theme.colors.textSecondary;

    return (
      <View style={[styles.discoverCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.discoverUserRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '30' }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{item.user.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.commentUser, { color: theme.colors.text }]}>{item.user}</Text>
            <Text style={[styles.commentTime, { color: theme.colors.textSecondary }]}>{formatTime(item.secondsAgo)}</Text>
          </View>
        </View>
        <Text style={[styles.commentText, { color: theme.colors.text }]}>{item.text}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={18} color={replyColor} />
            <Text style={[styles.actionCount, { color: replyColor }]}>{item.replyCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleRepost(item.id)}>
            <Ionicons name={reposted ? 'repeat' : 'repeat-outline'} size={18} color={repostColor} />
            <Text style={[styles.actionCount, { color: repostColor }]}>{item.repostCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLikeComment(item.id)}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={iconColor} />
            <Text style={[styles.actionCount, { color: iconColor }]}>{item.likeCount}</Text>
          </TouchableOpacity>
        </View>

        {item.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {item.replies.map((reply: any) => (
              <View key={reply.id} style={[styles.replyBubble, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <Text style={[styles.replyUser, { color: theme.colors.primary }]}>{reply.user}</Text>
                <Text style={[styles.discoverReplyText, { color: theme.colors.text }]}>{reply.text}</Text>
                <Text style={[styles.commentTime, { color: theme.colors.textSecondary }]}>{formatTime(reply.secondsAgo)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // ---------- main return ----------
  return (
    <Modal visible={visible} animationType="slide" supportedOrientations={['portrait']} onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={[styles.fullScreen, { backgroundColor: theme.colors.background }]}>
        {!embedError ? (
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webView}
            javaScriptEnabled domStorageEnabled
            allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false}
            onError={() => setEmbedError(true)}
            allowsFullscreenVideo
          />
        ) : (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="videocam-off-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Stream Unavailable</Text>
            <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
              This video cannot be played inside the app.{'\n'}You can watch it on YouTube.
            </Text>
            <TouchableOpacity style={[styles.openYouTubeButton, { backgroundColor: theme.colors.primary }]} onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`)}>
              <Ionicons name="logo-youtube" size={20} color="#FFFFFF" />
              <Text style={styles.openYouTubeText}>Open in YouTube</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* glass header */}
        <BlurView intensity={80} tint={theme.isDark ? 'dark' : 'light'} style={styles.glassHeader}>
          <TouchableOpacity onPress={onClose} style={styles.leaveButton}>
            <Text style={styles.leaveText}>{isLive ? 'Leave' : 'Done'}</Text>
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

        {/* content area */}
        {isLive ? (
          <View style={styles.commentsContainer} {...panResponder.panHandlers}>
            <FlatList
              ref={flatListRef}
              data={liveComments}
              keyExtractor={(item) => item.id}
              renderItem={renderLiveComment}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.commentsList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <BlurView intensity={60} tint={theme.isDark ? 'dark' : 'light'} style={styles.commentInputBar}>
              {isLoggedIn ? (
                <>
                  <Ionicons name="happy-outline" size={20} color={theme.colors.text} />
                  <Text style={[styles.commentPlaceholder, { color: theme.colors.textSecondary }]}>
                    {replyTo ? `Replying to @${replyTo}…` : 'Add a comment…'}
                  </Text>
                  {replyTo && (
                    <TouchableOpacity onPress={handleSubmitReply} style={styles.sendButton}>
                      <Ionicons name="send" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color={theme.colors.textSecondary} />
                  <Text style={[styles.loginToCommentText, { color: theme.colors.textSecondary }]}>Login to comment</Text>
                </>
              )}
              <TouchableOpacity onPress={handleToggleLike} style={styles.heartButton}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#FF1744' : theme.colors.text} />
                <Text style={[styles.likeCountText, { color: theme.colors.text }]}>{likeCount}</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        ) : (
          <View style={styles.discoverCommentsContainer} {...panResponder.panHandlers}>
            <FlatList
              data={discoverComments}
              keyExtractor={(item) => item.id}
              renderItem={renderDiscoverComment}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListHeaderComponent={
                <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>
                  Comments ({discoverComments.length})
                </Text>
              }
            />
            <BlurView intensity={60} tint={theme.isDark ? 'dark' : 'light'} style={[styles.commentInputBar, { position: 'absolute', bottom: 0, left: 0, right: 0 }]}>
              {isLoggedIn ? (
                <>
                  <Ionicons name="happy-outline" size={20} color={theme.colors.text} />
                  <Text style={[styles.commentPlaceholder, { color: theme.colors.textSecondary }]}>Add a comment…</Text>
                </>
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color={theme.colors.textSecondary} />
                  <Text style={[styles.loginToCommentText, { color: theme.colors.textSecondary }]}>Login to comment</Text>
                </>
              )}
            </BlurView>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  webView: { flex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorTitle: { fontSize: 20, fontFamily: 'DMSans-Bold', marginTop: 16, marginBottom: 8 },
  errorMessage: { fontSize: 14, fontFamily: 'DMSans-Regular', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  openYouTubeButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 },
  openYouTubeText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'DMSans-Bold' },

  glassHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12, gap: 12,
  },
  leaveButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)' },
  leaveText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'DMSans-Bold' },
  headerInfo: { flex: 1 },
  channelNameText: { fontSize: 16, fontFamily: 'DMSans-Bold' },
  titleText: { fontSize: 13, fontFamily: 'DMSans-Regular' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FF1744', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  livePillText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'DMSans-Bold' },
  viewerCount: { color: '#FFFFFF', fontSize: 11, fontFamily: 'DMSans-Regular', marginLeft: 4 },

  // live chat
  commentsContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 12, paddingBottom: 20, maxHeight: '45%' },
  commentsList: { paddingBottom: 8 },
  commentBubble: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 6, alignSelf: 'flex-start', maxWidth: SCREEN_WIDTH * 0.8 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, gap: 8 },
  commentUser: { fontSize: 12, fontFamily: 'DMSans-Bold' },
  commentTime: { fontSize: 10, fontFamily: 'DMSans-Regular' },
  commentText: { fontSize: 13, fontFamily: 'DMSans-Regular', marginBottom: 4 },
  liveReplyButton: { alignSelf: 'flex-end', paddingVertical: 2, paddingHorizontal: 4 },
  liveReplyText: { color: '#888888', fontSize: 11, fontFamily: 'DMSans-Bold' },
  commentInputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, gap: 8 },
  commentPlaceholder: { flex: 1, fontSize: 14, fontFamily: 'DMSans-Regular' },
  loginToCommentText: { flex: 1, fontSize: 14, fontFamily: 'DMSans-Regular', fontStyle: 'italic' },
  sendButton: { padding: 4 },
  heartButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  likeCountText: { fontSize: 13, fontFamily: 'DMSans-Bold', marginLeft: 2 },

  // discover comments
  discoverCommentsContainer: { flex: 1, marginTop: 100, paddingHorizontal: 16 },
  sectionHeader: { fontSize: 16, fontFamily: 'DMSans-Bold', marginBottom: 12, marginTop: 8 },
  discoverCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  discoverUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontFamily: 'DMSans-Bold' },
  actionsRow: { flexDirection: 'row', gap: 24, marginTop: 10, marginBottom: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: { fontSize: 13, fontFamily: 'DMSans-Medium' },
  repliesContainer: { marginTop: 8, marginLeft: 20, gap: 6 },
  replyBubble: { padding: 8, borderRadius: 8, borderWidth: 1, marginBottom: 4 },
  replyUser: { fontSize: 12, fontFamily: 'DMSans-Bold', marginBottom: 2 },
  discoverReplyText: { fontSize: 13, fontFamily: 'DMSans-Regular', marginBottom: 2 },
});