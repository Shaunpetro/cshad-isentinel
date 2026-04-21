// src/services/supabase/types.ts
/**
 * Supabase Database Types
 * Matches the schema created in Supabase SQL Editor
 */

// ---- Tip Types ----

export type TipRow = {
    id: string;
    anonymous_id: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    latitude: number | null;
    longitude: number | null;
    location_accuracy: number | null;
    image_url: string | null;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    created_at: string;
    updated_at: string;
  };
  
  export type TipInsert = {
    anonymous_id: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    latitude?: number | null;
    longitude?: number | null;
    location_accuracy?: number | null;
    image_url?: string | null;
    status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  };
  
  export type TipUpdate = Partial<TipInsert>;
  
  // ---- News Types ----
  
  export type NewsRow = {
    id: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    source_url: string | null;
    image_url: string | null;
    latitude: number | null;
    longitude: number | null;
    location_name: string | null;
    published_at: string;
    created_at: string;
  };
  
  export type NewsInsert = {
    title: string;
    summary: string;
    content: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    source_url?: string | null;
    image_url?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
    published_at: string;
  };
  
  export type NewsUpdate = Partial<NewsInsert>;
  
  // ---- Database Schema (Supabase format) ----
  
  export type Database = {
    public: {
      Tables: {
        tips: {
          Row: TipRow;
          Insert: TipInsert;
          Update: TipUpdate;
        };
        news: {
          Row: NewsRow;
          Insert: NewsInsert;
          Update: NewsUpdate;
        };
      };
      Views: Record<string, never>;
      Functions: Record<string, never>;
      Enums: Record<string, never>;
      CompositeTypes: Record<string, never>;
    };
  };
  
  // ---- Convenience Exports ----
  
  export type Tip = TipRow;
  export type NewsArticle = NewsRow;