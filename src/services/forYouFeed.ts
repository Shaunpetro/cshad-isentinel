// src/services/forYouFeed.ts
// Phase 1: Mock data for For You vertical feed
// Later replaced by Supabase Edge Function aggregation

export interface Comment {
    id: string;
    author: string;
    text: string;
    createdAt: string;
    likes: number;
  }
  
  export interface ForYouItem {
    id: string;
    type: 'video' | 'audio';
    title: string;
    description?: string;
    thumbnailUrl?: string;
    mediaUrl?: string;          // direct MP4/MP3 URL for audio or direct video
    videoId?: string;           // YouTube video ID for video type
    duration?: number;
    channelName?: string;
    publishedAt: string;
    category: 'news' | 'safety' | 'community' | 'official';
    likes: number;
    comments: Comment[];
    tags: string[];
    caption?: string;
  }
  
  const MOCK_COMMENTS: Comment[] = [
    {
      id: 'c1',
      author: 'User123',
      text: 'This is so important for our community.',
      createdAt: '2026-08-19T08:00:00Z',
      likes: 12,
    },
    {
      id: 'c2',
      author: 'SafetyFirst',
      text: 'Thanks for covering this.',
      createdAt: '2026-08-19T07:30:00Z',
      likes: 5,
    },
  ];
  
  export const MOCK_FOR_YOU_FEED: ForYouItem[] = [
    {
      id: 'pod-1',
      type: 'audio',
      title: 'EWN Morning Brief: Cape Town water updates',
      description: 'A quick update on water restrictions and local safety.',
      thumbnailUrl: 'https://via.placeholder.com/400x400/1C1C1C/00D4AA?text=EWN+Podcast',
      mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 240,
      channelName: 'Eyewitness News',
      publishedAt: new Date().toISOString(),
      category: 'news',
      likes: 45,
      comments: MOCK_COMMENTS,
      tags: ['#water', '#capetown', '#safety'],
      caption: 'Stay informed about your water supply.',
    },
    {
      id: 'vid-1',
      type: 'video',
      title: 'SABC News: Community watch meeting highlights',
      description: 'Residents discuss recent incidents and safety improvements.',
      thumbnailUrl: 'https://via.placeholder.com/640x360/2B2B2B/FFA726?text=Community+Watch',
      videoId: '3JZ4mNFH5xI', // example YouTube ID
      duration: 180,
      channelName: 'SABC News',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      category: 'community',
      likes: 32,
      comments: [],
      tags: ['#community', '#watch', '#safety'],
      caption: 'Local community meeting recap.',
    },
    {
      id: 'pod-2',
      type: 'audio',
      title: '702 Breakfast: Load shedding outlook for this week',
      description: 'Bongani Bingwa speaks to energy experts.',
      thumbnailUrl: 'https://via.placeholder.com/400x400/1C1C1C/42A5F5?text=702',
      mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 300,
      channelName: '702',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      category: 'news',
      likes: 18,
      comments: [],
      tags: ['#loadshedding', '#energy'],
      caption: 'What to expect this week.',
    },
    {
      id: 'vid-2',
      type: 'video',
      title: 'eNCA: National safety briefing',
      description: 'Police minister provides update on crime stats.',
      thumbnailUrl: 'https://via.placeholder.com/640x360/1C1C1C/00D4AA?text=National+Safety',
      videoId: '8h7b6i5g9j0',
      duration: 360,
      channelName: 'eNCA',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      category: 'safety',
      likes: 67,
      comments: [],
      tags: ['#safety', '#police', '#crime'],
      caption: 'Latest from the briefing.',
    },
  ];