import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Local SQLite schema (data/reem.db on Reem's Mac). Tables are added phase by phase,
 * following the Phase 0 data model. Dates are ISO strings "YYYY-MM-DD".
 */

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
};

/** One row (id = 1): calendar and Anti-Overload settings. */
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  weekStart: integer("week_start").notNull().default(6), // 0 = Sunday … 6 = Saturday
  timeZone: text("time_zone").notNull().default("Asia/Riyadh"),
  capacity: text("capacity", { mode: "json" }).$type<Capacity>().notNull(),
  ...timestamps,
});

export interface Capacity {
  activeAnnualGoals: number;
  quarterObjectives: number;
  activeProjects: number;
  weeklyOutcomes: number;
  optionalDaily: { GREEN: number; YELLOW: number; RED: number };
}

export const PLAN_LEVELS = ["year", "quarter", "month"] as const; // week and day arrive in Phase 3
export type PlanLevel = (typeof PLAN_LEVELS)[number];
export const PLAN_STATUSES = ["planning", "active", "closed", "archived"] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

/** One table for every time level (Phase 0 §5.1): the plan for a year, quarter or month. */
export const periodPlans = sqliteTable(
  "period_plans",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    level: text("level", { enum: PLAN_LEVELS }).notNull(),
    /** "2026", "2026-q4", "2026-10": the same keys the URLs use. */
    key: text("key").notNull(),
    year: integer("year").notNull(),
    quarter: integer("quarter"),
    month: integer("month"), // 1–12
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    theme: text("theme").notNull().default(""),
    /** Vision (year) or intention (quarter, month). */
    intention: text("intention").notNull().default(""),
    /** Year: top priorities · Quarter: priorities · Month: top outcomes. At most 5. */
    priorities: text("priorities", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    status: text("status", { enum: PLAN_STATUSES }).notNull().default("planning"),
    ...timestamps,
    archivedAt: text("archived_at"),
  },
  (t) => [uniqueIndex("period_plans_key").on(t.key)],
);

export const TIERS = ["must", "should", "could"] as const;
export type Tier = (typeof TIERS)[number];

/** Which life areas lead a period, and how (replaces separate Health/Family/… focus fields). */
export const areaFocus = sqliteTable(
  "area_focus",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    periodPlanId: integer("period_plan_id").notNull().references(() => periodPlans.id, { onDelete: "cascade" }),
    area: text("area").notNull(), // LIFE_AREAS slug
    focus: text("focus").notNull(),
    tier: text("tier", { enum: TIERS }).notNull().default("should"),
    ...timestamps,
  },
  (t) => [uniqueIndex("area_focus_plan_area").on(t.periodPlanId, t.area)],
);

export const EVENT_KINDS = ["important_date", "deadline", "travel", "appointment"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

/** Appointments, important dates, deadlines and travel: one entity, shown on the time pages. */
export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    kind: text("kind", { enum: EVENT_KINDS }).notNull().default("important_date"),
    date: text("date").notNull(),
    endDate: text("end_date"),
    startTime: text("start_time"),
    endTime: text("end_time"),
    /** Yearly events (birthdays, anniversaries) repeat on the same day every year. */
    yearly: integer("yearly", { mode: "boolean" }).notNull().default(false),
    area: text("area"),
    note: text("note").notNull().default(""),
    ...timestamps,
    archivedAt: text("archived_at"),
  },
  (t) => [index("events_date").on(t.date)],
);

export type PeriodPlan = typeof periodPlans.$inferSelect;
export type AreaFocus = typeof areaFocus.$inferSelect;
export type Event = typeof events.$inferSelect;
