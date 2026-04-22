// src/services/news/newsService.ts
import { supabase } from '../supabase/config';
import type {
  NewsRecord,
  NewsQueryParams,
  NewsQueryResult,
  SingleNewsResult,
  TimeFilter,
} from './types';
import { ARTICLE_LIMITS } from './types';
import {
  findCityByName,
  getCitiesInProvince,
  extractProvinceFromLocation,
  PROVINCE_CODES,
  type SACity
} from '../location/saCities';

/**
 * Calculate date threshold for time filter
 */
function getTimeThreshold(timeFilter: TimeFilter): Date | null {
  const now = new Date();

  switch (timeFilter) {
    case 'live':
      // Last 1 hour
      return new Date(now.getTime() - 60 * 60 * 1000);
    case 'today':
      // Start of today
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return today;
    case 'week':
      // Last 7 days
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      // Last 30 days
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null; // No time filter
  }
}

/**
 * Get article limit based on scope
 */
function getLimit(scope: string, requestedLimit?: number): number {
  const scopeLimits = ARTICLE_LIMITS[scope as keyof typeof ARTICLE_LIMITS] || ARTICLE_LIMITS.national;
  return Math.min(requestedLimit || scopeLimits.active, scopeLimits.max);
}

/**
 * Build CITY-ONLY search terms (no province to avoid cross-city matches)
 * This is for Layer 2 - strict city matching
 */
function buildCitySearchTerms(city: SACity): string[] {
  const terms: string[] = [];

  // Add city name
  terms.push(city.name);

  // Add aliases if available (e.g., "Joburg", "JHB" for Johannesburg)
  if (city.aliases) {
    terms.push(...city.aliases);
  }

  // DO NOT add province or provinceCode here!
  // That was causing JHB to match PTA (both in Gauteng)

  return terms;
}

/**
 * Build location search terms for province-level fallback (Layer 3 only)
 */
function buildProvinceSearchTerms(province: string): string[] {
  const terms: string[] = [province];

  // Add province code
  const code = PROVINCE_CODES[province];
  if (code) {
    terms.push(code);
  }

  return [...new Set(terms)];
}

/**
 * Check if a location_name matches the target city
 * More strict matching to avoid false positives
 */
function locationMatchesCity(locationName: string | null, city: SACity): boolean {
  if (!locationName) return false;
  
  const locationLower = locationName.toLowerCase();
  const cityLower = city.name.toLowerCase();
  
  // Direct city name match
  if (locationLower.includes(cityLower)) return true;
  
  // Alias match
  if (city.aliases) {
    for (const alias of city.aliases) {
      if (locationLower.includes(alias.toLowerCase())) return true;
    }
  }
  
  return false;
}

/**
 * Check if a location_name is in the same province but DIFFERENT city
 * Used to filter out cross-city matches
 */
function isWrongCityInSameProvince(locationName: string | null, targetCity: SACity): boolean {
  if (!locationName) return false;
  
  const locationLower = locationName.toLowerCase();
  
  // Get all cities in the same province
  const citiesInProvince = getCitiesInProvince(targetCity.province);
  
  for (const otherCity of citiesInProvince) {
    // Skip the target city itself
    if (otherCity.id === targetCity.id) continue;
    
    // Check if location matches this OTHER city
    if (locationLower.includes(otherCity.name.toLowerCase())) {
      return true; // It's a different city in the same province
    }
    
    // Check aliases of other city
    if (otherCity.aliases) {
      for (const alias of otherCity.aliases) {
        if (locationLower.includes(alias.toLowerCase())) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Fetch news articles with multi-layer location filtering
 *
 * Layer 1: Coordinate-based (for articles with lat/lng)
 * Layer 2: Text-based CITY matching (strict - city name/aliases only)
 * Layer 3: Province fallback (only if < 5 results from Layers 1+2)
 */
export async function fetchNews(params: NewsQueryParams = {}): Promise<NewsQueryResult> {
  try {
    const {
      category,
      scope = 'national',
      latitude,
      longitude,
      cityName,
      radiusKm,
      timeFilter = 'all',
      limit,
      offset = 0,
      breakingOnly = false,
    } = params;

    // Calculate effective limit based on scope
    const effectiveLimit = getLimit(scope, limit);

    // For local scope, we need special handling
    if (scope === 'local') {
      return await fetchLocalNews({
        category,
        latitude,
        longitude,
        cityName,
        radiusKm,
        timeFilter,
        limit: effectiveLimit,
        offset,
        breakingOnly,
      });
    }

    // For national/international scope - standard query
    let query = supabase
      .from('news')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + effectiveLimit - 1);

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Filter breaking news only
    if (breakingOnly) {
      query = query.eq('is_breaking', true);
    }

    // Time-based filtering
    const timeThreshold = getTimeThreshold(timeFilter);
    if (timeThreshold) {
      query = query.gte('published_at', timeThreshold.toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[NewsService] Fetch error:', error.message);
      return { data: [], count: null, error: error.message };
    }

    console.log(`[NewsService] Fetched ${data?.length || 0} articles (scope: ${scope}, time: ${timeFilter})`);
    return { data: data || [], count, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[NewsService] Exception:', message);
    return { data: [], count: null, error: message };
  }
}

/**
 * Fetch local news with multi-layer location matching
 */
async function fetchLocalNews(params: {
  category?: string;
  latitude?: number;
  longitude?: number;
  cityName?: string;
  radiusKm?: number;
  timeFilter: TimeFilter;
  limit: number;
  offset: number;
  breakingOnly: boolean;
}): Promise<NewsQueryResult> {
  const {
    category,
    latitude,
    longitude,
    cityName,
    radiusKm = 25,
    timeFilter,
    limit,
    offset,
    breakingOnly,
  } = params;

  // Determine the user's city for text matching
  let userCity: SACity | null = null;
  let userProvince: string | null = null;

  if (cityName) {
    userCity = findCityByName(cityName);
    if (userCity) {
      userProvince = userCity.province;
      console.log(`[NewsService] Local filter: City "${userCity.name}" in ${userProvince}`);
    }
  }

  // Build time threshold
  const timeThreshold = getTimeThreshold(timeFilter);

  // LAYER 1: Coordinate-based query (if we have coords)
  let coordResults: NewsRecord[] = [];
  if (latitude && longitude) {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)));

    let coordQuery = supabase
      .from('news')
      .select('*')
      .gte('latitude', latitude - latDelta)
      .lte('latitude', latitude + latDelta)
      .gte('longitude', longitude - lngDelta)
      .lte('longitude', longitude + lngDelta)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (category) {
      coordQuery = coordQuery.eq('category', category);
    }
    if (breakingOnly) {
      coordQuery = coordQuery.eq('is_breaking', true);
    }
    if (timeThreshold) {
      coordQuery = coordQuery.gte('published_at', timeThreshold.toISOString());
    }

    const { data: coordData } = await coordQuery;
    coordResults = coordData || [];
    console.log(`[NewsService] Layer 1 (coords): ${coordResults.length} articles within ${radiusKm}km`);
  }

  // LAYER 2: Text-based CITY matching (STRICT - no province matching!)
  let textResults: NewsRecord[] = [];
  if (userCity) {
    // Only use city name and aliases, NOT province
    const searchTerms = buildCitySearchTerms(userCity);

    let textQuery = supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit * 2); // Get more to filter duplicates

    if (category) {
      textQuery = textQuery.eq('category', category);
    }
    if (breakingOnly) {
      textQuery = textQuery.eq('is_breaking', true);
    }
    if (timeThreshold) {
      textQuery = textQuery.gte('published_at', timeThreshold.toISOString());
    }

    // Match city name and aliases only (not province!)
    const orConditions = searchTerms
      .slice(0, 5)
      .map(term => `location_name.ilike.%${term}%`)
      .join(',');

    textQuery = textQuery.or(orConditions);

    const { data: textData } = await textQuery;
    
    // IMPORTANT: Post-filter to remove articles from OTHER cities in the same province
    // e.g., if user selected JHB, filter out articles with "Pretoria" in location_name
    const filteredTextData = (textData || []).filter(article => {
      // If it matches our city, keep it
      if (locationMatchesCity(article.location_name, userCity!)) {
        return true;
      }
      // If it matches a DIFFERENT city in the same province, reject it
      if (isWrongCityInSameProvince(article.location_name, userCity!)) {
        console.log(`[NewsService] Filtered out: "${article.title?.substring(0, 40)}..." (location: ${article.location_name})`);
        return false;
      }
      // Ambiguous - keep it (might be generic province news)
      return true;
    });
    
    textResults = filteredTextData;
    console.log(`[NewsService] Layer 2 (text): ${textResults.length} articles matching "${userCity.name}" (filtered from ${textData?.length || 0})`);
  }

  // LAYER 3: Province fallback (ONLY if combined results are very low)
  let provinceResults: NewsRecord[] = [];
  const combinedCount = new Set([...coordResults.map(r => r.id), ...textResults.map(r => r.id)]).size;

  if (combinedCount < 5 && userProvince) {
    console.log(`[NewsService] Layer 3: Only ${combinedCount} results, falling back to province "${userProvince}"`);
    
    let provinceQuery = supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (category) {
      provinceQuery = provinceQuery.eq('category', category);
    }
    if (breakingOnly) {
      provinceQuery = provinceQuery.eq('is_breaking', true);
    }
    if (timeThreshold) {
      provinceQuery = provinceQuery.gte('published_at', timeThreshold.toISOString());
    }

    // Match province in location_name
    provinceQuery = provinceQuery.ilike('location_name', `%${userProvince}%`);

    const { data: provinceData } = await provinceQuery;
    provinceResults = provinceData || [];
    console.log(`[NewsService] Layer 3 (province): ${provinceResults.length} articles in ${userProvince}`);
  }

  // Merge and deduplicate results
  const allResults = [...coordResults, ...textResults, ...provinceResults];
  const uniqueResults = deduplicateNews(allResults);

  // Sort by published_at descending
  uniqueResults.sort((a, b) =>
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  // Apply pagination
  const paginatedResults = uniqueResults.slice(offset, offset + limit);

  console.log(`[NewsService] Local total: ${paginatedResults.length} unique articles (coords: ${coordResults.length}, text: ${textResults.length}, province: ${provinceResults.length})`);

  return {
    data: paginatedResults,
    count: uniqueResults.length,
    error: null,
  };
}

/**
 * Remove duplicate articles by ID
 */
function deduplicateNews(articles: NewsRecord[]): NewsRecord[] {
  const seen = new Set<string>();
  return articles.filter(article => {
    if (seen.has(article.id)) {
      return false;
    }
    seen.add(article.id);
    return true;
  });
}

/**
 * Fetch a single news article by ID
 */
export async function fetchNewsById(id: string): Promise<SingleNewsResult> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[NewsService] Fetch by ID error:', error.message);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[NewsService] Exception:', message);
    return { data: null, error: message };
  }
}

/**
 * Fetch breaking news only
 */
export async function fetchBreakingNews(limit: number = 10): Promise<NewsQueryResult> {
  return fetchNews({
    breakingOnly: true,
    limit: Math.min(limit, ARTICLE_LIMITS.breaking.max),
    timeFilter: 'today', // Breaking news should be recent
  });
}

/**
 * Fetch news by category
 */
export async function fetchNewsByCategory(
  category: NewsQueryParams['category'],
  limit: number = 20
): Promise<NewsQueryResult> {
  return fetchNews({ category, limit });
}

// Track active subscriptions to prevent duplicates
const activeSubscriptions = new Map<string, ReturnType<typeof supabase.channel>>();

/**
 * Subscribe to real-time news updates
 * Optionally filter by location
 */
export function subscribeToNews(
  onInsert: (record: NewsRecord) => void,
  onUpdate?: (record: NewsRecord) => void,
  options?: { cityName?: string; province?: string }
): () => void {
  // Create unique channel name based on options
  const channelId = `news-realtime-${options?.cityName || 'all'}-${Date.now()}`;

  // Clean up any existing subscription with similar base name
  const baseChannelName = `news-realtime-${options?.cityName || 'all'}`;
  for (const [key, existingChannel] of activeSubscriptions.entries()) {
    if (key.startsWith(baseChannelName.split('-').slice(0, 3).join('-'))) {
      console.log(`[NewsService] Cleaning up existing channel: ${key}`);
      supabase.removeChannel(existingChannel);
      activeSubscriptions.delete(key);
    }
  }

  // Create channel and add all callbacks BEFORE subscribing
  let channel = supabase.channel(channelId);

  // Add INSERT listener
  channel = channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'news',
    },
    (payload) => {
      const record = payload.new as NewsRecord;

      // Optional location filter for realtime
      if (options?.cityName || options?.province) {
        const locationName = record.location_name?.toLowerCase() || '';

        let matches = false;

        if (options.cityName) {
          const city = findCityByName(options.cityName);
          if (city) {
            // Check city name and aliases
            matches = locationName.includes(city.name.toLowerCase());
            if (!matches && city.aliases) {
              matches = city.aliases.some(alias =>
                locationName.includes(alias.toLowerCase())
              );
            }
          }
        }

        if (!matches && options.province) {
          matches = locationName.includes(options.province.toLowerCase());
        }

        if (!matches) {
          console.log('[NewsService] Skipping article (wrong location):', record.title?.substring(0, 50));
          return;
        }
      }

      console.log('[NewsService] New article received:', record.title?.substring(0, 50));
      onInsert(record);
    }
  );

  // Add UPDATE listener if callback provided
  if (onUpdate) {
    channel = channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'news',
      },
      (payload) => {
        console.log('[NewsService] Article updated:', (payload.new as NewsRecord).title?.substring(0, 50));
        onUpdate(payload.new as NewsRecord);
      }
    );
  }

  // NOW subscribe after all callbacks are added
  channel.subscribe((status) => {
    console.log(`[NewsService] Realtime subscription status: ${status}`);
    if (status === 'SUBSCRIBED') {
      console.log(`[NewsService] Successfully subscribed to channel: ${channelId}`);
    }
  });

  // Track this subscription
  activeSubscriptions.set(channelId, channel);

  // Return cleanup function
  return () => {
    console.log(`[NewsService] Unsubscribing from channel: ${channelId}`);
    supabase.removeChannel(channel);
    activeSubscriptions.delete(channelId);
  };
}

/**
 * Get news statistics by category
 */
export async function fetchNewsStats(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('category');

    if (error || !data) {
      return {};
    }

    // Count by category
    const stats: Record<string, number> = {};
    data.forEach((item) => {
      const cat = item.category;
      stats[cat] = (stats[cat] || 0) + 1;
    });

    return stats;
  } catch (err) {
    console.error('[NewsService] Stats error:', err);
    return {};
  }
}