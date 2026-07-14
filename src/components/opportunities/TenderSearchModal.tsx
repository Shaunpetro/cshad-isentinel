// src/components/opportunities/TenderSearchModal.tsx
// Beta 4 – Tender search modal with fuzzy matching and fake‑RFQ warning

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts';
import { Typography, Spacing, BorderRadius } from '@/config/theme';
import type { Opportunity } from '@/services/opportunities';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: Opportunity) => void;
  tenders: Opportunity[];
}

// Simple fuzzy matching: checks if all query words appear in the target string (case‑insensitive)
function fuzzyMatch(query: string, target: string): boolean {
  const words = query.trim().toLowerCase().split(/\s+/);
  const targetLower = target.toLowerCase();
  return words.every(word => targetLower.includes(word));
}

export function TenderSearchModal({ visible, onClose, onSelect, tenders }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim();
    // exact match first (source_id or title)
    const exact = tenders.filter(
      t => t.source_id === q || t.title.toLowerCase() === q.toLowerCase()
    );
    // fuzzy match on source_id, title, and tender_docs names
    const fuzzy = tenders.filter(t => {
      if (exact.includes(t)) return false;
      return (
        fuzzyMatch(q, t.source_id || '') ||
        fuzzyMatch(q, t.title) ||
        (t.tender_docs || []).some(doc => fuzzyMatch(q, doc.name))
      );
    });
    return [...exact, ...fuzzy];
  }, [query, tenders]);

  const handleSelect = (item: Opportunity) => {
    onSelect(item);
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Ionicons name="search" size={20} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
              placeholder="Search tender number or keywords"
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Results */}
          {query.trim() ? (
            results.length > 0 ? (
              <FlatList
                data={results.slice(0, 20)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.resultRow, { borderBottomColor: colors.divider }]}
                    onPress={() => handleSelect(item)}
                  >
                    <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={[styles.resultId, { color: colors.textSecondary }]}>
                        {item.source_id || 'No tender number'} • {item.company_name || 'Unknown'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 300 }}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View style={styles.noResults}>
                <Ionicons name="alert-circle-outline" size={40} color={colors.warning} />
                <Text style={[styles.noResultsTitle, { color: colors.text }]}>
                  We could not locate the tender you are searching for.
                </Text>
                <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                  We suggest contacting the entity directly for full verification, as some tenders are
                  not always advertised on public portals. Be aware of fake RFQs and tender requests.{'\n\n'}
                  For official verification, visit the CSD portal or the eTender portal.
                </Text>
              </View>
            )
          ) : (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={40} color={colors.textDisabled} />
              <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                Enter a tender number or keyword to search.
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Regular',
  },
  closeBtn: { padding: 4 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  resultTitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Medium',
    marginBottom: 2,
  },
  resultId: {
    fontSize: Typography.sizes.tiny,
    fontFamily: 'DMSans-Regular',
  },
  noResults: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  noResultsTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: Typography.sizes.caption,
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});