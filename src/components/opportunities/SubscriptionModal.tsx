// src/components/opportunities/SubscriptionModal.tsx
import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts';
import { Typography, Spacing, BorderRadius } from '@/config/theme';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}

const MOCK_PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 'R49',
    period: '/month',
    features: [
      'Full tender details',
      'Download all documents',
      'Unlimited access',
      'Cancel anytime',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 'R399',
    period: '/year',
    features: [
      'All Monthly benefits',
      'Save 32%',
      'Priority email alerts',
      'Early access to new features',
    ],
    highlighted: true,
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: Plan) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function SubscriptionModal({ visible, onClose, onSelectPlan }: Props) {
  const { colors, isDark } = useTheme();

  const blurIntensity = 90;
  const tint = isDark ? 'dark' : 'light';
  const glassBackground = isDark
    ? 'rgba(20, 20, 20, 0.92)'
    : 'rgba(255, 255, 255, 0.92)';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView intensity={blurIntensity} tint={tint} style={StyleSheet.absoluteFill} />
      </Pressable>

      <View style={styles.centeredContainer}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: glassBackground,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 15,
              elevation: 15,
            },
          ]}
        >
          {/* Drag handle */}
          <View style={styles.dragHandleArea}>
            <View style={[styles.dragHandle, { backgroundColor: colors.divider }]} />
          </View>

          {/* Close button */}
          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.surface + '80' }]}
            hitSlop={12}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>
              Upgrade to Premium
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Unlock full tender details, documents, and more.
            </Text>

            {MOCK_PLANS.map((plan) => (
              <Pressable
                key={plan.id}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: plan.highlighted ? colors.primary + '15' : colors.surface + '80',
                    borderColor: plan.highlighted ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => onSelectPlan(plan)}
              >
                <View style={styles.planHeader}>
                  <View>
                    <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.planPrice, { color: colors.primary }]}>{plan.price}</Text>
                      <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>{plan.period}</Text>
                    </View>
                  </View>
                  {plan.highlighted && (
                    <View style={[styles.bestValue, { backgroundColor: colors.primary }]}>
                      <Text style={styles.bestValueText}>BEST VALUE</Text>
                    </View>
                  )}
                </View>
                <View style={styles.featuresList}>
                  {plan.features.map((feature, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                      <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            ))}

            <Pressable
              style={[styles.closeBottom, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.closeBottomText, { color: colors.text }]}>Not Now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  card: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  dragHandleArea: {
    alignItems: 'center',
    paddingTop: 10,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.title,
    fontFamily: 'DMSans-Bold',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Regular',
    marginBottom: Spacing.lg,
  },
  planCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  planName: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  planPrice: {
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
  },
  planPeriod: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Regular',
  },
  bestValue: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
  },
  featuresList: {
    gap: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Regular',
  },
  closeBottom: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: Spacing.md,
  },
  closeBottomText: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Medium',
  },
});