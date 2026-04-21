// v1.263_001/src/components/news/CategoryFilter.tsx
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Spacing } from "@/config/theme";
import { CategoryChip } from "./CategoryChip";
import type { NewsCategory } from "@typeDefs/index";

const CATEGORIES: (NewsCategory | "all")[] = [
  "all",
  "crime",
  "safety",
  "community",
  "infrastructure",
  "weather",
  "traffic",
  "general",
];

interface Props {
  activeCategory: NewsCategory | "all";
  onSelect: (category: NewsCategory | "all") => void;
}

export function CategoryFilter({ activeCategory, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => (
        <CategoryChip
          key={category}
          category={category}
          isActive={activeCategory === category}
          onPress={() => onSelect(category)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});