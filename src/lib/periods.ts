import { SYSTEM_START } from "./config";
import { day, parseMonthKey, parseQuarterKey, parseYear, toISODate } from "./time/calendar";
import type { PlanLevel } from "@/db/schema";

export interface PeriodRef {
  level: PlanLevel;
  key: string;
  year: number;
  quarter: number | null;
  /** 1–12 */
  month: number | null;
  startDate: string;
  endDate: string;
}

/** Turns a URL key ("2026", "2026-q4", "2026-10") into the period's calendar dates. */
export function periodRef(level: PlanLevel, key: string): PeriodRef | null {
  if (level === "year") {
    const year = parseYear(key);
    if (!year) return null;
    return { level, key: String(year), year, quarter: null, month: null, startDate: `${year}-01-01`, endDate: `${year}-12-31` };
  }
  if (level === "quarter") {
    const q = parseQuarterKey(key);
    if (!q) return null;
    const first = (q.quarter - 1) * 3;
    return {
      level, key: `${q.year}-q${q.quarter}`, year: q.year, quarter: q.quarter, month: null,
      startDate: toISODate(day(q.year, first, 1)),
      endDate: toISODate(day(q.year, first + 3, 0)),
    };
  }
  const m = parseMonthKey(key);
  if (!m) return null;
  return {
    level, key, year: m.year, quarter: Math.floor(m.month / 3) + 1, month: m.month + 1,
    startDate: toISODate(day(m.year, m.month, 1)),
    endDate: toISODate(day(m.year, m.month + 1, 0)),
  };
}

/** True when the whole period ends before the system starts (Q4 2026). */
export function beforeStart(endDate: string) {
  return endDate < SYSTEM_START.date;
}

/** The first period of a level: where earlier URLs are sent. */
export const START_HREF = {
  year: `/year/${SYSTEM_START.year}`,
  quarter: `/quarter/${SYSTEM_START.quarterKey}`,
  month: `/month/${SYSTEM_START.monthKey}`,
} as const;
