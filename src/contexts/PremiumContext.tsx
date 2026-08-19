// src/contexts/PremiumContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_KEY = 'pshad_premium_subscribed';

interface PremiumContextValue {
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(PREMIUM_KEY).then((val) => {
      setIsSubscribed(val === 'true');
      setIsLoading(false);
    });
  }, []);

  const subscribe = useCallback(async () => {
    await AsyncStorage.setItem(PREMIUM_KEY, 'true');
    setIsSubscribed(true);
  }, []);

  const unsubscribe = useCallback(async () => {
    await AsyncStorage.setItem(PREMIUM_KEY, 'false');
    setIsSubscribed(false);
  }, []);

  return (
    <PremiumContext.Provider value={{ isSubscribed, isLoading, subscribe, unsubscribe }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}