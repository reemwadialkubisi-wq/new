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

/* Quick Capture destinations (brought forward from Phase 3 at Reem's request, 30 Sep 2026). */

export const IDEA_STATUSES = ["inbox", "incubator", "kept", "done"] as const;

/** The one Idea Inbox. Ideas never become projects on their own. */
export const ideas = sqliteTable("ideas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  note: text("note").notNull().default(""),
  status: text("status", { enum: IDEA_STATUSES }).notNull().default("inbox"),
  area: text("area"),
  ...timestamps,
  archivedAt: text("archived_at"),
});

export const TASK_STATUSES = ["open", "done", "skipped", "moved", "paused"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Daily actions. Never "overdue": Phase 3 adds Skip / Move / Pause. */
export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    date: text("date"), // null = not planned for a day yet
    status: text("status", { enum: TASK_STATUSES }).notNull().default("open"),
    tier: text("tier", { enum: TIERS }).notNull().default("should"),
    area: text("area"),
    ...timestamps,
    archivedAt: text("archived_at"),
  },
  (t) => [index("tasks_date").on(t.date)],
);

export const OUTCOME_STATUSES = ["open", "achieved", "partly", "moved", "dropped"] as const;
export type OutcomeStatus = (typeof OUTCOME_STATUSES)[number];

/** Results for one week (at most `capacity.weeklyOutcomes`, 5 by default). */
export const weeklyOutcomes = sqliteTable(
  "weekly_outcomes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    weekStart: text("week_start").notNull(),
    title: text("title").notNull(),
    status: text("status", { enum: OUTCOME_STATUSES }).notNull().default("open"),
    area: text("area"),
    ...timestamps,
    archivedAt: text("archived_at"),
  },
  (t) => [index("weekly_outcomes_week").on(t.weekStart)],
);

export type Idea = typeof ideas.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type WeeklyOutcome = typeof weeklyOutcomes.$inferSelect;

/* Daily routine (Reem, 30 Sep 2026): her day from 5:00 to 22:00 as a checklist. Ticking an item
   records it (routine_checks), and that one tick feeds its weekly minimum and its cycle target,
   so nothing is logged twice. This is the Phase 0 Routine + Habit + HabitCheck in one place. */

export const routineItems = sqliteTable("routine_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  startTime: text("start_time").notNull(), // "HH:MM", 24-hour
  endTime: text("end_time"),
  area: text("area"),
  tier: text("tier", { enum: TIERS }).notNull().default("should"),
  /** Weekdays it appears on, as digits 0 (Sunday) … 6 (Saturday). */
  days: text("days").notNull().default("0123456"),
  /** e.g. English 3 × a week. Counted per planning week, never as a streak. */
  weeklyMinimum: integer("weekly_minimum"),
  /** e.g. Al-Baqarah: 90 readings between activeFrom and activeTo. */
  targetCount: integer("target_count"),
  activeFrom: text("active_from"),
  activeTo: text("active_to"),
  note: text("note").notNull().default(""),
  ...timestamps,
  archivedAt: text("archived_at"),
});

export const routineChecks = sqliteTable(
  "routine_checks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    itemId: integer("item_id").notNull().references(() => routineItems.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [uniqueIndex("routine_checks_item_date").on(t.itemId, t.date)],
);

export const ENERGIES = ["GREEN", "YELLOW", "RED"] as const;
export type EnergyLevel = (typeof ENERGIES)[number];

/** One row per day: the energy level chosen that morning. */
export const dayLogs = sqliteTable("day_logs", {
  date: text("date").primaryKey(),
  energy: text("energy", { enum: ENERGIES }),
  ...timestamps,
});

export type RoutineItem = typeof routineItems.$inferSelect;
