// src/components/privacy/AnonymousIdCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/config/theme';
import { formatAnonymousId } from '@/services/privacy';

interface AnonymousIdCardProps {
  anonymousId: string | null;
  createdDate: string | null;
  isLoading: boolean;
  onCopyId?: () => void;
}

export function AnonymousIdCard({
  anonymousId,
  createdDate,
  isLoading,
  onCopyId,
}: AnonymousIdCardProps) {
  const [showFull, setShowFull] = useState(false);

  const displayId = anonymousId
    ? showFull
      ? anonymousId
      : formatAnonymousId(anonymousId)
    : '—';

  const formattedDate = createdDate
    ? new Date(createdDate).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="finger-print" size={24} color={Colors.semantic.primary} />
        </View>
        <Text style={styles.title}>Your Anonymous ID</Text>
      </View>

      <View style={styles.idContainer}>
        {isLoading ? (
          <ActivityIndicator color={Colors.semantic.primary} size="small" />
        ) : (
          <>
            <TouchableOpacity
              style={styles.idBox}
              onPress={() => setShowFull(!showFull)}
              activeOpacity={0.7}
            >
              <Text style={styles.idText}>{displayId}</Text>
              <Ionicons
                name={showFull ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.carbon.silver}
              />
            </TouchableOpacity>

            {onCopyId && (
              <TouchableOpacity style={styles.copyButton} onPress={onCopyId}>
                <Ionicons name="copy-outline" size={18} color={Colors.semantic.primary} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <Text style={styles.description}>
        This random ID is used only for rate limiting. It cannot identify you.
      </Text>

      {formattedDate && (
        <Text style={styles.createdDate}>Created: {formattedDate}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.carbon.charcoal,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.carbon.steel,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.semantic.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  title: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  idBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.carbon.black,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.xs,
  },
  idText: {
    color: Colors.semantic.primary,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.mono,
    flex: 1,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.carbon.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    lineHeight: 18,
  },
  createdDate: {
    color: Colors.carbon.steel,
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.xs,
  },
});