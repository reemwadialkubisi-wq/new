/**
 * REEM LIFE OS — calendar rules (Phase 0, approved).
 *
 * - All dates are calendar days, represented as UTC-midnight Date objects
 *   so results never depend on the server or browser time zone.
 * - Weeks start on a configurable weekday (default Saturday, ends Friday).
 * - A week belongs to the month, quarter and year of its 4th day.
 *   So a month has 4 or 5 weeks and no week is shown in two months.
 * - Week 1 of a year = the first week whose 4th day falls in that year.
 * - All output uses Western digits (0-9).
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday … 6 = Saturday
export const DEFAULT_WEEK_START: Weekday = 6;

const DAY_MS = 86_400_000;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function day(year: number, month: number, date: number): Date {
  return new Date(Date.UTC(year, month, date));
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

/** "2026-10-01" → UTC-midnight Date. Returns null for anything invalid. */
export function parseISODate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  const date = day(y, mo, d);
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo || date.getUTCDate() !== d) return null;
  return date;
}

export function toISODate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Today's calendar date in the given IANA time zone. */
export function todayIn(timeZone: string, now: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", numberingSystem: "latn",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return day(get("year"), get("month") - 1, get("day"));
}

export function quarterOfMonth(month: number): 1 | 2 | 3 | 4 {
  return (Math.floor(month / 3) + 1) as 1 | 2 | 3 | 4;
}

export function startOfWeek(d: Date, weekStart: Weekday = DEFAULT_WEEK_START): Date {
  const diff = (d.getUTCDay() - weekStart + 7) % 7;
  return addDays(d, -diff);
}

export interface WeekInfo {
  start: Date;
  end: Date;
  /** Planning year / month / quarter the week belongs to (by its 4th day). */
  year: number;
  month: number;
  quarter: 1 | 2 | 3 | 4;
  number: number;
  /** True when the week's days span two quarters (e.g. 26 Sep – 2 Oct 2026). */
  bridge: boolean;
}

function firstWeekStartOfYear(year: number, weekStart: Weekday): Date {
  // The week containing 4 January always has its 4th day in the new year
  // only if it starts on or before 1 Jan + 3; find the first week whose 4th day is in `year`.
  let s = startOfWeek(day(year, 0, 1), weekStart);
  if (addDays(s, 3).getUTCFullYear() < year) s = addDays(s, 7);
  return s;
}

export function weekInfo(d: Date, weekStart: Weekday = DEFAULT_WEEK_START): WeekInfo {
  const start = startOfWeek(d, weekStart);
  const end = addDays(start, 6);
  const anchor = addDays(start, 3);
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  const number = Math.round((start.getTime() - firstWeekStartOfYear(year, weekStart).getTime()) / (7 * DAY_MS)) + 1;
  const bridge = quarterOfMonth(start.getUTCMonth()) !== quarterOfMonth(end.getUTCMonth());
  return { start, end, year, month, quarter: quarterOfMonth(month), number, bridge };
}

/** All weeks belonging to a month (4 or 5), in order. */
export function weeksOfMonth(year: number, month: number, weekStart: Weekday = DEFAULT_WEEK_START): WeekInfo[] {
  const weeks: WeekInfo[] = [];
  let s = startOfWeek(day(year, month, 1), weekStart);
  for (let i = 0; i < 7; i++, s = addDays(s, 7)) {
    const w = weekInfo(s, weekStart);
    if (w.year === year && w.month === month) weeks.push(w);
    else if (weeks.length) break;
  }
  return weeks;
}

/* ---------- formatting (Western digits only) ---------- */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export const shortMonth = (m: number) => MONTHS[m].slice(0, 3);
export const shortWeekday = (d: Date) => WEEKDAYS[d.getUTCDay()].slice(0, 3);

/** "Thu 1 Oct" */
export function formatDayShort(d: Date): string {
  return `${shortWeekday(d)} ${d.getUTCDate()} ${shortMonth(d.getUTCMonth())}`;
}

/** "Thursday 1 October 2026" */
export function formatDayLong(d: Date): string {
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "3–9 Oct" or "31 Oct–6 Nov" or "26 Dec–1 Jan" */
export function formatRange(a: Date, b: Date): string {
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}–${b.getUTCDate()} ${shortMonth(b.getUTCMonth())}`;
  return `${a.getUTCDate()} ${shortMonth(a.getUTCMonth())}–${b.getUTCDate()} ${shortMonth(b.getUTCMonth())}`;
}

/* ---------- period keys used in URLs ---------- */

export const monthKey = (year: number, month: number) => `${year}-${pad(month + 1)}`;
export const quarterKey = (year: number, q: number) => `${year}-q${q}`;

export function parseMonthKey(key: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(key);
  if (!m) return null;
  const month = Number(m[2]) - 1;
  if (month < 0 || month > 11) return null;
  return { year: Number(m[1]), month };
}

export function parseQuarterKey(key: string): { year: number; quarter: 1 | 2 | 3 | 4 } | null {
  const m = /^(\d{4})-q([1-4])$/i.exec(key);
  if (!m) return null;
  return { year: Number(m[1]), quarter: Number(m[2]) as 1 | 2 | 3 | 4 };
}

export function parseYear(key: string): number | null {
  return /^\d{4}$/.test(key) ? Number(key) : null;
}

export function shiftMonth(year: number, month: number, delta: number) {
  const idx = year * 12 + month + delta;
  return { year: Math.floor(idx / 12), month: ((idx % 12) + 12) % 12 };
}

export function shiftQuarter(year: number, quarter: number, delta: number) {
  const idx = year * 4 + (quarter - 1) + delta;
  return { year: Math.floor(idx / 4), quarter: ((((idx % 4) + 4) % 4) + 1) as 1 | 2 | 3 | 4 };
}
