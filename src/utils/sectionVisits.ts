// src/utils/sectionVisits.ts
// Phase 1 – Lightweight section‑visit tracking with AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

const VISITS_KEY = 'section_visits';

export async function incrementSectionVisit(sectionKey: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(VISITS_KEY);
    const visits: Record<string, number> = raw ? JSON.parse(raw) : {};
    visits[sectionKey] = (visits[sectionKey] || 0) + 1;
    await AsyncStorage.setItem(VISITS_KEY, JSON.stringify(visits));
  } catch (e) {
    console.error('[sectionVisits] Error incrementing:', e);
  }
}

export async function getTopSections(limit = 3): Promise<{ key: string; count: number }[]> {
  try {
    const raw = await AsyncStorage.getItem(VISITS_KEY);
    if (!raw) return [];
    const visits: Record<string, number> = JSON.parse(raw);
    return Object.entries(visits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([key, count]) => ({ key, count }));
  } catch (e) {
    console.error('[sectionVisits] Error getting top sections:', e);
    return [];
  }
}