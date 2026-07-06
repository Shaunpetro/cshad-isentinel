// src/hooks/useLiveStreams.ts
// Phase 2: Hook to fetch and cache live streams

import { useState, useEffect, useCallback } from 'react';
import { liveService, LiveStream } from '@/services/live/liveService';

interface UseLiveStreamsReturn {
  streams: LiveStream[];
  liveNow: LiveStream[];
  upcoming: LiveStream[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
}

export function useLiveStreams(): UseLiveStreamsReturn {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStreams = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const data = await liveService.getLiveStreams();
      setStreams(data);
    } catch (err) {
      setError('Failed to load live streams');
      console.error('[useLiveStreams]', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  const liveNow = streams.filter((s) => s.isLive);
  const upcoming = streams.filter((s) => !s.isLive);

  return {
    streams,
    liveNow,
    upcoming,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchStreams(true),
  };
}
