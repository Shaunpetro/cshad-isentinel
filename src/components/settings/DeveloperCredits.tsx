// src/components/settings/DeveloperCredits.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing } from '@/config/theme';
import { useTheme } from '@/contexts';

// Social links
const SOCIAL_LINKS = {
  whatsapp: 'https://wa.me/27813877744',
  linkedin: 'https://linkedin.com/in/petromalamule',
  email: 'mailto:petrographics.adm@gmail.com',
};

export function DeveloperCredits() {
  const { colors } = useTheme();

  const handleLinkPress = async (url: string, name: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${name}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${name}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* App Branding */}
      <View style={styles.section}>
        <Text style={[styles.appTitle, { color: colors.primary }]}>PSHAD iSentinel</Text>
        <Image
          source={require('../../../assets/brand/main-logo.png')}
          style={styles.mainLogo}
          resizeMode="contain"
        />
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* Developer */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Developed by</Text>
        <Text style={[styles.developerName, { color: colors.text }]}>Petro@ATG</Text>
        <Image
          source={require('../../../assets/brand/dev-logo.png')}
          style={styles.devLogo}
          resizeMode="contain"
        />

        {/* Social Links */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleLinkPress(SOCIAL_LINKS.whatsapp, 'WhatsApp')}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>

          <View style={[styles.socialDivider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleLinkPress(SOCIAL_LINKS.linkedin, 'LinkedIn')}
          >
            <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* Sponsor */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Sponsored & Powered By</Text>
        <Text style={[styles.sponsorName, { color: colors.text }]}>Shadrack Chabalala</Text>
        <Image
          source={require('../../../assets/brand/chabi.png')}
          style={styles.sponsorLogo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  section: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  divider: {
    width: '60%',
    height: 1,
    marginVertical: Spacing.md,
  },
  appTitle: {
    fontSize: Typography.sizes.title,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  mainLogo: {
    width: 120,
    height: 120,
  },
  sectionLabel: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    marginBottom: Spacing.xs,
  },
  developerName: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  devLogo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.sm,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  socialDivider: {
    width: 1,
    height: 24,
    marginHorizontal: Spacing.md,
  },
  sponsorName: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.medium,
    marginBottom: Spacing.sm,
  },
  sponsorLogo: {
    width: 100,
    height: 100,
  },
});