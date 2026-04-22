// src/components/news/CategoryFilter.tsx
import React, { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Spacing } from "@/config/theme";
import { CategoryChip } from "./CategoryChip";
import type { NewsCategory, NewsItem } from "@/types";

interface Props {
  activeCategory: NewsCategory | "all";
  onSelect: (category: NewsCategory | "all") => void;
  articles?: NewsItem[]; // Optional - if provided, shows only categories that exist in data
}

// Default display order for categories
const CATEGORY_ORDER: (NewsCategory | "all")[] = [
  "all",
  "crime",
  "safety",
  "accident",
  "fire",
  "traffic",
  "weather",
  "infrastructure",
  "water",
  "electricity",
  "health",
  "politics",
  "community",
  "general",
  "other",
];

export function CategoryFilter({ activeCategory, onSelect, articles }: Props) {
  // Derive categories from articles if provided, otherwise show common ones
  const categories = useMemo(() => {
    if (!articles || articles.length === 0) {
      // Default categories when no data
      return ["all", "crime", "safety", "community", "infrastructure", "weather", "traffic", "general"] as (NewsCategory | "all")[];
    }

    // Get unique categories from articles
    const articleCategories = new Set<NewsCategory>();
    articles.forEach((article) => {
      if (article.category) {
        articleCategories.add(article.category);
      }
    });

    // Build ordered list: "all" first, then categories in preferred order
    const orderedCategories: (NewsCategory | "all")[] = ["all"];
    
    CATEGORY_ORDER.forEach((cat) => {
      if (cat !== "all" && articleCategories.has(cat as NewsCategory)) {
        orderedCategories.push(cat);
      }
    });

    // Add any categories not in our predefined order
    articleCategories.forEach((cat) => {
      if (!orderedCategories.includes(cat)) {
        orderedCategories.push(cat);
      }
    });

    return orderedCategories;
  }, [articles]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
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