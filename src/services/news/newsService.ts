// src/services/news/newsService.ts
import { supabase } from '@/services/supabase/config';
import type { NewsRecord } from './types';

export interface NewsQueryParams {
  category?: string;
  scope?: 'local' | 'city' | 'national';
  latitude?: number;
  longitude?: number;
  cityName?: string;
  radiusKm?: number;
  timeFilter?: string;
  limit?: number;
  offset?: number;
}

export type TimeFilter = 'today' | 'week' | 'month' | 'all';

export const REFRESH_INTERVALS: Record<TimeFilter, number> = {
  today: 5 * 60 * 1000,
  week: 15 * 60 * 1000,
  month: 30 * 60 * 1000,
  all: 60 * 60 * 1000,
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getTimeFilterDate(timeFilter: TimeFilter): string | null {
  const now = new Date();
  switch (timeFilter) {
    case 'today':
      now.setHours(0, 0, 0, 0);
      return now.toISOString();
    case 'week':
      now.setDate(now.getDate() - 7);
      return now.toISOString();
    case 'month':
      now.setMonth(now.getMonth() - 1);
      return now.toISOString();
    default:
      return null;
  }
}

export async function fetchNews(params: NewsQueryParams = {}) {
  const {
    category,
    scope = 'national',
    latitude,
    longitude,
    cityName,
    radiusKm,
    timeFilter = 'all',
    limit = 20,
    offset = 0,
  } = params;

  let query = supabase
    .from('news')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const timeDate = getTimeFilterDate(timeFilter as TimeFilter);
  if (timeDate) {
    query = query.gte('published_at', timeDate);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[NewsService] Error fetching news:', error);
    return { data: [], error: error.message, count: 0 };
  }

  let articles = (data || []) as NewsRecord[];

  // Apply dynamic radius filtering for local scope
  if (scope === 'local' && latitude !== undefined && longitude !== undefined && radiusKm && radiusKm > 0) {
    articles = articles.filter((article) => {
      if (!article.latitude || !article.longitude) return true;
      const distance = calculateDistance(latitude, longitude, article.latitude, article.longitude);
      return distance <= radiusKm;
    });
  }

  return { data: articles, error: null, count: count || 0 };
}

export async function fetchNewsById(id: string) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as NewsRecord, error: null };
}

export async function fetchBreakingNews(limit = 10) {
  const { data, error, count } = await supabase
    .from('news')
    .select('*', { count: 'exact' })
    .eq('is_breaking', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], error: error.message, count: 0 };
  }

  return { data: (data || []) as NewsRecord[], error: null, count: count || 0 };
}

export function subscribeToNews(
  onInsert: (record: NewsRecord) => void,
  onUpdate: (record: NewsRecord) => void,
  options?: { cityName?: string }
) {
  console.log('[NewsService] Setting up realtime subscription');

  const channel = supabase
    .channel('news-realtime-' + (options?.cityName || 'all'))
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'news' },
      (payload) => {
        console.log('[NewsService] New article received');
        onInsert(payload.new as NewsRecord);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'news' },
      (payload) => {
        console.log('[NewsService] Article updated');
        onUpdate(payload.new as NewsRecord);
      }
    )
    .subscribe((status) => {
      console.log('[NewsService] Realtime subscription status:', status);
    });

  return () => {
    console.log('[NewsService] Unsubscribing from channel');
    supabase.removeChannel(channel);
  };
}