// src/types/news.ts
// Phase 3A – Extended article types for content architecture & monetisation

export type ContentType = 'news' | 'location_update' | 'sponsored';

export type RelevanceScope = 'local' | 'national' | 'international';

export type LocationUpdateCategory =
  | 'weather'
  | 'road'
  | 'water'
  | 'electricity'
  | 'infrastructure'
  | 'community';

export type NewsCategory = string;

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  body?: string;
  imageUrl?: string;
  category: NewsCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  publishedAt: string;
  source: string;
  sourceType?: string;
  sourceUrl?: string;
  isVerified?: boolean;
  location?: { latitude: number; longitude: number };
  locationName?: string;
  contentType: ContentType;
  relevanceScope: RelevanceScope;
  blurredUntil?: string;               // ISO timestamp – used for tender delay
  locationUpdateCategory?: LocationUpdateCategory;
  reportCount?: number;
  verifiedCount?: number;
}

export interface LocalReport {
  id: string;
  category: LocationUpdateCategory;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  reportedBy: string;                  // device ID – anonymous
  votesConfirm: number;
  votesDeny: number;
  createdAt: string;
  expiresAt: string;
}