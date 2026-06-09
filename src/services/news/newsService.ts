// src/services/news/newsService.ts
import { supabase } from '@/services/supabase/config';
import { fetchWeatherData } from '@/services/weather';
import { fetchInfrastructureAlerts } from '@/services/infrastructure';

export async function fetchNewsArticles(options: {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
}) {
  const { latitude, longitude, radiusKm = 25, limit = 50 } = options;

  let query = supabase
    .from('news')
    .select('*')
    .eq('is_verified', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('[newsService] Error fetching news:', error);
    return [];
  }

  let articles = data || [];

  // Filter by location if coordinates are provided
  if (latitude !== undefined && longitude !== undefined && radiusKm > 0) {
    articles = articles.filter((article: any) => {
      if (!article.latitude || !article.longitude) return true; // keep national/international
      const distance = calculateDistance(latitude, longitude, article.latitude, article.longitude);
      return distance <= radiusKm;
    });
  }

  return articles;
}

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