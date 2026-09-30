import "server-only";
import { and, asc, count, desc, eq, gte, inArray, isNull, lt, lte, or } from "drizzle-orm";
import { DEFAULT_SETTINGS, type AppSettings } from "@/lib/config";
import type { PeriodRef } from "@/lib/periods";
import type { Weekday } from "@/lib/time/calendar";
import type { EventInput, FocusInput, PlanInput, RoutineInput, SettingsInput } from "@/lib/validate";
import { getDb } from "./index";
import {
  areaFocus, dayLogs, events, ideas, periodPlans, routineChecks, routineItems, settings, tasks, weeklyOutcomes,
  type EnergyLevel, type Event, type RoutineItem, type OutcomeStatus, type PeriodPlan, type PlanLevel, type TaskStatus,
} from "./schema";

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

/* Ideas (the one Idea Inbox) */

export function addIdea(v: { title: string; note: string }) {
  return getDb().insert(ideas).values(v).returning().get();
}

export function listIdeas() {
  return getDb().select().from(ideas).where(isNull(ideas.archivedAt)).orderBy(desc(ideas.createdAt), desc(ideas.id)).all();
}

export function archiveIdea(id: number) {
  getDb().update(ideas).set({ archivedAt: now(), updatedAt: now() }).where(eq(ideas.id, id)).run();
}

/* Tasks */

export function addTask(v: { title: string; date: string | null }) {
  return getDb().insert(tasks).values(v).returning().get();
}

/** Tasks for one day, plus the ones with no day yet and earlier ones still open (never called "overdue"). */
export function tasksForDay(day: string) {
  const rows = getDb()
    .select()
    .from(tasks)
    .where(and(isNull(tasks.archivedAt), or(eq(tasks.date, day), isNull(tasks.date), and(lt(tasks.date, day), eq(tasks.status, "open")))))
    .orderBy(asc(tasks.date), asc(tasks.id))
    .all();
  return {
    today: rows.filter((t) => t.date === day),
    undated: rows.filter((t) => t.date === null),
    earlier: rows.filter((t) => t.date !== null && t.date < day),
  };
}

export function tasksBetween(from: string, to: string) {
  return getDb()
    .select()
    .from(tasks)
    .where(and(isNull(tasks.archivedAt), gte(tasks.date, from), lte(tasks.date, to)))
    .orderBy(asc(tasks.date), asc(tasks.id))
    .all();
}

export function setTaskStatus(id: number, status: TaskStatus) {
  getDb().update(tasks).set({ status, updatedAt: now() }).where(eq(tasks.id, id)).run();
}

export function archiveTask(id: number) {
  getDb().update(tasks).set({ archivedAt: now(), updatedAt: now() }).where(eq(tasks.id, id)).run();
}

/* Weekly outcomes */

export function addOutcome(v: { weekStart: string; title: string }) {
  return getDb().insert(weeklyOutcomes).values(v).returning().get();
}

export function listOutcomes(weekStart: string) {
  return getDb()
    .select()
    .from(weeklyOutcomes)
    .where(and(eq(weeklyOutcomes.weekStart, weekStart), isNull(weeklyOutcomes.archivedAt)))
    .orderBy(asc(weeklyOutcomes.id))
    .all();
}

export function setOutcomeStatus(id: number, status: OutcomeStatus) {
  getDb().update(weeklyOutcomes).set({ status, updatedAt: now() }).where(eq(weeklyOutcomes.id, id)).run();
}

export function archiveOutcome(id: number) {
  getDb().update(weeklyOutcomes).set({ archivedAt: now(), updatedAt: now() }).where(eq(weeklyOutcomes.id, id)).run();
}

/* Daily routine */

export function listRoutine(): RoutineItem[] {
  return getDb().select().from(routineItems).where(isNull(routineItems.archivedAt)).orderBy(asc(routineItems.startTime), asc(routineItems.id)).all();
}

export function saveRoutineItem(id: number | null, v: RoutineInput) {
  const db = getDb();
  if (id) db.update(routineItems).set({ ...v, updatedAt: now() }).where(eq(routineItems.id, id)).run();
  else db.insert(routineItems).values(v).run();
}

export function archiveRoutineItem(id: number) {
  getDb().update(routineItems).set({ archivedAt: now(), updatedAt: now() }).where(eq(routineItems.id, id)).run();
}

export function setRoutineCheck(itemId: number, date: string, done: boolean) {
  const db = getDb();
  if (done) db.insert(routineChecks).values({ itemId, date }).onConflictDoNothing().run();
  else db.delete(routineChecks).where(and(eq(routineChecks.itemId, itemId), eq(routineChecks.date, date))).run();
}

function checksBetween(itemId: number, from: string, to: string) {
  return getDb()
    .select({ n: count() })
    .from(routineChecks)
    .where(and(eq(routineChecks.itemId, itemId), gte(routineChecks.date, from), lte(routineChecks.date, to)))
    .get()!.n;
}

export interface RoutineProgress {
  item: RoutineItem;
  /** Ticks this planning week, for items with a weekly minimum. */
  week: number | null;
  /** Ticks in the item's cycle so far, for items with a target (e.g. 90 readings). */
  cycle: number | null;
}

const inCycle = (i: RoutineItem, day: string) => (!i.activeFrom || day >= i.activeFrom) && (!i.activeTo || day <= i.activeTo);

function progressOf(i: RoutineItem, weekFrom: string, weekTo: string): RoutineProgress {
  return {
    item: i,
    week: i.weeklyMinimum ? checksBetween(i.id, weekFrom, weekTo) : null,
    cycle: i.targetCount && i.activeFrom && i.activeTo ? checksBetween(i.id, i.activeFrom, i.activeTo) : null,
  };
}

/** The day's checklist: items scheduled on that weekday and inside their cycle, with ticks and counters. */
export function routineForDay(day: string, weekFrom: string, weekTo: string) {
  const weekday = String(new Date(`${day}T00:00:00Z`).getUTCDay());
  const checked = new Set(
    getDb().select({ itemId: routineChecks.itemId }).from(routineChecks).where(eq(routineChecks.date, day)).all().map((r) => r.itemId),
  );
  return listRoutine()
    .filter((i) => i.days.includes(weekday) && inCycle(i, day))
    .map((i) => ({ ...progressOf(i, weekFrom, weekTo), done: checked.has(i.id) }));
}

/** Weekly minimums and cycle targets for the week page. */
export function routineProgress(weekFrom: string, weekTo: string): RoutineProgress[] {
  return listRoutine()
    .filter((i) => i.weeklyMinimum || i.targetCount)
    .filter((i) => !i.activeTo || i.activeTo >= weekFrom)
    .map((i) => progressOf(i, weekFrom, weekTo));
}

/* Energy (one per day) */

export function getEnergy(day: string): EnergyLevel | null {
  return getDb().select().from(dayLogs).where(eq(dayLogs.date, day)).get()?.energy ?? null;
}

export function setEnergy(day: string, energy: EnergyLevel) {
  getDb().insert(dayLogs).values({ date: day, energy }).onConflictDoUpdate({ target: dayLogs.date, set: { energy, updatedAt: now() } }).run();
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
    ideas: db.select().from(ideas).all(),
    tasks: db.select().from(tasks).all(),
    weeklyOutcomes: db.select().from(weeklyOutcomes).all(),
    routineItems: db.select().from(routineItems).all(),
    routineChecks: db.select().from(routineChecks).all(),
    dayLogs: db.select().from(dayLogs).all(),
  };
}
