// src/services/localReports.ts
// Phase 3A – CRUD for user‑submitted local reports (Supabase)

import { supabase } from './supabase'; // adjust path if needed
import { LocalReport, LocationUpdateCategory } from '../types/news';

const TABLE = 'local_reports';

export async function fetchReportsByCity(cityName: string): Promise<LocalReport[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('locationName', cityName)
    .gte('expiresAt', new Date().toISOString())
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('[localReports] fetch error:', error.message);
    return [];
  }
  return data as LocalReport[];
}

export async function submitReport(report: Omit<LocalReport, 'id' | 'createdAt' | 'expiresAt' | 'votesConfirm' | 'votesDeny'>): Promise<boolean> {
  const { error } = await supabase.from(TABLE).insert({
    ...report,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    votesConfirm: 0,
    votesDeny: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
  });
  if (error) {
    console.error('[localReports] submit error:', error.message);
    return false;
  }
  return true;
}

export async function voteReport(reportId: string, type: 'confirm' | 'deny'): Promise<void> {
  const column = type === 'confirm' ? 'votesConfirm' : 'votesDeny';
  await supabase.rpc('increment_report_vote', { report_id: reportId, column_name: column });
}