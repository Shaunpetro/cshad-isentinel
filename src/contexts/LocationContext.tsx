// src/contexts/LocationContext.tsx
import React, { createContext, useContext } from 'react';
import { useLocation, UseLocationResult } from '@/hooks/useLocation';

const LocationContext = createContext<UseLocationResult | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): UseLocationResult {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}