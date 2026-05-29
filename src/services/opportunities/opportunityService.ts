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
  source_id?: string;   // <-- added
}

interface FetchOpportunitiesOptions {
  category?: 'tender' | 'job' | 'bursary';
  limit?: number;
}

export async function fetchOpportunities(options: FetchOpportunitiesOptions = {}): Promise<Opportunity[]> {
  const { category, limit = 50 } = options;

  let query = supabase
    .from('opportunities')
    .select('*')
    .eq('status', 'published')
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

  return (data as Opportunity[]) || [];
}