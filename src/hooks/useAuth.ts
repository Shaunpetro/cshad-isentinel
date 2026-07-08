// src/hooks/useAuth.ts
import { useState, useCallback } from 'react';

interface ActivityItem {
  id: string;
  type: 'like' | 'comment' | 'reply';
  user: string;
  text: string;
  timestamp: string; // relative, e.g. "12s ago"
}

interface MockProfile {
  username: string;
  avatar: string;
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock profile
  const profile: MockProfile | null = isLoggedIn
    ? { username: 'CSHAD_Fan', avatar: '' }
    : null;

  // Mock activity (only meaningful when logged in)
  const activity: ActivityItem[] = isLoggedIn
    ? [
        { id: 'a1', type: 'like', user: 'You', text: 'liked a stream', timestamp: '3s ago' },
        { id: 'a2', type: 'comment', user: 'Sipho M.', text: 'replied: \"This is great\"', timestamp: '25s ago' },
        { id: 'a3', type: 'reply', user: 'You', text: 'replied to Sipho M.', timestamp: '1m ago' },
        { id: 'a4', type: 'like', user: 'Zanele K.', text: 'liked your comment', timestamp: '3m ago' },
        { id: 'a5', type: 'comment', user: 'Thabo J.', text: 'commented on a live stream', timestamp: '7m ago' },
      ]
    : [];

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => setIsLoggedIn(false), []);

  return { isLoggedIn, profile, activity, login, logout };
}