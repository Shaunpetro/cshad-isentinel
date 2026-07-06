// src/components/local/LocalAlertCard.tsx
// Phase 3B – Card for a single Near Me alert with voting

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../ui/GlassCard';
import { useTheme } from '../../contexts';
import { voteReport } from '../../services/localReports';
import type { LocalReport } from '../../types/news';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  weather: 'cloud-outline',
  road: 'car-outline',
  water: 'water-outline',
  electricity: 'flash-outline',
  infrastructure: 'construct-outline',
  community: 'people-outline',
};

const CATEGORY_TINTS: Record<string, string> = {
  weather: 'blue',
  road: 'peach',
  water: 'blue',
  electricity: 'peach',
  infrastructure: 'peach',
  community: 'mint',
};

interface Props {
  report: LocalReport;
}

export default function LocalAlertCard({ report }: Props) {
  const theme = useTheme();
  const [votesConfirm, setVotesConfirm] = useState(report.votesConfirm);
  const [votesDeny, setVotesDeny] = useState(report.votesDeny);
  const [hasVoted, setHasVoted] = useState(false);

  const icon = CATEGORY_ICONS[report.category] || 'alert-circle-outline';
  const tint = (CATEGORY_TINTS[report.category] || 'lavender') as keyof typeof theme.pastel;

  const handleVote = async (type: 'confirm' | 'deny') => {
    if (hasVoted) return;
    setHasVoted(true);
    if (type === 'confirm') setVotesConfirm((v) => v + 1);
    else setVotesDeny((v) => v + 1);
    await voteReport(report.id, type);
  };

  return (
    <GlassCard style={styles.card} tint={theme.pastel[tint]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color={theme.colors.text} />
        <Text style={[styles.category, { color: theme.colors.text }]}>
          {report.category.toUpperCase()}
        </Text>
        <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
          {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <Text style={[styles.description, { color: theme.colors.text }]}>{report.description}</Text>
      <Text style={[styles.location, { color: theme.colors.textSecondary }]}>
        📍 {report.locationName}
      </Text>

      <View style={styles.voteRow}>
        <TouchableOpacity style={styles.voteButton} onPress={() => handleVote('confirm')} disabled={hasVoted}>
          <Ionicons name="checkmark-circle" size={18} color={hasVoted ? theme.colors.textDisabled : '#4CAF50'} />
          <Text style={[styles.voteCount, { color: theme.colors.textSecondary }]}>{votesConfirm}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.voteButton} onPress={() => handleVote('deny')} disabled={hasVoted}>
          <Ionicons name="close-circle" size={18} color={hasVoted ? theme.colors.textDisabled : '#FF4757'} />
          <Text style={[styles.voteCount, { color: theme.colors.textSecondary }]}>{votesDeny}</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  category: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, flex: 1 },
  time: { fontSize: 11 },
  description: { fontSize: 14, marginBottom: 6 },
  location: { fontSize: 12, marginBottom: 10 },
  voteRow: { flexDirection: 'row', gap: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  voteButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voteCount: { fontSize: 13 },
});