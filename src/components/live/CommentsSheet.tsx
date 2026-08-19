// src/components/live/CommentsSheet.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, ScrollView } from 'react-native';
import { useTheme } from '@/contexts';
import { Comment } from '@/services/forYouFeed';

interface Props {
  visible: boolean;
  comments: Comment[];
  onClose: () => void;
  title: string;
}

export default function CommentsSheet({ visible, comments, onClose, title }: Props) {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: 500,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.surface,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.handle} />
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>{title}</Text>
        <ScrollView style={styles.commentsList}>
          {comments.length === 0 ? (
            <Text style={[styles.noComments, { color: theme.colors.textSecondary }]}>No comments yet.</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={[styles.commentAuthor, { color: theme.colors.text }]}>{comment.author}</Text>
                <Text style={[styles.commentText, { color: theme.colors.text }]}>{comment.text}</Text>
                <Text style={[styles.commentMeta, { color: theme.colors.textSecondary }]}>
                  {new Date(comment.createdAt).toLocaleDateString()} · {comment.likes} likes
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CCCCCC',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  commentsList: {
    flex: 1,
  },
  noComments: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 4,
  },
  commentMeta: {
    fontSize: 12,
  },
});