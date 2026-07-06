// src/components/live/LivePlayer.tsx
// Phase 2: In-app YouTube player using WebView (mini-player & full-screen)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LivePlayerProps {
  videoId: string;
  title: string;
  channelName: string;
  isLive: boolean;
}

export default function LivePlayer({ videoId, title, channelName, isLive }: LivePlayerProps) {
  const theme = useTheme();
  const [fullscreen, setFullscreen] = useState(false);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1`;

  const openFullscreen = useCallback(() => setFullscreen(true), []);
  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  return (
    <>
      {/* Mini‑player (shown inline) */}
      <TouchableOpacity
        style={[styles.miniContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={openFullscreen}
        activeOpacity={0.9}
      >
        <View style={styles.miniPlayer}>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.miniWebView}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        </View>
        <View style={styles.miniInfo}>
          <Text style={[styles.miniTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.miniChannel, { color: theme.colors.textSecondary }]}>
            {channelName}
          </Text>
        </View>
        <TouchableOpacity style={styles.expandButton} onPress={openFullscreen}>
          <Ionicons name="expand" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Full‑screen modal */}
      <Modal visible={fullscreen} animationType="slide" supportedOrientations={['portrait', 'landscape']}>
        <View style={[styles.fullscreenContainer, { backgroundColor: '#000' }]}>
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity onPress={closeFullscreen} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.fullscreenTitle} numberOfLines={1}>{title}</Text>
              <Text style={styles.fullscreenChannel}>{channelName}</Text>
            </View>
            {isLive && (
              <View style={styles.fullscreenLiveBadge}>
                <Ionicons name="radio" size={12} color="#FFFFFF" />
                <Text style={styles.fullscreenLiveText}>LIVE</Text>
              </View>
            )}
          </View>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.fullscreenWebView}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback={false}
            mediaPlaybackRequiresUserAction={false}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Mini‑player
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  miniPlayer: {
    width: 120,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  miniWebView: {
    flex: 1,
  },
  miniInfo: {
    flex: 1,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miniChannel: {
    fontSize: 12,
  },
  expandButton: {
    padding: 8,
  },

  // Full‑screen
  fullscreenContainer: {
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#000',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  fullscreenTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullscreenChannel: {
    color: '#AAAAAA',
    fontSize: 13,
  },
  fullscreenLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF4757',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fullscreenLiveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fullscreenWebView: {
    flex: 1,
  },
});