// app/(stack)/incidents.tsx
// Beta 4 – Incidents feed: local hazards, near‑me reports, and localised water/electricity/weather news

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts";
import { useLocationContext } from "@/contexts/LocationContext";
import { useLocalAlerts } from "@/hooks/useLocalAlerts";
import { useNews } from "@/hooks/useNews";
import { Typography, Spacing, Shadows, BorderRadius } from "@/config/theme";
import { HazardReportModal } from "@/components/hub/HazardReportModal";
import {
  fetchHazards,
  voteHazardCleared,
  voteHazardStillThere,
} from "@/services/map/mapService";
import type { MapMarker } from "@/services/map";
import type { NewsItem } from "@/types";

// ---------- shared types ----------
interface IncidentItem {
  id: string;
  title: string;
  description: string;
  type: 'hazard' | 'nearme';
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  locationName: string;
  timestamp: string;
  latitude: number;
  longitude: number;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  crime: 'warning',
  accident: 'car',
  fire: 'flame',
  weather: 'cloud',
  infrastructure: 'construct',
  road: 'car-sport',
  water: 'water',
  electricity: 'flash',
  community: 'people',
  other: 'alert-circle',
  burst_pipe: 'water',
  pothole: 'alert-circle',
  power_line: 'flash',
  road_closure: 'close-circle',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#FF1744',
  high: '#FF5722',
  medium: '#FFC107',
  low: '#4CAF50',
};

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

// ---------- component ----------
export default function IncidentsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const {
    currentCity,
    deviceLocation,
    permissionStatus,
    requestPermission,
  } = useLocationContext();
  const { alerts: nearMeReports, refresh: refreshNearMe } = useLocalAlerts();
  const [hazardMarkers, setHazardMarkers] = useState<MapMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hazardModalVisible, setHazardModalVisible] = useState(false);

  // --- localised news for water/electricity/weather ---
  const cityName = currentCity?.name || '';
  const newsCategories = ['water', 'electricity', 'weather', 'infrastructure'];
  const { news: localNews } = useNews({
    scope: 'local',
    latitude: currentCity?.latitude,
    longitude: currentCity?.longitude,
    cityName: cityName,
    radiusKm: 25,
    limit: 10,
    realtime: false,
    autoRefresh: false,
  });
  const filteredNews = localNews
    .filter(article => newsCategories.includes(article.category))
    .slice(0, 5);

  // --- load hazards ---
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const data = await fetchHazards();
      if (data) {
        const cityNameLower = currentCity?.name?.toLowerCase() || '';
        let filtered = data.map((h: any) => ({
          id: h.id,
          latitude: h.latitude,
          longitude: h.longitude,
          title: h.category.replace('_', ' ').toUpperCase(),
          description: h.description,
          type: 'hazard' as const,
          severity: (h.severity as MapMarker['severity']) || 'medium',
          timestamp: h.created_at,
          matchedLocation: h.location_name || 'Unknown',
          confidence: 'exact' as const,
          category: h.category || 'other',
        }));
        if (cityNameLower) {
          filtered = filtered.filter(
            (h) => h.matchedLocation?.toLowerCase().includes(cityNameLower) || !h.matchedLocation
          );
        }
        setHazardMarkers(filtered);
      }
    } catch (err) {
      console.error('[Incidents]', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentCity]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      refreshNearMe();
    }, [loadData, refreshNearMe])
  );

  // --- build incident lists ---
  const cityNameLower = currentCity?.name?.toLowerCase() || '';
  const localIncidents: IncidentItem[] = nearMeReports
    .filter((r) => cityNameLower ? r.locationName?.toLowerCase().includes(cityNameLower) || !r.locationName : true)
    .map((r) => ({
      id: r.id,
      title: r.description,
      description: r.description,
      type: 'nearme' as const,
      category: r.category,
      severity: 'medium' as const,
      locationName: r.locationName,
      timestamp: r.createdAt,
      latitude: r.latitude,
      longitude: r.longitude,
    }));

  const hazardIncidents: IncidentItem[] = hazardMarkers.map((h) => ({
    id: h.id,
    title: h.title,
    description: h.description || '',
    type: 'hazard' as const,
    category: h.category,
    severity: h.severity,
    locationName: h.matchedLocation,
    timestamp: h.timestamp,
    latitude: h.latitude,
    longitude: h.longitude,
  }));

  const allIncidents = [...localIncidents, ...hazardIncidents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleVoteCleared = async (id: string) => {
    await voteHazardCleared(id);
    loadData(true);
  };

  const handleVoteStillThere = async (id: string) => {
    await voteHazardStillThere(id);
    loadData(true);
  };

  const handleRequestPermission = async () => {
    await requestPermission();
    loadData(true);
  };

  const handleArticlePress = (article: NewsItem) => {
    router.push({ pathname: '/(stack)/article/[id]', params: { id: article.id } });
  };

  // --- render helpers ---
  const renderNewsCard = ({ item }: { item: NewsItem }) => {
    const iconName = CATEGORY_ICONS[item.category] || 'alert-circle';
    return (
      <TouchableOpacity
        style={[styles.newsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleArticlePress(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.newsIconBox, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={iconName} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.newsMeta, { color: colors.textSecondary }]}>
            {item.source} · {formatTimeAgo(item.publishedAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderIncidentItem = ({ item }: { item: IncidentItem }) => {
    const iconName = CATEGORY_ICONS[item.category] || 'alert-circle';
    const severityColor = SEVERITY_COLORS[item.severity] || '#4CAF50';

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: item.type === 'hazard' ? '#FF6D00' + '20' : '#00D4AA' + '20' }]}>
            <Ionicons name={iconName} size={22} color={item.type === 'hazard' ? '#FF6D00' : '#00D4AA'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
              <Text style={[styles.severityText, { color: severityColor }]}>
                {item.severity.toUpperCase()}
              </Text>
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                📍 {item.locationName}
              </Text>
            </View>
          </View>
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
            {formatTimeAgo(item.timestamp)}
          </Text>
        </View>

        {item.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        {item.type === 'hazard' && (
          <View style={[styles.voteRow, { borderTopColor: colors.divider }]}>
            <TouchableOpacity style={styles.voteButton} onPress={() => handleVoteCleared(item.id)}>
              <Ionicons name="close-circle" size={18} color="#FF1744" />
              <Text style={[styles.voteText, { color: '#FF1744' }]}>Cleared</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.voteButton} onPress={() => handleVoteStillThere(item.id)}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <Text style={[styles.voteText, { color: '#4CAF50' }]}>Still there</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // --- list header ---
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Local Incidents</Text>
          <Text style={[styles.citySubtitle, { color: colors.textSecondary }]}>
            {permissionStatus === 'granted' ? cityName : 'Enable location to see nearby incidents'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.reportButton, { backgroundColor: colors.primary }]}
          onPress={() => setHazardModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.reportButtonText}>+ Report</Text>
        </TouchableOpacity>
      </View>
      {permissionStatus !== 'granted' && (
        <TouchableOpacity
          style={[styles.permissionPrompt, { backgroundColor: colors.primary + '15' }]}
          onPress={handleRequestPermission}
        >
          <Ionicons name="navigate-outline" size={18} color={colors.primary} />
          <Text style={[styles.permissionPromptText, { color: colors.primary }]}>
            Tap to enable location for local incidents
          </Text>
        </TouchableOpacity>
      )}

      {/* Local news section */}
      {filteredNews.length > 0 && (
        <View style={styles.newsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Local Updates</Text>
          {filteredNews.map((article) => (
            <React.Fragment key={article.id}>{renderNewsCard({ item: article })}</React.Fragment>
          ))}
        </View>
      )}
    </View>
  );

  const combinedData = [
    ...filteredNews.map(a => ({ type: 'news', data: a })),
    ...allIncidents.map(i => ({ type: 'incident', data: i })),
  ];

  if (isLoading && allIncidents.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={combinedData}
        renderItem={({ item }) => {
          if (item.type === 'news') return renderNewsCard({ item: item.data as NewsItem });
          return renderIncidentItem({ item: item.data as IncidentItem });
        }}
        keyExtractor={(item) => item.data.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={64} color={colors.success} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>All Clear</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              No incidents reported in {cityName}.{'\n'}Tap "+ Report" if you notice something.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadData(true)}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={allIncidents.length === 0 ? { flexGrow: 1 } : { paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      <HazardReportModal
        visible={hazardModalVisible}
        onClose={() => setHazardModalVisible(false)}
        onReported={() => { loadData(true); }}
        currentLocation={deviceLocation ? { latitude: deviceLocation.latitude, longitude: deviceLocation.longitude } : undefined}
      />
    </View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSection: { padding: Spacing.md, paddingTop: Spacing.lg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: {
    fontSize: Typography.sizes.heading,
    fontFamily: Typography.fonts.bold,
    marginBottom: 2,
  },
  citySubtitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.label,
    fontFamily: Typography.fonts.bold,
  },
  permissionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  permissionPromptText: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
    flex: 1,
  },
  // news cards
  newsSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: Spacing.sm,
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  newsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsTitle: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.medium,
    marginBottom: 2,
  },
  newsMeta: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  // incident cards
  card: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bold,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
  },
  locationText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  timeAgo: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.regular,
  },
  description: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    lineHeight: 20,
    marginTop: Spacing.sm,
  },
  voteRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  voteText: {
    fontSize: Typography.sizes.tiny,
    fontFamily: Typography.fonts.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.title,
    fontFamily: Typography.fonts.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: Typography.sizes.caption,
    fontFamily: Typography.fonts.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
});