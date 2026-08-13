// src/services/live/liveService.ts
// Phase 4 – Real live feed from Supabase Edge Function + mock fallback

import { supabase } from '@/services/supabase/config';

export interface LiveStream {
  id: string;
  title: string;
  description: string;
  channelName: string;
  channelAvatar: string;
  thumbnailUrl: string;
  videoId: string;
  isLive: boolean;
  viewerCount: number;
  startedAt: string;
  category: 'news' | 'safety' | 'community' | 'official';
  verified: boolean;
}

// Fallback mock data used when the edge function is unavailable
const MOCK_STREAMS: LiveStream[] = [
  {
    id: '1',
    title: 'SABC News Live: National and International Headlines',
    description: 'Stay updated with the latest breaking news from South Africa and around the world.',
    channelName: 'SABC News',
    channelAvatar: 'https://via.placeholder.com/100/00D4AA/FFFFFF?text=SABC',
    thumbnailUrl: 'https://via.placeholder.com/640x360/1C1C1C/00D4AA?text=National+Safety+Briefing',
    videoId: '8h7b6i5g9j0',
    isLive: true,
    viewerCount: 3450,
    startedAt: new Date().toISOString(),
    category: 'news',
    verified: true,
  },
  {
    id: '2',
    title: 'Community Watch Meeting',
    description: 'Residents discuss recent incidents and safety improvements.',
    channelName: 'Joburg Community Watch',
    channelAvatar: 'https://via.placeholder.com/100/FFA726/FFFFFF?text=JCW',
    thumbnailUrl: 'https://via.placeholder.com/640x360/2B2B2B/FFA726?text=Community+Watch+Meeting',
    videoId: '3JZ4mNFH5xI',
    isLive: true,
    viewerCount: 87,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    category: 'community',
    verified: false,
  },
  {
    id: '3',
    title: 'Load Shedding Update & Tips',
    description: 'Eskom spokesperson discusses the latest load shedding schedule and preparation tips.',
    channelName: 'Eskom Media',
    channelAvatar: 'https://via.placeholder.com/100/42A5F5/FFFFFF?text=ESKOM',
    thumbnailUrl: 'https://via.placeholder.com/640x360/2B2B2B/42A5F5?text=Load+Shedding+Update',
    videoId: 'Yx6l6p8k0BQ',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'news',
    verified: true,
  },
];

class LiveService {
  // Fetches live and recent videos from the Supabase Edge Function.
  // Falls back to mock data if the request fails.
  async getLiveStreams(): Promise<LiveStream[]> {
    try {
      const { data, error } = await supabase.functions.invoke('live-feed', {
        body: { type: 'all' },
      });

      if (error) {
        console.warn('[LiveService] Edge function error, using mock data:', error.message);
        return MOCK_STREAMS;
      }

      if (data?.videos && Array.isArray(data.videos)) {
        // Map edge response to LiveStream, adding missing defaults
        const streams: LiveStream[] = data.videos.map((v: any) => ({
          id: v.id,
          title: v.title,
          description: v.description || '',
          channelName: v.channelName || 'Unknown',
          channelAvatar: v.channelAvatar || '',
          thumbnailUrl: v.thumbnailUrl || '',
          videoId: v.videoId || v.id,
          isLive: v.isLive || false,
          viewerCount: v.viewerCount || 0,
          startedAt: v.publishedAt || new Date().toISOString(),
          category: v.category || 'news',
          verified: v.verified || false,
        }));

        // If no videos, fall back to mock
        if (streams.length === 0) return MOCK_STREAMS;
        return streams;
      }

      return MOCK_STREAMS;
    } catch (err) {
      console.error('[LiveService] Failed to fetch live streams:', err);
      return MOCK_STREAMS;
    }
  }

  async getStreamById(id: string): Promise<LiveStream | null> {
    const streams = await this.getLiveStreams();
    return streams.find((s) => s.id === id) || null;
  }
}

export const liveService = new LiveService();