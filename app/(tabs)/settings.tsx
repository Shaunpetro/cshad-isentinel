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
import { useTheme } from "@/contexts";
import { 
  AppearanceMode, 
  NewsScope, 
  NewsRadius,
  HomeLocation,
} from "@/services/preferences";
import { SACity } from "@/services/location";

// ---- Option Definitions ----

const APPEARANCE_OPTIONS: PickerOption<AppearanceMode>[] = [
  { value: 'dark', label: 'Dark', subtitle: 'Easy on the eyes', icon: 'moon' },
  { value: 'light', label: 'Light', subtitle: 'Bright and clear', icon: 'sunny' },
  { value: 'system', label: 'System', subtitle: 'Match device settings', icon: 'phone-portrait-outline' },
];

const SCOPE_OPTIONS: PickerOption<NewsScope>[] = [
  { value: 'local', label: 'Local', subtitle: 'News in your area', icon: 'location' },
  { value: 'national', label: 'National', subtitle: 'News across South Africa', icon: 'flag' },
  { value: 'international', label: 'International', subtitle: 'Global safety news', icon: 'globe' },
];

const RADIUS_OPTIONS: PickerOption<NewsRadius>[] = [
  { value: 5, label: '5 km', subtitle: 'Very local' },
  { value: 10, label: '10 km', subtitle: 'Neighborhood' },
  { value: 25, label: '25 km', subtitle: 'City area' },
  { value: 50, label: '50 km', subtitle: 'Metro region' },
  { value: 100, label: '100 km', subtitle: 'Extended area' },
];

export default function SettingsScreen() {
  // Theme context
  const { colors, mode: themeMode, setMode: setThemeMode } = useTheme();

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
  const [scopePickerVisible, setScopePickerVisible] = useState(false);
  const [radiusPickerVisible, setRadiusPickerVisible] = useState(false);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);

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
        Alert.alert("Error", "No email app available");
      }
    } catch (error) {
      Alert.alert("Error", "Could not open email app");
    }
  };

  // Handle rate app
  const handleRateApp = () => {
    Alert.alert(
      "Rate PSHAD iSentinel",
      "This will open the app store when the app is published. Thank you for your support!",
      [{ text: "OK" }]
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
        "Test Notification",
        "A notification will appear in 2 seconds!",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Could not schedule notification");
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

  // Get display values
  const getAppearanceLabel = () => {
    return APPEARANCE_OPTIONS.find(o => o.value === themeMode)?.label || 'Dark';
  };

  const getScopeLabel = () => {
    return SCOPE_OPTIONS.find(o => o.value === preferences.defaultScope)?.label || 'Local';
  };

  const getRadiusLabel = () => {
    return `${preferences.newsRadius} km`;
  };

  const getHomeLocationLabel = () => {
    return preferences.homeLocation?.name || 'Not set';
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading preferences...
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
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      {/* Display Preferences */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>DISPLAY</Text>
        <PreferenceSelector
          icon="moon-outline"
          iconColor={colors.info}
          title="Appearance"
          subtitle="App theme"
          value={getAppearanceLabel()}
          onPress={() => setAppearancePickerVisible(true)}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <SettingsItem
          icon="language-outline"
          title="Language"
          subtitle="English (Coming in Step 9)"
          disabled={true}
        />
      </View>

      {/* Location & News Preferences */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>NEWS FEED</Text>
        <PreferenceSelector
          icon="home-outline"
          iconColor={colors.primary}
          title="Home Location"
          subtitle="Your default city"
          value={getHomeLocationLabel()}
          onPress={() => setCityPickerVisible(true)}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <PreferenceSelector
          icon="radio-outline"
          iconColor={colors.warning}
          title="News Radius"
          subtitle="How far to show local news"
          value={getRadiusLabel()}
          onPress={() => setRadiusPickerVisible(true)}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <PreferenceSelector
          icon="globe-outline"
          iconColor={colors.success}
          title="Default Scope"
          subtitle="Initial news view"
          value={getScopeLabel()}
          onPress={() => setScopePickerVisible(true)}
        />
      </View>

      {/* Feedback Preferences */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>FEEDBACK</Text>
        <PreferenceToggle
          icon="volume-high-outline"
          iconColor="#FF6B6B"
          title="Sound Effects"
          subtitle="Button clicks and alerts"
          value={preferences.soundEnabled}
          onValueChange={updateSoundEnabled}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <PreferenceToggle
          icon="phone-portrait-outline"
          iconColor="#9B59B6"
          title="Vibration"
          subtitle="Haptic feedback"
          value={preferences.vibrationEnabled}
          onValueChange={updateVibrationEnabled}
        />
      </View>

      {/* Notifications - Step 7 */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>
        <SettingsItem
          icon="notifications-outline"
          iconColor={colors.info}
          title="Push Notifications"
          subtitle="Receive community safety alerts"
          showArrow={false}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <SettingsItem
          icon="paper-plane-outline"
          iconColor={colors.warning}
          title="Test Notification"
          subtitle="Send a test notification"
          onPress={handleTestNotification}
        />
      </View>

      {/* Privacy - Step 8 */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PRIVACY</Text>
        <SettingsItem
          icon="shield-checkmark-outline"
          iconColor={colors.success}
          title="Privacy Dashboard"
          subtitle="View your data & permissions"
          onPress={() => setPrivacyDashboardVisible(true)}
        />
      </View>

      {/* Help & Support */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>HELP & SUPPORT</Text>
        <SettingsItem
          icon="mail-outline"
          iconColor={colors.primary}
          title="Contact Support"
          subtitle="petrographics.adm@gmail.com"
          onPress={handleEmailSupport}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <SettingsItem
          icon="star-outline"
          iconColor="#FFD700"
          title="Rate App"
          subtitle="Love the app? Rate us!"
          onPress={handleRateApp}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <SettingsItem
          icon="share-social-outline"
          iconColor={colors.info}
          title="Share App"
          subtitle="Tell your friends about PSHAD iSentinel"
          onPress={handleShareApp}
        />
      </View>

      {/* Legal */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>LEGAL</Text>
        <SettingsItem
          icon="document-text-outline"
          title="Privacy Policy"
          onPress={() => setPrivacyModalVisible(true)}
        />
        <View style={[styles.itemDivider, { backgroundColor: colors.divider }]} />
        <SettingsItem
          icon="reader-outline"
          title="Terms of Service"
          onPress={() => setTermsModalVisible(true)}
        />
      </View>

      {/* About / Developer Credits */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ABOUT</Text>
        <View style={styles.creditsContainer}>
          <DeveloperCredits />
        </View>
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Version {APP.version}
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
        title="Privacy Policy"
        lastUpdated={PRIVACY_POLICY.lastUpdated}
        content={PRIVACY_POLICY.content}
      />

      <LegalModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        title="Terms of Service"
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
        title="Appearance"
        options={APPEARANCE_OPTIONS}
        selectedValue={themeMode}
        onSelect={handleAppearanceChange}
      />

      {/* Scope Picker */}
      <OptionPickerModal
        visible={scopePickerVisible}
        onClose={() => setScopePickerVisible(false)}
        title="Default Scope"
        options={SCOPE_OPTIONS}
        selectedValue={preferences.defaultScope}
        onSelect={updateDefaultScope}
      />

      {/* Radius Picker */}
      <OptionPickerModal
        visible={radiusPickerVisible}
        onClose={() => setRadiusPickerVisible(false)}
        title="News Radius"
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