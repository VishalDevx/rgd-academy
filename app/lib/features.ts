import { db } from "@/lib/prisma";

export type FeatureKey =
  | "library"
  | "transport"
  | "hostel"
  | "events"
  | "advancedReports"
  | "mobileApps"
  | "aiAnalytics"
  | "gamification"
  | "multiCampus"
  | "multiLanguage";

const defaultTierMatrix: Record<string, FeatureKey[]> = {
  BASIC: ["events"],
  PRO: ["library", "transport", "hostel", "events", "advancedReports", "mobileApps"],
  ENTERPRISE: [
    "library",
    "transport",
    "hostel",
    "events",
    "advancedReports",
    "mobileApps",
    "aiAnalytics",
    "gamification",
    "multiCampus",
    "multiLanguage",
  ],
};

export async function getSchoolSettings() {
  // For now we assume single-tenant; extend to multi-tenant later
  const settings = await db.schoolSettings.findFirst();
  return settings;
}

export async function isFeatureEnabled(feature: FeatureKey) {
  const settings = await getSchoolSettings();
  const tier = settings?.tier ?? "BASIC";
  const overrides = (settings?.featureFlags as any)?.overrides as FeatureKey[] | undefined;
  if (overrides && overrides.includes(feature)) return true;
  const allowed = defaultTierMatrix[tier] ?? [];
  return allowed.includes(feature);
}


