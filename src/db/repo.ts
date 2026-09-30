import "server-only";
import { and, asc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { DEFAULT_SETTINGS, type AppSettings } from "@/lib/config";
import type { PeriodRef } from "@/lib/periods";
import type { Weekday } from "@/lib/time/calendar";
import type { EventInput, FocusInput, PlanInput, SettingsInput } from "@/lib/validate";
import { getDb } from "./index";
import { areaFocus, events, periodPlans, settings, type Event, type PeriodPlan, type PlanLevel } from "./schema";

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

/* Settings */

export function getSettings(): AppSettings {
  const row = getDb().select().from(settings).where(eq(settings.id, 1)).get();
  if (!row) return DEFAULT_SETTINGS;
  return { weekStart: row.weekStart as Weekday, timeZone: row.timeZone, capacity: row.capacity };
}

export function saveSettings(v: SettingsInput) {
  getDb().update(settings).set({ ...v, updatedAt: now() }).where(eq(settings.id, 1)).run();
}

/* Period plans */

export function getPlan(level: PlanLevel, key: string): PeriodPlan | null {
  return getDb().select().from(periodPlans).where(and(eq(periodPlans.level, level), eq(periodPlans.key, key))).get() ?? null;
}

export function getPlans(keys: string[]): Map<string, PeriodPlan> {
  if (!keys.length) return new Map();
  const rows = getDb().select().from(periodPlans).where(inArray(periodPlans.key, keys)).all();
  return new Map(rows.map((r) => [r.key, r]));
}

/** Years that have any plan, for the year selector. */
export function plannedYears(): number[] {
  const rows = getDb().selectDistinct({ year: periodPlans.year }).from(periodPlans).all();
  return rows.map((r) => r.year);
}

function ensurePlan(ref: PeriodRef): PeriodPlan {
  const existing = getPlan(ref.level, ref.key);
  if (existing) return existing;
  return getDb().insert(periodPlans).values({ ...ref }).returning().get();
}

export function savePlan(ref: PeriodRef, v: PlanInput): PeriodPlan {
  const plan = ensurePlan(ref);
  return getDb()
    .update(periodPlans)
    .set({ ...v, archivedAt: v.status === "archived" ? (plan.archivedAt ?? now()) : null, updatedAt: now() })
    .where(eq(periodPlans.id, plan.id))
    .returning()
    .get();
}

/* Area focus */

export function getFocus(planId: number | undefined) {
  if (!planId) return [];
  return getDb().select().from(areaFocus).where(eq(areaFocus.periodPlanId, planId)).all();
}

/** Replaces a period's area focus with the given rows (areas left empty have no focus). */
export function saveFocus(ref: PeriodRef, rows: FocusInput[]) {
  const db = getDb();
  const plan = ensurePlan(ref);
  db.transaction((tx) => {
    tx.delete(areaFocus).where(eq(areaFocus.periodPlanId, plan.id)).run();
    if (rows.length) tx.insert(areaFocus).values(rows.map((r) => ({ ...r, periodPlanId: plan.id }))).run();
  });
}

/* Events */

export interface EventOccurrence extends Event {
  /** The date it falls on in the requested range (differs from `date` for yearly events). */
  on: string;
}

/** Events that touch [from, to], with yearly events moved into the range. Archived events are left out. */
export function listEvents(from: string, to: string): EventOccurrence[] {
  const rows = getDb()
    .select()
    .from(events)
    .where(
      and(
        isNull(events.archivedAt),
        or(
          eq(events.yearly, true),
          and(lte(events.date, to), or(gte(events.date, from), gte(events.endDate, from))),
        ),
      ),
    )
    .orderBy(asc(events.date))
    .all();

  const out: EventOccurrence[] = [];
  const fromYear = Number(from.slice(0, 4));
  const toYear = Number(to.slice(0, 4));
  for (const e of rows) {
    if (!e.yearly) {
      out.push({ ...e, on: e.date < from ? from : e.date });
      continue;
    }
    for (let y = fromYear; y <= toYear; y++) {
      if (y < Number(e.date.slice(0, 4))) continue;
      const on = `${y}${e.date.slice(4)}`;
      if (on >= from && on <= to) out.push({ ...e, on });
    }
  }
  return out.sort((a, b) => a.on.localeCompare(b.on) || a.id - b.id);
}

export function addEvent(v: EventInput): Event {
  return getDb().insert(events).values(v).returning().get();
}

/** Archive instead of delete: the event leaves every page but stays in the backup. */
export function archiveEvent(id: number) {
  getDb().update(events).set({ archivedAt: now(), updatedAt: now() }).where(eq(events.id, id)).run();
}

/* Backup */

export function exportAll() {
  const db = getDb();
  return {
    app: "REEM LIFE OS",
    exportedAt: new Date().toISOString(),
    settings: db.select().from(settings).all(),
    periodPlans: db.select().from(periodPlans).all(),
    areaFocus: db.select().from(areaFocus).all(),
    events: db.select().from(events).all(),
  };
}
