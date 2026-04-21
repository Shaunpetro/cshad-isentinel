# PSHAD iSentinel 🛡️

**Privacy-first community safety app for South Africa**

Built with React Native (Expo), Supabase, and TypeScript.

---

## 🚀 Features

### Core Functionality
- **📰 News Feed** - Live RSS aggregation from 145+ SA news sources
- **🗺️ Interactive Map** - News and tips with location markers
- **📝 Anonymous Tips** - Privacy-first community reporting
- **🚨 Safety Hub** - Real-time alerts, weather, and load shedding
- **⚙️ Settings** - Theme, location, and notification preferences

### Safety Hub Features
- 🌦️ Weather alerts (OpenWeatherMap integration)
- ⚡ Load shedding status (Eskom API - national & local schedules)
- 🔴 National breaking news banner
- 📍 Location-based filtering
- 🔔 Customizable notifications

### Privacy Features
- Anonymous tip submission (no user tracking)
- Privacy dashboard with data controls
- Location permissions with clear explanations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 52 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based) |
| Backend | Supabase (Database, Auth, Realtime, Edge Functions) |
| State | React Context + Custom Hooks |
| Styling | StyleSheet + Custom Theme System |
| Maps | react-native-maps |

---

## 📁 Project Structure
pshad/
├── app/ # Expo Router screens
│ ├── (tabs)/ # Tab navigation
│ │ ├── index.tsx # News Feed
│ │ ├── map.tsx # Safety Map
│ │ ├── tip.tsx # Report/Tip
│ │ ├── alerts.tsx # Safety Hub
│ │ └── settings.tsx # Settings
│ └── news/[id].tsx # Article detail
├── src/
│ ├── components/ # UI components
│ │ ├── hub/ # Safety Hub components
│ │ ├── news/ # News components
│ │ ├── tips/ # Tip components
│ │ └── ui/ # Shared UI
│ ├── services/ # API services
│ │ ├── weather/ # OpenWeatherMap
│ │ ├── infrastructure/ # Eskom load shedding
│ │ ├── hub/ # Safety Hub service
│ │ ├── news/ # News service
│ │ └── supabase/ # Supabase config
│ ├── hooks/ # Custom React hooks
│ ├── contexts/ # React contexts
│ └── config/ # Constants & theme
├── assets/ # Images, fonts, icons
├── docs/ # Documentation
└── scripts/ # Build scripts


---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- Supabase account

### Dev Run on Android
# Set JAVA_HOME (Windows)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Build and run
npx expo run:android

📊 Version History
See CHANGELOG.md for detailed release notes.

Version	Date	Highlights
1.267.0	Apr 2026	Safety Hub with Weather & Load Shedding
1.265.3	Apr 2026	Map Enhancement & Hub UI
1.263.0	Apr 2026	RSS System & Location Filtering
1.0.0	Mar 2026	Initial Release
🤝 Contributing
This is a private project by ATG Development.

📄 License
Proprietary - All rights reserved.

👨‍💻 Developer
ATG Development
South Africa
2026

text

---

### Step 2: Create `CHANGELOG.md`

```powershell
New-Item -Path "CHANGELOG.md" -ItemType File
Paste this content:

markdown
# Changelog

All notable changes to PSHAD iSentinel will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.267.0] - 2026-04-17

### Added
- **Safety Hub** - Complete redesign of Alerts tab
  - Weather integration (OpenWeatherMap FREE API)
  - Load shedding status (Eskom FREE API)
  - Hybrid local/national load shedding schedules
  - Suburb search for personalized schedules
  - National breaking news banner (dismissible)
  - New filters: Tips, Live, Weather, Infrastructure, National, All
  - Smart default filter (Tips → Live → All)

- **Weather Service** (`src/services/weather/`)
  - Current weather display
  - Severe weather alerts
  - 24-hour forecast

- **Infrastructure Service** (`src/services/infrastructure/`)
  - Eskom load shedding API integration
  - Suburb search functionality
  - Local schedule support
  - Water/roads/telecom alert parsing from news

- **New Components**
  - `WeatherAlertCard` - Weather display
  - `NationalBreakingBanner` - Dismissible alerts
  - `InfrastructureCard` - Load shedding display

### Changed
- `app/(tabs)/alerts.tsx` - Complete redesign
- `src/components/hub/FeedCard.tsx` - Extended types
- `src/components/hub/HubFilterBar.tsx` - New filters
- `src/hooks/useHub.ts` - Full rewrite

### Fixed
- Router push type error
- 0 TypeScript errors

---

## [1.265.3] - 2026-04-17

### Added
- Map geocoding system
- Smart zoom based on markers
- City alias matching
- Safety Hub UI components (initial)

---

## [1.263.0] - 2026-04-16

### Added
- RSS Feed System (145 feeds)
- Location filtering
- Privacy Dashboard
- Settings preferences
- Anonymous tip submission

### Fixed
- Supabase Realtime subscription error

---

## [1.0.0] - 2026-03-01

### Added
- Initial project setup
- Expo Router navigation
- News Feed
- Interactive Map
- Supabase integration
- Theme support (dark/light/system)

