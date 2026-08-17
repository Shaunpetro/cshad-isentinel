import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { AdUnitIds } from './adUnitIds';

interface Reward {
  amount: number;
  type: string;
}

export function useRewardedAd(onEarnedReward: (reward: Reward) => void) {
  const [loaded, setLoaded] = useState(false);
  const adRef = useRef(RewardedAd.createForAdRequest(AdUnitIds.rewarded));

  const load = useCallback(() => {
    setLoaded(false);
    adRef.current.load();
  }, []);

  useEffect(() => {
    const ad = adRef.current;
    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => setLoaded(true));
    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => onEarnedReward(reward));
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => load());
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (err) => {
      console.warn('[ads] rewarded ad failed to load', err);
    });
    load();
    return () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
    };
  }, [load, onEarnedReward]);

  const show = useCallback(() => {
    if (!loaded) return false;
    adRef.current.show();
    return true;
  }, [loaded]);

  return { loaded, show };
}