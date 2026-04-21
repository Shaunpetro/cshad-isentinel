// src/services/news/types.ts
import type { NewsCategory, NewsSeverity, NewsSourceType } from '@/types';

/**
 * Time filter options for news queries
 */
export type TimeFilter = 'live' | 'today' | 'week' | 'month' | 'all';

/**
 * Raw news record from Supabase database
 */
export interface NewsRecord {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  severity: string;
  source: string;
  source_type: string;
  source_url: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  published_at: string;
  created_at: string | null;
  is_verified: boolean;
  is_breaking: boolean;
}

/**
 * Query parameters for fetching news
 */
export interface NewsQueryParams {
  category?: NewsCategory;
  scope?: 'local' | 'city' | 'national';
  latitude?: number;
  longitude?: number;
  cityName?: string;
  radiusKm?: number;
  timeFilter?: TimeFilter;
  limit?: number;
  offset?: number;
  breakingOnly?: boolean;
}

/**
 * Response from news queries
 */
export interface NewsQueryResult {
  data: NewsRecord[];
  count: number | null;
  error: string | null;
}

/**
 * Single news item response
 */
export interface SingleNewsResult {
  data: NewsRecord | null;
  error: string | null;
}

/**
 * Article limits per scope
 */
export const ARTICLE_LIMITS = {
  local: { active: 50, max: 100 },
  city: { active: 75, max: 150 },
  national: { active: 100, max: 200 },
  breaking: { active: 10, max: 20 },
} as const;

/**
 * Auto-refresh intervals in milliseconds
 */
export const REFRESH_INTERVALS = {
  live: 60 * 1000,        // 1 minute
  today: 5 * 60 * 1000,   // 5 minutes
  week: 15 * 60 * 1000,   // 15 minutes
  month: 30 * 60 * 1000,  // 30 minutes
  all: 30 * 60 * 1000,    // 30 minutes
} as const;