import { DEFAULT_WEEK_START, type Weekday } from "./time/calendar";

/**
 * App-level settings. In Phase 1 these come from environment defaults;
 * from Phase 2 they are stored in the database and edited in /settings.
 */
export const appConfig = {
  timeZone: process.env.APP_TIMEZONE || "Asia/Riyadh",
  weekStart: DEFAULT_WEEK_START as Weekday,
  capacity: {
    activeAnnualGoals: 5,
    quarterObjectives: 5,
    activeProjects: 3,
    weeklyOutcomes: 5,
    optionalDaily: { GREEN: 7, YELLOW: 4, RED: 1 },
  },
};

export const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
