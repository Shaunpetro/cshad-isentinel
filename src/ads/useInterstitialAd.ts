import { useCallback, useEffect, useRef, useState } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AdUnitIds } from './adUnitIds';
import { useAdFrequencyStore } from './useAdFrequencyStore';

const MIN_GAP_MS = 3 * 60 * 1000;
const MAX_PER_SESSION = 6;

export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false);
  const adRef = useRef(InterstitialAd.createForAdRequest(AdUnitIds.interstitial));
  const canShow = useAdFrequencyStore((s) => s.canShowInterstitial);
  const recordShown = useAdFrequencyStore((s) => s.recordInterstitialShown);

  const load = useCallback(() => {
    setLoaded(false);
    adRef.current.load();
  }, []);

  useEffect(() => {
    const ad = adRef.current;
    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => load());
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (err) => {
      console.warn('[ads] interstitial failed to load', err);
    });
    load();
    return () => {
      unsubLoaded();
      unsubClosed();
      unsubError();
    };
  }, [load]);

  const showIfReady = useCallback(() => {
    if (!loaded) return false;
    if (!canShow(MIN_GAP_MS, MAX_PER_SESSION)) return false;
    adRef.current.show();
    recordShown();
    return true;
  }, [loaded, canShow, recordShown]);

  return { loaded, showIfReady };
}