import { DEFAULT_WEEK_START, type Weekday } from "./time/calendar";
import type { Capacity } from "@/db/schema";

/** Defaults for a fresh database. The live values are stored in settings and edited in /settings. */
export const DEFAULT_CAPACITY: Capacity = {
  activeAnnualGoals: 5,
  quarterObjectives: 5,
  activeProjects: 3,
  weeklyOutcomes: 5,
  optionalDaily: { GREEN: 7, YELLOW: 4, RED: 1 },
};

export const DEFAULT_SETTINGS = {
  timeZone: process.env.APP_TIMEZONE || "Asia/Riyadh",
  weekStart: DEFAULT_WEEK_START as Weekday,
  capacity: DEFAULT_CAPACITY,
};

export type AppSettings = typeof DEFAULT_SETTINGS;

/** Most lists (priorities, outcomes) hold at most this many items. */
export const MAX_PRIORITIES = 5;

/** Optional sign-in. Locally the app runs without it (single user on her own Mac). */
export const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/**
 * The system starts with Q4 2026 (Reem, 30 Sep 2026): no earlier periods are shown or planned.
 * Earlier URLs redirect to the first period of their level.
 */
export const SYSTEM_START = { date: "2026-10-01", year: 2026, quarterKey: "2026-q4", monthKey: "2026-10" } as const;
