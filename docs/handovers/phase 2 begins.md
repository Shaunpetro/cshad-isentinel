# CSHAD iSentinel News — Beta 4 Phase 3 Handover

**Date:** 6 July 2026  
**Purpose:** Complete replan of monetisation, content architecture, and Near Me Alerts. Single source of truth for the next build phase.

---

## 1. STRATEGIC SHIFT – WHY THIS REPLAN

After thorough stress‑testing of the initial freemium model, we identified critical gaps:

1. **Content mixing** – News, utility alerts, and sponsored content were combined, creating a noisy feed.
2. **Localisation inaccuracy** – International news was tagged as local due to source location, not content relevance.
3. **Weak monetisation** – A simple R25/mo subscription wasn't justified; users need tangible, quantified benefits.
4. **Missing engagement loops** – No reward system, no Waze‑style community reporting, no audio reader.

This replan fixes all four gaps and aligns the app with the original behavioural engine: **we sell belonging, safety, and status — not ads.**

---

## 2. REVISED MONETISATION ENGINE (Quantified Value)

| Feature | Free | Pro (R25/mo) | Quantified Benefit |
|---------|------|--------------|-------------------|
| **Tenders** | 36‑hour delay + blurred preview with countdown | Instant access | Secure contracts before free users even see them |
| **Audio Reader** | 15‑second sponsor ad before each article | Ad‑free listening | Save ~30 minutes/month for daily listeners |
| **Near Me Alerts** | Basic weather + 1‑hour delay on community reports | Real‑time weather, instant community alerts, 3‑day forecast + AI summary | Know about water outages, road closures, and load shedding before neighbours |
| **Ads** | Banner + interstitial ads | Ad‑free | Uninterrupted experience, faster load times |
| **Map** | Standard markers | Near Me overlay with live report voting | See what's happening on your route in real time |
| **Sponsored Content** | Visible | Hidden | Cleaner feed |

**Revenue pillars:**
- Display & Programmatic Advertising (AdMob)
- Jobs & Opportunities Marketplace (per‑listing fees, recruiter subscriptions)
- Events, Webinars & Live Journalism (ticketed events)
- Native & Sponsored Content (premium CPMs)

**Why R25 is justified:**
- A single tender won via early access can be worth thousands of rands.
- Avoiding one traffic jam or water outage saves time and money.
- The ad‑free experience alone is worth R25 for heavy users.

---

## 3. CONTENT ARCHITECTURE (Restructured)

### 3.1 Two Separate Content Streams

| Stream | What it contains | Screen |
|--------|-----------------|--------|
| **News Updates** | Crime, politics, community stories, national/international news | `app/(stack)/news.tsx` |
| **Near Me Alerts** | Weather, water outages, municipal updates, road closures, load shedding, community reports | `app/(stack)/safety.tsx` (replaced) |

### 3.2 News Screen Enhancements
- **WeatherCard** at the top: current conditions (city, temperature, icon).
- Tapping weather navigates to Near Me Alerts.
- No location updates mixed into the news feed.

### 3.3 Near Me Alerts Screen (Replaces Safety Hub)
- **Weather section:** Current conditions + 3‑day forecast + AI summary (generated daily per city).
- **User reports:** Waze‑style community reports (water, road, electricity, infrastructure).
- **Voting:** "Still there" / "Fixed" buttons on each report.
- **Submit report:** Anonymous, device‑ID tracked.
- **Real‑time updates:** Supabase Realtime subscription.

### 3.4 Map Integration
- Existing hazards and news markers remain.
- New **"Near Me" toggle** overlays local reports from the Near Me section.
- Tap a marker to see details and vote.

---

## 4. TECHNICAL ARCHITECTURE (Reliability & Low Lag)

### 4.1 Weather
- **Current conditions:** OpenWeatherMap `onecall` API, cached 10 minutes per city.
- **3‑day forecast:** Same API, cached daily per city.
- **AI Summary:** Supabase Edge Function calls an LLM once per day per city. Result cached; regenerated only if forecast changes significantly.

### 4.2 Local Reports (Waze‑style)
- **Submission:** Anonymous, stored in `local_reports` Supabase table.
- **Schema:** `id, category, description, latitude, longitude, location_name, reported_by (device ID), votes_confirm, votes_deny, created_at, expires_at`.
- **Voting:** Increments confirm/deny counters.
- **Auto‑expiry:** Edge Function runs hourly; reports with < 2 confirms after 12 hours are expired.
- **Real‑time:** Supabase Realtime subscription pushes new reports instantly.

### 4.3 Audio Reader
- **TTS:** `expo-speech` reads article body.
- **Pre‑roll ad:** Mocked with `assets/audio/sponsor.mp3` played via `expo-av`.
- **Pro users:** Skip ad entirely.
- **Future:** Replace with Google Ad Manager audio ad unit.

### 4.4 Ads (AdMob)
- **Banner:** Persistent bottom banner (hidden for Pro).
- **Interstitial:** After every 3rd article read (free users only).
- **Integration:** `react-native-google-mobile-ads` with test ad units initially.

### 4.5 Tender Blur & Countdown
- Backend sets `blurredUntil` on tender creation.
- Client checks `new Date() < blurredUntil`; shows blurred preview with countdown timer and "Upgrade to view now" button.

---

## 5. PHASED BUILD PLAN

| Phase | Description | Key Deliverables |
|-------|-------------|------------------|
| **3A – Foundation** | Types, services, hooks | Updated `NewsItem` type, `LocalReport` type, `localReports` service, `weather` service update, `useLocalAlerts` hook, `WeatherCard` component |
| **3B – Near Me Alerts Screen** | Replace Safety Hub | `LocalAlertCard`, `ReportIssueModal`, full Near Me screen with weather + reports |
| **3C – News Screen Weather Widget** | Compact weather at top | Integrate `WeatherCard` into news feed header |
| **3D – Map Near Me Toggle** | Overlay reports on map | Toggle + marker integration |
| **3E – Audio Reader** | TTS + pre‑roll ad | `AudioPlayer` component, article detail integration |
| **3F – AdMob Integration** | Banner + interstitials | `AdBanner`, interstitial triggers, link to subscription store |
| **3G – Tender Blur & Countdown** | Delayed access UI | Update `OpportunityDetailModal` with blur and countdown |

---

## 6. FILE PLAN (Phase 3A)

| File | Action |
|------|--------|
| `src/types/news.ts` | Add `ContentType`, `RelevanceScope`, `LocationUpdateCategory`, `LocalReport`, `blurredUntil` |
| `src/services/localReports.ts` | Create – Supabase CRUD for `local_reports` |
| `src/services/weather.ts` | Update – return current + 3‑day forecast |
| `src/hooks/useLocalAlerts.ts` | Create – unified hook (weather + local reports + realtime) |
| `src/components/news/WeatherCard.tsx` | Create – compact weather widget |

---

## 7. DATA TYPES (Final)

```ts
// src/types/news.ts (additions)

export type ContentType = 'news' | 'location_update' | 'sponsored';
export type RelevanceScope = 'local' | 'national' | 'international';
export type LocationUpdateCategory =
  | 'weather'
  | 'road'
  | 'water'
  | 'electricity'
  | 'infrastructure'
  | 'community';

export interface NewsItem {
  // ... existing fields ...
  contentType: ContentType;
  relevanceScope: RelevanceScope;
  blurredUntil?: string;               // ISO timestamp for tender delay
  locationUpdateCategory?: LocationUpdateCategory;
  reportCount?: number;                // for community reports
  verifiedCount?: number;
}

export interface LocalReport {
  id: string;
  category: LocationUpdateCategory;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  reportedBy: string;                  // default device ID
  votesConfirm: number;
  votesDeny: number;
  createdAt: string;
  expiresAt: string;
}
```

---

## 8. IMMEDIATE NEXT STEP

**Start Phase 3A with the first file: `src/types/news.ts`** — I'll provide the full updated content for approval. After that, we'll create `localReports` service, `weather` service update, `useLocalAlerts` hook, and `WeatherCard` component — all before touching any UI screen.

---

**Handover complete.** Ready to proceed with the first file.