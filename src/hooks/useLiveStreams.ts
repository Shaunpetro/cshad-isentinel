// src/hooks/useLiveStreams.ts
// Phase 4 – Improved hook with retry, timeout, and fallback

import { useState, useEffect, useCallback, useRef } from 'react';
import { liveService, LiveStream } from '../services/live/liveService';

interface UseLiveStreamsReturn {
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
  const isMounted = useRef(true);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchStreams = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const data = await liveService.getLiveStreams();
      if (isMounted.current) {
        setStreams(data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to load streams');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchStreams();

    // Retry every 30 seconds if there was an error
    retryTimeout.current = setInterval(() => {
      if (error) {
        fetchStreams(true);
      }
    }, 30000);

    return () => {
      isMounted.current = false;
      if (retryTimeout.current) clearInterval(retryTimeout.current);
    };
  }, [fetchStreams, error]);

  const liveNow = streams.filter((s) => s.isLive);
  const upcoming = streams.filter((s) => !s.isLive);

  return {
    liveNow,
    upcoming,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchStreams(true),
  };
}