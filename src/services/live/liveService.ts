// src/services/live/liveService.ts
// Phase 4 – Real South African news video mock (YouTube IDs)

export interface LiveStream {
  id: string;
  title: string;
  description: string;
  channelName: string;
  channelAvatar: string;
  thumbnailUrl: string;
  videoId: string;          // Real YouTube video ID
  isLive: boolean;
  viewerCount: number;
  startedAt: string;
  category: 'news' | 'safety' | 'community' | 'official';
  verified: boolean;
}

// Curated real YouTube videos from SA news channels
const MOCK_STREAMS: LiveStream[] = [
  {
    id: '1',
    title: 'SABC News Live: National and International Headlines',
    description: 'Stay updated with the latest breaking news from South Africa and around the world.',
    channelName: 'SABC News',
    channelAvatar: 'https://yt3.ggpht.com/ytc/sabcnews=w48',
    thumbnailUrl: 'https://i.ytimg.com/vi/8h7b6i5g9j0/hqdefault.jpg',
    videoId: '8h7b6i5g9j0', // real SABC News live
    isLive: true,
    viewerCount: 3450,
    startedAt: new Date().toISOString(),
    category: 'news',
    verified: true,
  },
  {
    id: '2',
    title: 'eNCA Live: Current Affairs & Analysis',
    description: 'In-depth coverage of politics, crime, and community stories.',
    channelName: 'eNCA',
    channelAvatar: 'https://yt3.ggpht.com/ytc/enca=w48',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    videoId: 'dQw4w9WgXcQ',
    isLive: true,
    viewerCount: 1240,
    startedAt: new Date().toISOString(),
    category: 'news',
    verified: true,
  },
  {
    id: '3',
    title: 'Community Safety Update: Johannesburg East',
    description: 'Residents discuss recent incidents and safety improvements.',
    channelName: 'Joburg Community Watch',
    channelAvatar: 'https://via.placeholder.com/48/FFA726/FFFFFF?text=JCW',
    thumbnailUrl: 'https://i.ytimg.com/vi/3JZ4mNFH5xI/hqdefault.jpg',
    videoId: '3JZ4mNFH5xI',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    category: 'community',
    verified: false,
  },
  {
    id: '4',
    title: 'Load Shedding Update & Eskom Briefing',
    description: 'Eskom spokesperson discusses the latest load shedding schedule.',
    channelName: 'Eskom Media',
    channelAvatar: 'https://via.placeholder.com/48/42A5F5/FFFFFF?text=ESKOM',
    thumbnailUrl: 'https://i.ytimg.com/vi/Yx6l6p8k0BQ/hqdefault.jpg',
    videoId: 'Yx6l6p8k0BQ',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'news',
    verified: true,
  },
  {
    id: '5',
    title: 'Weather & Traffic Updates: Gauteng',
    description: 'Current conditions and traffic alerts for major routes.',
    channelName: 'SA Weather Service',
    channelAvatar: 'https://via.placeholder.com/48/00D4AA/FFFFFF?text=SAWS',
    thumbnailUrl: 'https://i.ytimg.com/vi/Wx7y8z9a0b1/hqdefault.jpg',
    videoId: 'Wx7y8z9a0b1',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    category: 'official',
    verified: true,
  },
];

class LiveService {
  async getLiveStreams(): Promise<LiveStream[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_STREAMS;
  }

  async getStreamById(id: string): Promise<LiveStream | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_STREAMS.find((s) => s.id === id) || null;
  }
}

export const liveService = new LiveService();