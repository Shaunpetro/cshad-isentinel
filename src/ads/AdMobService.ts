import { Platform } from 'react-native';
import mobileAds, {
  MaxAdContentRating,
  AdsConsent,
  AdsConsentStatus,
} from 'react-native-google-mobile-ads';
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
  PermissionStatus,
} from 'expo-tracking-transparency';

let initialized = false;
let initPromise: Promise<boolean> | null = null;

export function initializeAds(): Promise<boolean> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let canRequestAds = true;

    // 1. GDPR / UMP consent
    try {
      const consentInfo = await AdsConsent.requestInfoUpdate();
      if (
        consentInfo.isConsentFormAvailable &&
        consentInfo.status === AdsConsentStatus.REQUIRED
      ) {
        const { status } = await AdsConsent.showForm();
        canRequestAds = status !== AdsConsentStatus.REQUIRED;
      }
    } catch (err) {
      console.warn('[ads] consent gathering failed, proceeding anyway', err);
    }

    // 2. iOS ATT
    if (Platform.OS === 'ios') {
      const { status } = await getTrackingPermissionsAsync();
      if (status === PermissionStatus.UNDETERMINED) {
        await requestTrackingPermissionsAsync();
      }
    }

    // 3. Request configuration
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });

    // 4. Initialize SDK
    await mobileAds().initialize();
    initialized = true;
    return canRequestAds;
  })();

  return initPromise;
}

export function adsAreInitialized(): boolean {
  return initialized;
}