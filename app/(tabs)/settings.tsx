// app/(tabs)/settings.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  Share,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Typography, Spacing } from "@/config/theme";
import { APP } from "@/config/constants";
import {
  LegalModal,
  DeveloperCredits,
  SettingsItem,
  PreferenceToggle,
  PreferenceSelector,
  OptionPickerModal,
  PickerOption,
} from "@/components/settings";
import { PrivacyModal } from "@/components/privacy";
import { CityPickerModal } from "@/components/news";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "@/content/legal";
import { scheduleTestNotification } from "@/services/notifications";
import { usePreferences } from "@/hooks/usePreferences";
import { useLanguage, LanguageCode } from "@/hooks/useLanguage";
import { useTheme } from "@/contexts";
import {
  AppearanceMode,
  NewsScope,
  NewsRadius,
  HomeLocation,
} from "@/services/preferences";
import { SACity } from "@/services/location";

export default function SettingsScreen() {
  // Theme context
  const { colors, mode: themeMode, setMode: setThemeMode } = useTheme();

  // Translation
  const { t } = useTranslation();

  // Language hook
  const { currentLanguage, currentLanguageLabel, changeLanguage, availableLanguages } = useLanguage();

  // Preferences hook
  const {
    preferences,
    isLoading,
    updateHomeLocation,
    updateNewsRadius,
    updateDefaultScope,
    updateSoundEnabled,
    updateVibrationEnabled,
  } = usePreferences();

  // Modal states
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyDashboardVisible, setPrivacyDashboardVisible] = useState(false);

  // Picker modal states
  const [appearancePickerVisible, setAppearancePickerVisible] = useState(false);
  const [languagePickerVisible, setLanguagePickerVisible] = useState(false);
  const [scopePickerVisible, setScopePickerVisible] = useState(false);
  const [radiusPickerVisible, setRadiusPickerVisible] = useState(false);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);

  // ---- Option Definitions (with translations) ----
  const APPEARANCE_OPTIONS: PickerOption<AppearanceMode>[] = [
    { value: 'dark', label: t('settings.dark'), subtitle: t('settings.appearanceSubtitle'), icon: 'moon' },
    { value: 'light', label: t('settings.light'), subtitle: t('settings.appearanceSubtitle'), icon: 'sunny' },
    { value: 'system', label: t('settings.system'), subtitle: t('settings.appearanceSubtitle'), icon: 'phone-portrait-outline' },
  ];

  const LANGUAGE_PICKER_OPTIONS: PickerOption<LanguageCode>[] = availableLanguages.map((lang) => ({
    value: lang.code as LanguageCode,
    label: lang.nativeLabel,
    subtitle: lang.label !== lang.nativeLabel ? lang.label : undefined,
    icon: 'language-outline',
  }));

  const SCOPE_OPTIONS: PickerOption<NewsScope>[] = [
    { value: 'local', label: t('news.local'), subtitle: t('settings.defaultScopeSubtitle'), icon: 'location' },
    { value: 'national', label: t('news.national'), subtitle: t('settings.defaultScopeSubtitle'), icon: 'flag' },
    { value: 'international', label: t('news.international'), subtitle: t('settings.defaultScopeSubtitle'), icon: 'globe' },
  ];

  const RADIUS_OPTIONS: PickerOption<NewsRadius>[] = [
    { value: 5, label: '5 km', subtitle: t('news.local') },
    { value: 10, label: '10 km', subtitle: t('news.local') },
    { value: 25, label: '25 km', subtitle: t('news.local') },
    { value: 50, label: '50 km', subtitle: t('news.national') },
    { value: 100, label: '100 km', subtitle: t('news.national') },
  ];

  // Handle email support
  const handleEmailSupport = async () => {
    const email = "petrographics.adm@gmail.com";
    const subject = encodeURIComponent("PSHAD iSentinel Support");
    const body = encodeURIComponent(`\n\n---\nApp Version: ${APP.version}\nPlatform: ${Platform.OS}`);
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('common.error'), "No email app available");
      }
    } catch (error) {
      Alert.alert(t('common.error'), "Could not open email app");
    }
  };

  // Handle rate app
  const handleRateApp = () => {
    Alert.alert(
      t('settings.rateApp'),
      "This will open the app store when the app is published. Thank you for your support!",
      [{ text: t('common.ok') }]
    );
  };

  // Handle share app
  const handleShareApp = async () => {
    try {
      await Share.share({
        title: "PSHAD iSentinel",
        message:
          "Check out PSHAD iSentinel - A privacy-first community safety app for South Africa. Download it now!",
      });
    } catch (error) {
      // User cancelled or error
    }
  };

  // Handle test notification
  const handleTestNotification = async () => {
    try {
      await scheduleTestNotification();
      Alert.alert(
        t('settings.testNotification'),
        "A notification will appear in 2 seconds!",
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), "Could not schedule notification");
    }
  };

  // Handle city selection
  const handleCitySelect = (city: SACity) => {
    const homeLocation: HomeLocation = {
      id: city.id,
      name: city.name,
      province: city.province,
      latitude: city.latitude,
      longitude: city.longitude,
    };
    updateHomeLocation(homeLocation);
    setCityPickerVisible(false);
  };

  // Handle appearance change (uses theme context)
  const handleAppearanceChange = async (newMode: AppearanceMode) => {
    await setThemeMode(newMode);
    setAppearancePickerVisible(false);
  };

  // Handle language change
  const handleLanguageChange = async (newLanguage: LanguageCode) => {
    try {
      await changeLanguage(newLanguage);
      setLanguagePickerVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), "Could not change language");
    }
  };

  // Get display values
  const getAppearanceLabel = () => {
    switch (themeMode) {
      case 'dark': return t('settings.dark');
      case 'light': return t('settings.light');
      case 'system': return t('settings.system');
      default: return t('settings.dark');
    }
  };

  const getScopeLabel = () => {
    switch (preferences.defaultScope) {
      case 'local': return t('news.local');
      case 'national': return t('news.national');
      case 'international': return t('news.international');
      default: return t('news.local');
    }
  };

  const getRadiusLabel = () => {
    return `${preferences.newsRadius} km`;
  };

  const getHomeLocationLabel = () => {
    return preferences.homeLocation?.name || t('common.unknown');
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>
      </View>

      {/* Display Preferences */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{t('settings.display')}</Text>
        <PreferenceSelector
          icon="moon-outline"
          iconColor={colors.info}
          title={t('settings.appearance')}
          subtitle={t('settings.appearanceSubtitle')}
          value={getAppearanceLabel()}
          onPress={() => setAppearancePickerVisible(true)}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <PreferenceSelector
          icon="language-outline"
          iconColor={colors.warning}
          title={t('settings.language')}
          subtitle={t('settings.languageSubtitle')}
          value={currentLanguageLabel}
          onPress={() => setLanguagePickerVisible(true)}
        />
      </View>

      {/* Location & News Preferences */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{t('settings.newsFeed')}</Text>
        <PreferenceSelector
          icon="home-outline"
          iconColor={colors.primary}
          title={t('settings.homeLocation')}
          subtitle={t('settings.homeLocationSubtitle')}
          value={getHomeLocationLabel()}
          onPress={() => setCityPickerVisible(true)}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <PreferenceSelector
          icon="radio-outline"
          iconColor={colors.warning}
          title={t('settings.newsRadius')}
          subtitle={t('settings.newsRadiusSubtitle')}
          value={getRadiusLabel()}
          onPress={() => setRadiusPickerVisible(true)}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <PreferenceSelector
          icon="globe-outline"
          iconColor={colors.success}
          title={t('settings.defaultScope')}
          subtitle={t('settings.defaultScopeSubtitle')}
          value={getScopeLabel()}
          onPress={() => setScopePickerVisible(true)}
        />
      </View>

      {/* Feedback Preferences */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{t('settings.feedback')}</Text>
        <PreferenceToggle
          icon="volume-high-outline"
          iconColor="#FF6B6B"
          title={t('settings.soundEffects')}
          subtitle={t('settings.soundEffectsSubtitle')}
          value={preferences.soundEnabled}
          onValueChange={updateSoundEnabled}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <PreferenceToggle
          icon="phone-portrait-outline"
          iconColor="#9B59B6"
          title={t('settings.vibration')}
          subtitle={t('settings.vibrationSubtitle')}
          value={preferences.vibrationEnabled}
          onValueChange={updateVibrationEnabled}
        />
      </View>

      {/* Notifications */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{t('settings.notifications')}</Text>
        <SettingsItem
          icon="notifications-outline"
          iconColor={colors.info}
          title={t('settings.pushNotifications')}
          subtitle={t('settings.pushNotificationsSubtitle')}
          showArrow={false}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <SettingsItem
          icon="paper-plane-outline"
          iconColor={colors.warning}
          title={t('settings.testNotification')}
          subtitle={t('settings.testNotificationSubtitle')}
          onPress={handleTestNotification}
        />
      </View>

      {/* Privacy */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{t('settings.privacy')}</Text>
        <SettingsItem
          icon="shield-checkmark-outline"
          iconColor={colors.success}
          title={t('settings.privacyDashboard')}
          subtitle={t('settings.privacyDashboardSubtitle')}
          onPress={() => setPrivacyDashboardVisible(true)}
        />
      </View>

      {/* Help & Support */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{t('settings.helpSupport')}</Text>
        <SettingsItem
          icon="mail-outline"
          iconColor={colors.primary}
          title={t('settings.contactSupport')}
          subtitle="petrographics.adm@gmail.com"
          onPress={handleEmailSupport}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <SettingsItem
          icon="star-outline"
          iconColor="#FFD700"
          title={t('settings.rateApp')}
          subtitle={t('settings.rateAppSubtitle')}
          onPress={handleRateApp}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <SettingsItem
          icon="share-social-outline"
          iconColor={colors.info}
          title={t('settings.shareApp')}
          subtitle={t('settings.shareAppSubtitle')}
          onPress={handleShareApp}
        />
      </View>

      {/* Legal */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{t('settings.legal')}</Text>
        <SettingsItem
          icon="document-text-outline"
          title={t('settings.privacyPolicy')}
          onPress={() => setPrivacyModalVisible(true)}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <SettingsItem
          icon="reader-outline"
          title={t('settings.termsOfService')}
          onPress={() => setTermsModalVisible(true)}
        />
      </View>

      {/* About / Developer Credits */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{t('settings.about')}</Text>
        <View style={styles.creditsContainer}>
          <DeveloperCredits />
        </View>
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          {t('settings.version')} {APP.version}
        </Text>
      </View>

      {/* Copyright Footer */}
      <View style={styles.footer}>
        <Text style={[styles.copyright, { color: colors.textSecondary }]}>
          ATG © 2026 PSHAD iSentinel
        </Text>
        <Text style={[styles.rights, { color: colors.textDisabled }]}>
          All Rights Reserved
        </Text>
      </View>

      {/* ---- MODALS ---- */}

      {/* Legal Modals */}
      <LegalModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        title={t('settings.privacyPolicy')}
        lastUpdated={PRIVACY_POLICY.lastUpdated}
        content={PRIVACY_POLICY.content}
      />

      <LegalModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        title={t('settings.termsOfService')}
        lastUpdated={TERMS_OF_SERVICE.lastUpdated}
        content={TERMS_OF_SERVICE.content}
      />

      {/* Privacy Dashboard Modal */}
      <PrivacyModal
        visible={privacyDashboardVisible}
        onClose={() => setPrivacyDashboardVisible(false)}
      />

      {/* Appearance Picker */}
      <OptionPickerModal
        visible={appearancePickerVisible}
        onClose={() => setAppearancePickerVisible(false)}
        title={t('settings.appearance')}
        options={APPEARANCE_OPTIONS}
        selectedValue={themeMode}
        onSelect={handleAppearanceChange}
      />

      {/* Language Picker */}
      <OptionPickerModal
        visible={languagePickerVisible}
        onClose={() => setLanguagePickerVisible(false)}
        title={t('settings.language')}
        options={LANGUAGE_PICKER_OPTIONS}
        selectedValue={currentLanguage}
        onSelect={handleLanguageChange}
      />

      {/* Scope Picker */}
      <OptionPickerModal
        visible={scopePickerVisible}
        onClose={() => setScopePickerVisible(false)}
        title={t('settings.defaultScope')}
        options={SCOPE_OPTIONS}
        selectedValue={preferences.defaultScope}
        onSelect={updateDefaultScope}
      />

      {/* Radius Picker */}
      <OptionPickerModal
        visible={radiusPickerVisible}
        onClose={() => setRadiusPickerVisible(false)}
        title={t('settings.newsRadius')}
        options={RADIUS_OPTIONS}
        selectedValue={preferences.newsRadius}
        onSelect={updateNewsRadius}
      />

      {/* City Picker */}
      <CityPickerModal
        visible={cityPickerVisible}
        onClose={() => setCityPickerVisible(false)}
        onSelectCity={handleCitySelect}
        currentCityId={preferences.homeLocation?.id ?? ''}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.md,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.title,
    fontFamily: Typography.fonts.bold,
  },
  section: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.medium,
    letterSpacing: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  itemDivider: {
    height: 1,
    marginLeft: 60,
  },
  creditsContainer: {
    paddingBottom: Spacing.md,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  versionText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.mono,
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  copyright: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
  },
  rights: {
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.regular,
    marginTop: Spacing.xs,
  },
});