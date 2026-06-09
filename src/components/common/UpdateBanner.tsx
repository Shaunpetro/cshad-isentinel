// src/components/common/UpdateBanner.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase/config';

const BANNER_KEY = 'update_banner_dismissed_at';

export function UpdateBanner() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [updateUrl, setUpdateUrl] = useState('');

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    try {
      const { data, error } = await supabase
        .from('config')
        .select('value')
        .eq('key', 'latest_version')
        .single();

      if (error || !data) return;

      const latestVersion = data.value;
      const currentVersion = Constants.expoConfig?.version || '1.0.0';

      if (latestVersion !== currentVersion) {
        const dismissedAt = await AsyncStorage.getItem(BANNER_KEY);
        if (dismissedAt) {
          const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
          if (daysSince < 3) return;
        }

        const { data: msgData } = await supabase
          .from('config')
          .select('value')
          .eq('key', 'update_message')
          .single();
        setMessage(msgData?.value || 'A new version is available! Update now for the best experience.');
        setUpdateUrl('https://play.google.com/store/apps/details?id=cshad.isentinel.news');
        setVisible(true);
      }
    } catch (err) {
      // silently fail
    }
  };

  const handleDismiss = async () => {
    await AsyncStorage.setItem(BANNER_KEY, Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="download-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
      <Text style={styles.text} numberOfLines={2}>
        {message}
      </Text>
      <View style={styles.actions}>
        <Pressable
          style={styles.updateButton}
          onPress={() => Linking.openURL(updateUrl)}
        >
          <Text style={styles.updateText}>Update</Text>
        </Pressable>
        <Pressable onPress={handleDismiss} hitSlop={8}>
          <Ionicons name="close" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  updateButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  updateText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
  },
});