// src/services/opportunities/opportunityService.ts
import { supabase } from '@/services/supabase/config';

export interface Opportunity {
  id: string;
  title: string;
  body: string;
  category: 'tender' | 'job' | 'bursary';
  subcategory?: string;
  province?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  closing_date: string;
  date_advertised?: string;
  apply_url?: string;
  tender_docs?: { name: string; url: string }[];
  salary_range?: string;
  company_name?: string;
  is_premium: boolean;
  submission_type?: string;
  created_at: string;
}

interface FetchOpportunitiesOptions {
  category?: 'tender' | 'job' | 'bursary';
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
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

export async function fetchOpportunities(options: FetchOpportunitiesOptions = {}): Promise<Opportunity[]> {
  const { category, latitude, longitude, radiusKm = 50, limit = 50 } = options;

  let query = supabase
    .from('opportunities')
    .select('*')
    .eq('status', 'published')
    .gte('closing_date', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[opportunityService] Error fetching opportunities:', error);
    return [];
  }

  let opportunities = data as Opportunity[];

  if (latitude !== undefined && longitude !== undefined && radiusKm > 0) {
    opportunities = opportunities.filter((opp) => {
      if (opp.latitude === undefined || opp.longitude === undefined) {
        return true; // national scope
      }
      const distance = calculateDistance(latitude, longitude, opp.latitude, opp.longitude);
      return distance <= radiusKm;
    });
  }

  return opportunities;
}