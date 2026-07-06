Here’s the full handover for Beta 4 Phase 3B, covering the strategic replan, every file changed, and the path to Phase 3C. The build is running in parallel, so we won’t lose time.

---

# CSHAD iSentinel News — Beta 4 Phase 3B Handover

**Date:** 6 July 2026  
**Purpose:** Complete record of the monetisation & content architecture replan and the implementation of Phase 3A–3B.

---

## 1. PROJECT STATE

| Field | Value |
|-------|-------|
| App Name | CSHAD iSentinel News |
| Package | `cshad.isentinel.news` |
| Version | `2.2606.01` (versionCode 9) |
| Branch | `beta4` |
| EAS Testing | shaunpetro / `41d9d284-...` |
| EAS Production | shaunatg-2 / `ce9ad511-...` |
| TypeScript | `tsc --noEmit` passes — 0 errors |
| Latest tag | `v1.0.125-beta` (building) |

---

## 2. STRATEGIC REPLAN (Why We Changed Course)

Stress‑testing the initial freemium model revealed four critical gaps:

| Gap | Solution |
|-----|----------|
| Content mixing (news vs utility alerts) | Two separate streams: **News Updates** & **Near Me Alerts** |
| Irrelevant localisation (Angola/Ebola in JHB feed) | `relevanceScope` field + client‑side filtering |
| Weak monetisation (R25 not justified) | Quantified value: tender early access, ad‑free audio, hyperlocal alerts |
| Missing engagement loops | Waze‑style reporting + voting, audio reader, rewards over force |

### Revised Monetisation Tiers

| Feature | Free | Pro (R25/mo) |
|---------|------|--------------|
| Tenders | 36‑hour delay + blurred preview | Instant access |
| Audio Reader | 15‑sec sponsor ad | Ad‑free |
| Near Me Alerts | Basic weather + 1‑hour delay | Real‑time + 3‑day forecast + AI summary |
| Ads | Banner + interstitial | Ad‑free |
| Map | Standard markers | Near Me overlay + live voting |
| Sponsored Content | Visible | Hidden |

---

## 3. PHASE 3A — FOUNDATION (Types, Services, Hooks)

### Files Created / Updated

**`src/types/news.ts`** — Added `ContentType`, `RelevanceScope`, `LocationUpdateCategory`, `LocalReport`, `blurredUntil`.

**`src/services/weather.ts`** — Extended with legacy exports (`fetchWeatherData`, `WeatherAlert`, `CurrentWeather`, `WeatherData`) for Hub compatibility, plus new `fetchWeatherAlerts` and `fetchWeatherForecast`.

**`src/services/localReports.ts`** — CRUD operations for `local_reports` Supabase table (fetch by city, submit, vote).

**`src/hooks/useLocalAlerts.ts`** — Unified hook combining weather API + local reports with polling (5 min) and Supabase Realtime subscription.

**`src/components/news/WeatherCard.tsx`** — Compact weather widget (current city, temp, icon), navigates to Near Me Alerts.

---

## 4. PHASE 3B — NEAR ME ALERTS (Replaces Safety Hub)

### Files Created

**`src/components/local/LocalAlertCard.tsx`**  
- Displays a single local report with category icon, description, location, and vote buttons.
- Uses pastel tints per category.
- One‑time voting (confirm/deny).

**`src/components/local/ReportIssueModal.tsx`**  
- Bottom‑sheet modal for submitting new reports.
- Category selector (road, water, electricity, infrastructure, community).
- Anonymous submission with device‑ID tracking.

### Files Replaced

**`app/(stack)/safety.tsx`** → Now the **Near Me Alerts** screen.  
- Header with “Report” button.
- FlatList of `LocalAlertCard` items.
- Pull‑to‑refresh, empty state.
- Opens `ReportIssueModal`.

---

## 5. LEGACY FIXES

- **`src/components/hub/WeatherAlertCard.tsx`** — Aligned with updated `WeatherAlert`/`CurrentWeather` types (removed `type`, `title`, `temperature`, `windSpeed`, fixed `getWeatherIconUrl` call).
- **`src/services/hub/hubService.ts`** — Updated `weatherAlertsToFeedItems` to use `description` instead of `title`, removed `sender` and `areas`, changed `fetchWeatherData` call to object parameter.

---

## 6. CURRENT FILE INVENTORY (Phase 3A–3B)

```
New files:
  src/types/news.ts
  src/services/localReports.ts
  src/components/news/WeatherCard.tsx
  src/components/local/LocalAlertCard.tsx
  src/components/local/ReportIssueModal.tsx

Updated files:
  src/services/weather.ts
  src/hooks/useLocalAlerts.ts
  app/(stack)/safety.tsx (replaced)
  src/components/hub/WeatherAlertCard.tsx
  src/services/hub/hubService.ts
```

---

## 7. PHASE 3C PLAN — NEWS SCREEN WEATHER WIDGET

**Goal:** Integrate the `WeatherCard` component into the top of the News screen, giving users immediate weather context and a link to Near Me Alerts.

**File to modify:** `app/(stack)/news.tsx`  
- Add `WeatherCard` to the `ListHeaderComponent`, above the existing location header.
- The card will auto‑fetch weather for the user’s current city (using `useLocation` and `fetchWeatherData`).
- Tapping the card navigates to the Near Me Alerts screen.

**New hook or logic:** We can add a lightweight `useCurrentWeather` hook that fetches current weather for the city and returns the data needed by `WeatherCard`. This keeps the news screen clean.

---

## 8. NEXT ACTIONS

1. **Confirm Phase 3C start** — I’ll produce the `useCurrentWeather` hook and the updated `news.tsx`.
2. **After `v1.0.125-beta` build completes** — we’ll review the APK, note any issues, and fix them before moving to Phase 3D (Map Near Me toggle).

---

**Handover complete.** Ready to start Phase 3C — just say “Start Phase 3C” and I’ll give you the files.