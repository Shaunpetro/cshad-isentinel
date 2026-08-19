// src/components/monetisation/AudioAdModal.tsx
// Beta 4 – Audio ad modal with countdown, subscribe prompt, and TTS reader

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useTheme } from '@/contexts';
import { Typography, Spacing, BorderRadius } from '@/config/theme';

interface Props {
  visible: boolean;
  articleBody: string;
  onClose: () => void;
  onSubscribe: () => void;
  isSubscribed?: boolean;
}

const AD_DURATION = 15;
const AUTO_CLOSE_DELAY = 5;

export default function AudioAdModal({ visible, articleBody, onClose, onSubscribe, isSubscribed = false }: Props) {
  const { colors } = useTheme();
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [adComplete, setAdComplete] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;

    // Premium users skip the mock ad and start reading immediately
    if (isSubscribed) {
      handleStartReading();
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
        Speech.stop();
      };
    }

    setCountdown(AD_DURATION);
    setAdComplete(false);
    setIsReading(false);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setAdComplete(true);
          autoCloseRef.current = setTimeout(() => {
            handleStartReading();
          }, AUTO_CLOSE_DELAY * 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      Speech.stop();
    };
  }, [visible, isSubscribed]);

  const handleStartReading = () => {
    setAdComplete(true);
    setIsReading(true);
    Speech.speak(articleBody, {
      language: 'en-ZA',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setIsReading(false),
      onStopped: () => setIsReading(false),
    });
  };

  const handleClose = () => {
    Speech.stop();
    setIsReading(false);
    onClose();
  };

  const handleCloseAd = () => {
    if (!adComplete) return;
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    handleStartReading();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Ionicons name="megaphone-outline" size={20} color={colors.primary} />
            <Text style={[styles.headerText, { color: colors.text }]}>Sponsored Message</Text>
            {adComplete && (
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.adPlaceholder, { backgroundColor: colors.divider }]}>
            <Ionicons name="image-outline" size={48} color={colors.textDisabled} />
            <Text style={[styles.adText, { color: colors.textSecondary }]}>
              {isSubscribed ? 'Premium Audio Reader' : isReading ? 'Audio Reader Active' : 'Your Ad Here'}
            </Text>
            {!isReading && !isSubscribed && (
              <Text style={[styles.adSubtext, { color: colors.textDisabled }]}>
                Audio reader starts after the ad
              </Text>
            )}
          </View>

          <View style={styles.controls}>
            {!adComplete && !isReading && !isSubscribed && (
              <View style={styles.countdownRow}>
                <Ionicons name="timer-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.countdownText, { color: colors.textSecondary }]}>
                  {countdown}s
                </Text>
              </View>
            )}
            {adComplete && !isReading && (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity onPress={handleCloseAd} style={[styles.listenButton, { backgroundColor: colors.primary }]}>
                  <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
            )}
            {isReading && (
              <View style={styles.readingRow}>
                <Ionicons name="volume-high-outline" size={18} color={colors.success} />
                <Text style={[styles.readingText, { color: colors.success }]}>Reading article...</Text>
              </View>
            )}
          </View>

          {!adComplete && !isSubscribed && (
            <TouchableOpacity style={styles.subscribeLink} onPress={onSubscribe}>
              <Text style={[styles.subscribeText, { color: colors.primary }]}>
                Subscribe to remove ads
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerText: {
    flex: 1,
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
  },
  closeBtn: { padding: 4 },
  adPlaceholder: {
    height: 160,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  adText: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Medium',
  },
  adSubtext: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Regular',
  },
  controls: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countdownText: {
    fontSize: Typography.sizes.title,
    fontFamily: 'DMSans-Bold',
  },
  listenButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  readingText: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Medium',
  },
  subscribeLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  subscribeText: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Medium',
    textDecorationLine: 'underline',
  },
});