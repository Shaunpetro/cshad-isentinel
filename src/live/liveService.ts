// src/services/live/liveService.ts
// Phase 2: Mock live-stream service (future: YouTube Data API via Supabase Edge Function)

export interface LiveStream {
    id: string;
    title: string;
    description: string;
    channelName: string;
    channelAvatar: string;
    thumbnailUrl: string;
    videoId: string;          // YouTube video ID
    isLive: boolean;
    viewerCount: number;
    startedAt: string;        // ISO timestamp
    category: 'news' | 'safety' | 'community' | 'official';
    verified: boolean;
  }
  
  const MOCK_STREAMS: LiveStream[] = [
    {
      id: '1',
      title: 'National Safety Briefing',
      description: 'Weekly national safety update from SAPS and community leaders.',
      channelName: 'SAPS Official',
      channelAvatar: 'https://via.placeholder.com/100/00D4AA/FFFFFF?text=SAPS',
      thumbnailUrl: 'https://via.placeholder.com/640x360/1C1C1C/00D4AA?text=National+Safety+Briefing',
      videoId: 'dQw4w9WgXcQ', // placeholder
      isLive: true,
      viewerCount: 1240,
      startedAt: new Date().toISOString(),
      category: 'official',
      verified: true,
    },
    {
      id: '2',
      title: 'Community Watch Meeting',
      description: 'Residents discuss recent incidents and safety improvements.',
      channelName: 'Joburg Community Watch',
      channelAvatar: 'https://via.placeholder.com/100/FFA726/FFFFFF?text=JCW',
      thumbnailUrl: 'https://via.placeholder.com/640x360/2B2B2B/FFA726?text=Community+Watch+Meeting',
      videoId: 'dQw4w9WgXcQ',
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
      videoId: 'dQw4w9WgXcQ',
      isLive: false,
      viewerCount: 0,
      startedAt: new Date(Date.now() - 86400000).toISOString(),
      category: 'news',
      verified: true,
    },
  ];
  
  class LiveService {
    // Future: replace with fetch from Supabase Edge Function
    async getLiveStreams(): Promise<LiveStream[]> {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return MOCK_STREAMS;
    }
  
    // Future: fetch a single stream by ID
    async getStreamById(id: string): Promise<LiveStream | null> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_STREAMS.find((s) => s.id === id) || null;
    }
  }
  
  export const liveService = new LiveService();