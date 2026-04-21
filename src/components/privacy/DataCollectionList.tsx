// src/components/privacy/DataCollectionList.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/config/theme';
import { type DataCollectionItem } from '@/services/privacy';

interface DataCollectionListProps {
  items: DataCollectionItem[];
}

export function DataCollectionList({ items }: DataCollectionListProps) {
  const collectedItems = items.filter((item) => item.isCollected);
  const notCollectedItems = items.filter((item) => !item.isCollected);

  return (
    <View style={styles.container}>
      {/* Data We Collect */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA WE COLLECT</Text>
        {collectedItems.map((item) => (
          <DataItem key={item.id} item={item} />
        ))}
      </View>

      {/* Data We Don't Collect */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA WE NEVER COLLECT</Text>
        {notCollectedItems.map((item) => (
          <DataItem key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

function DataItem({ item }: { item: DataCollectionItem }) {
  const iconColor = item.isCollected
    ? Colors.semantic.success
    : Colors.semantic.danger;
  
  const checkIcon = item.isCollected ? 'checkmark-circle' : 'close-circle';

  return (
    <View style={styles.item}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons
          name={item.icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={iconColor}
        />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemLabel}>{item.label}</Text>
          <Ionicons name={checkIcon} size={16} color={iconColor} />
        </View>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  section: {
    backgroundColor: Colors.carbon.charcoal,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.carbon.steel,
  },
  sectionTitle: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLabel: {
    color: Colors.carbon.white,
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  itemDescription: {
    color: Colors.carbon.silver,
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    marginTop: 2,
  },
});