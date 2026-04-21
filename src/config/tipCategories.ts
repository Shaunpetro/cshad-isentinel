// v1.263_001/src/config/tipCategories.ts
/**
 * Tip category definitions and helpers
 * Used by CategorySelector component
 */

import type { TipCategory, NewsSeverity } from "@/types";

// ---- Category Groups ----

export const TIP_CATEGORY_GROUPS = [
  "Crime",
  "Suspicious Activity", 
  "Safety Hazard",
  "Infrastructure",
  "Community",
  "Other",
] as const;

export type TipCategoryGroup = (typeof TIP_CATEGORY_GROUPS)[number];

// ---- Category Definitions ----

export interface TipCategoryInfo {
  id: TipCategory;
  label: string;
  labelAf: string; // Afrikaans (Rule 8)
  labelZu: string; // isiZulu (Rule 8)
  group: TipCategoryGroup;
  icon: string;
  description: string;
}

export const TIP_CATEGORIES: TipCategoryInfo[] = [
  // Crime
  {
    id: "crime_in_progress",
    label: "Crime in Progress",
    labelAf: "Misdaad aan die gang",
    labelZu: "Ubugebengu obuqhubekayo",
    group: "Crime",
    icon: "🚨",
    description: "Active crime happening now",
  },
  
  // Suspicious Activity
  {
    id: "suspicious_activity",
    label: "Suspicious Activity",
    labelAf: "Verdagte aktiwiteit",
    labelZu: "Umsebenzi osolisayo",
    group: "Suspicious Activity",
    icon: "👁️",
    description: "Something that doesn't look right",
  },
  
  // Safety Hazard
  {
    id: "safety_hazard",
    label: "Safety Hazard",
    labelAf: "Veiligheidsgevaar",
    labelZu: "Ingozi yokuphepha",
    group: "Safety Hazard",
    icon: "⚠️",
    description: "Dangerous situation or condition",
  },
  
  // Infrastructure
  {
    id: "infrastructure",
    label: "Infrastructure Issue",
    labelAf: "Infrastruktuur probleem",
    labelZu: "Inkinga yengqalasizinda",
    group: "Infrastructure",
    icon: "🔧",
    description: "Power, water, roads, etc.",
  },
  
  // Community
  {
    id: "community_concern",
    label: "Community Concern",
    labelAf: "Gemeenskapsorg",
    labelZu: "Ukukhathazeka komphakathi",
    group: "Community",
    icon: "👥",
    description: "General community safety issue",
  },
  {
    id: "positive_report",
    label: "Positive Report",
    labelAf: "Positiewe verslag",
    labelZu: "Umbiko omuhle",
    group: "Community",
    icon: "👍",
    description: "Good news or resolved situation",
  },
  
  // Other
  {
    id: "other",
    label: "Other",
    labelAf: "Ander",
    labelZu: "Okunye",
    group: "Other",
    icon: "📋",
    description: "Something not listed above",
  },
];

// ---- Helper Functions ----

export const getCategoryById = (id: TipCategory): TipCategoryInfo | undefined =>
  TIP_CATEGORIES.find((cat) => cat.id === id);

export const getCategoriesByGroup = (group: TipCategoryGroup): TipCategoryInfo[] =>
  TIP_CATEGORIES.filter((cat) => cat.group === group);

export const getCategoryGroups = (): TipCategoryGroup[] => 
  [...new Set(TIP_CATEGORIES.map((cat) => cat.group))];

// ---- Severity Helpers ----

export interface SeverityInfo {
  id: NewsSeverity;
  label: string;
  labelAf: string;
  labelZu: string;
  description: string;
  color: string;
  icon: string;
}

export const SEVERITIES: SeverityInfo[] = [
  {
    id: "critical",
    label: "Critical",
    labelAf: "Kritiek",
    labelZu: "Okubucayi",
    description: "Immediate danger to life",
    color: "#FF4757",
    icon: "🔴",
  },
  {
    id: "high",
    label: "High",
    labelAf: "Hoog",
    labelZu: "Okuphezulu",
    description: "Serious, needs urgent attention",
    color: "#FFA726",
    icon: "🟠",
  },
  {
    id: "medium",
    label: "Medium",
    labelAf: "Medium",
    labelZu: "Okuphakathi",
    description: "Notable, should be addressed",
    color: "#42A5F5",
    icon: "🔵",
  },
  {
    id: "low",
    label: "Low",
    labelAf: "Laag",
    labelZu: "Okuphansi",
    description: "For awareness only",
    color: "#66BB6A",
    icon: "🟢",
  },
];

export const getSeverityById = (id: NewsSeverity): SeverityInfo | undefined =>
  SEVERITIES.find((sev) => sev.id === id);