import { create } from 'zustand';

interface AdFrequencyState {
  lastInterstitialAt: number;
  lastAppOpenAt: number;
  sessionInterstitialCount: number;
  recordInterstitialShown: () => void;
  recordAppOpenShown: () => void;
  canShowInterstitial: (minGapMs: number, maxPerSession?: number) => boolean;
  canShowAppOpen: (minGapMs: number) => boolean;
}

export const useAdFrequencyStore = create<AdFrequencyState>((set, get) => ({
  lastInterstitialAt: 0,
  lastAppOpenAt: 0,
  sessionInterstitialCount: 0,

  recordInterstitialShown: () =>
    set((s) => ({
      lastInterstitialAt: Date.now(),
      sessionInterstitialCount: s.sessionInterstitialCount + 1,
    })),

  recordAppOpenShown: () => set({ lastAppOpenAt: Date.now() }),

  canShowInterstitial: (minGapMs, maxPerSession = Infinity) => {
    const s = get();
    return (
      Date.now() - s.lastInterstitialAt > minGapMs &&
      s.sessionInterstitialCount < maxPerSession
    );
  },

  canShowAppOpen: (minGapMs) => Date.now() - get().lastAppOpenAt > minGapMs,
}));