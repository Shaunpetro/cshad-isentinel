// src/services/live/liveService.ts
// Phase 2: Mock live-stream service (hardcoded demo data)

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
  category: 'news' | 'safety' | 'community' | 'official' | 'sports' | 'podcast';
  verified: boolean;
  type: 'live' | 'video' | 'short';
}

const MOCK_STREAMS: LiveStream[] = [
  {
    id: 'live-1',
    title: 'Paid Live Stream (Demo)',
    description: 'A featured live stream for demonstration.',
    channelName: 'Demo Channel',
    channelAvatar: 'https://via.placeholder.com/100/FF4757/FFFFFF?text=LIVE',
    thumbnailUrl: 'https://via.placeholder.com/640x360/1C1C1C/FF4757?text=Live+Stream',
    videoId: 'aQQ8bC2ORmo',
    isLive: true,
    viewerCount: 1240,
    startedAt: new Date().toISOString(),
    category: 'official',
    verified: true,
    type: 'live',
  },
  {
    id: 'live-2',
    title: 'Second Live Stream',
    description: 'Another live stream example.',
    channelName: 'Streaming Now',
    channelAvatar: 'https://via.placeholder.com/100/FFA726/FFFFFF?text=SN',
    thumbnailUrl: 'https://via.placeholder.com/640x360/2B2B2B/FFA726?text=Live+Now',
    videoId: '2OB5us8ews4',
    isLive: true,
    viewerCount: 87,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    category: 'community',
    verified: false,
    type: 'live',
  },
  {
    id: 'podcast-1',
    title: 'Sports Podcast: Match Analysis',
    description: 'In-depth analysis of the latest matches.',
    channelName: 'Sports Talk ZA',
    channelAvatar: 'https://via.placeholder.com/100/4CAF50/FFFFFF?text=ST',
    thumbnailUrl: 'https://via.placeholder.com/640x360/2B2B2B/4CAF50?text=Sports+Podcast',
    videoId: 'dUHhz931BmY',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'sports',
    verified: true,
    type: 'video',
  },
  {
    id: 'podcast-2',
    title: 'Sports Podcast: Offside Review',
    description: 'Debating the biggest offside calls of the season.',
    channelName: 'Referee\'s Corner',
    channelAvatar: 'https://via.placeholder.com/100/2196F3/FFFFFF?text=RC',
    thumbnailUrl: 'https://via.placeholder.com/640x360/1C1C1C/2196F3?text=Offside+Review',
    videoId: 'NWih4HAcnCc',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 172800000).toISOString(),
    category: 'sports',
    verified: false,
    type: 'video',
  },
  {
    id: 'podcast-3',
    title: 'Sports Podcast: Rugby Roundup',
    description: 'Everything rugby in South Africa.',
    channelName: 'Rugby Live SA',
    channelAvatar: 'https://via.placeholder.com/100/9C27B0/FFFFFF?text=RUG',
    thumbnailUrl: 'https://via.placeholder.com/640x360/2B2B2B/9C27B0?text=Rugby+Roundup',
    videoId: 'psvj9_aWzv0',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 259200000).toISOString(),
    category: 'sports',
    verified: false,
    type: 'video',
  },
  {
    id: 'podcast-4',
    title: 'Sports Podcast: Cricket Weekly',
    description: 'Weekly cricket analysis.',
    channelName: 'Cricket Central',
    channelAvatar: 'https://via.placeholder.com/100/FF9800/FFFFFF?text=CC',
    thumbnailUrl: 'https://via.placeholder.com/640x360/1C1C1C/FF9800?text=Cricket+Weekly',
    videoId: 'qRq0z-74vm8',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 345600000).toISOString(),
    category: 'sports',
    verified: false,
    type: 'video',
  },
  {
    id: 'podcast-5',
    title: 'Sports Podcast: Soccer Show',
    description: 'Premier Soccer League highlights.',
    channelName: 'PSL Now',
    channelAvatar: 'https://via.placeholder.com/100/E91E63/FFFFFF?text=PSL',
    thumbnailUrl: 'https://via.placeholder.com/640x360/2B2B2B/E91E63?text=Soccer+Show',
    videoId: 'NoWcN53xpAs',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 432000000).toISOString(),
    category: 'sports',
    verified: false,
    type: 'video',
  },
  {
    id: 'podcast-6',
    title: 'Sports Podcast: Netball Nation',
    description: 'Netball news and interviews.',
    channelName: 'Netball SA',
    channelAvatar: 'https://via.placeholder.com/100/00BCD4/FFFFFF?text=NSA',
    thumbnailUrl: 'https://via.placeholder.com/640x360/1C1C1C/00BCD4?text=Netball+Nation',
    videoId: 'YmX2QILq5xo',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 518400000).toISOString(),
    category: 'sports',
    verified: false,
    type: 'video',
  },
  {
    id: 'video-1',
    title: 'News Analysis Video',
    description: 'Additional news analysis video.',
    channelName: 'News Desk',
    channelAvatar: 'https://via.placeholder.com/100/607D8B/FFFFFF?text=ND',
    thumbnailUrl: 'https://via.placeholder.com/640x360/2B2B2B/607D8B?text=News+Analysis',
    videoId: '_AFO8lewm_g',
    isLive: false,
    viewerCount: 0,
    startedAt: new Date(Date.now() - 604800000).toISOString(),
    category: 'news',
    verified: true,
    type: 'video',
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