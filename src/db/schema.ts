import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Phase 1 schema: app settings only. The Phase 0 data model (PeriodPlan, Goal, Project, …)
 * is added phase by phase, each with its own migration.
 */
export const appSettings = pgTable("app_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(),
  weekStart: integer("week_start").notNull().default(6), // 6 = Saturday
  timeZone: text("time_zone").notNull().default("Asia/Riyadh"),
  capacity: jsonb("capacity").notNull().default({
    activeAnnualGoals: 5, quarterObjectives: 5, activeProjects: 3, weeklyOutcomes: 5,
    optionalDaily: { GREEN: 7, YELLOW: 4, RED: 1 },
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
