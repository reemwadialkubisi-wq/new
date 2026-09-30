import { EVENT_KINDS, PLAN_STATUSES, TIERS, type Capacity, type EventKind, type PlanStatus, type Tier } from "@/db/schema";
import { LIFE_AREAS } from "./areas";
import { MAX_PRIORITIES } from "./config";
import { parseISODate } from "./time/calendar";

/** Field errors, in Arabic, keyed by form field name. */
export type Errors = Record<string, string>;
export type Result<T> = { ok: true; value: T } | { ok: false; errors: Errors };

const AREA_SLUGS = new Set(LIFE_AREAS.map((a) => a.slug));
const tooLong = (max: number) => `النص أطول من اللازم (الحد ${max} حرفًا).`;
const clean = (v: unknown) => (typeof v === "string" ? v.trim().replace(/\s+\n/g, "\n") : "");

export interface PlanInput { theme: string; intention: string; priorities: string[]; status: PlanStatus }

export function validatePlan(raw: { theme?: unknown; intention?: unknown; priorities?: unknown[]; status?: unknown }): Result<PlanInput> {
  const errors: Errors = {};
  const theme = clean(raw.theme);
  const intention = clean(raw.intention);
  const priorities = (raw.priorities ?? []).map(clean).filter(Boolean);
  const status = (raw.status ?? "planning") as PlanStatus;
  if (theme.length > 80) errors.theme = tooLong(80);
  if (intention.length > 1000) errors.intention = tooLong(1000);
  if (priorities.length > MAX_PRIORITIES)
    errors.priorities = `القائمة تتسع لـ ${MAX_PRIORITIES} كحد أقصى. اختاري الأهم، والباقي يمكن أن ينتظر.`;
  else if (priorities.some((p) => p.length > 140)) errors.priorities = tooLong(140);
  if (!PLAN_STATUSES.includes(status)) errors.status = "اختاري حالة من القائمة.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { theme, intention, priorities, status } };
}

export interface FocusInput { area: string; focus: string; tier: Tier }

export function validateFocus(rows: { area: string; focus?: unknown; tier?: unknown }[]): Result<FocusInput[]> {
  const errors: Errors = {};
  const value: FocusInput[] = [];
  for (const r of rows) {
    if (!AREA_SLUGS.has(r.area)) continue;
    const focus = clean(r.focus);
    const tier = (r.tier ?? "should") as Tier;
    if (!focus) continue;
    if (focus.length > 140) errors[`focus_${r.area}`] = tooLong(140);
    else if (!TIERS.includes(tier)) errors[`focus_${r.area}`] = "اختاري الأولوية من القائمة.";
    else value.push({ area: r.area, focus, tier });
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

export interface EventInput { title: string; kind: EventKind; date: string; endDate: string | null; yearly: boolean; area: string | null }

export function validateEvent(raw: { title?: unknown; kind?: unknown; date?: unknown; endDate?: unknown; yearly?: unknown; area?: unknown }): Result<EventInput> {
  const errors: Errors = {};
  const title = clean(raw.title);
  const kind = (clean(raw.kind) || "important_date") as EventKind;
  const date = clean(raw.date);
  const endDate = clean(raw.endDate) || null;
  const area = clean(raw.area) || null;
  if (!title) errors.title = "اكتبي عنوانًا قصيرًا.";
  else if (title.length > 120) errors.title = tooLong(120);
  if (!EVENT_KINDS.includes(kind)) errors.kind = "اختاري النوع من القائمة.";
  if (!date) errors.date = "اختاري التاريخ.";
  else if (!parseISODate(date)) errors.date = "هذا التاريخ غير صحيح.";
  if (endDate) {
    if (!parseISODate(endDate)) errors.endDate = "هذا التاريخ غير صحيح.";
    else if (!errors.date && endDate < date) errors.endDate = "تاريخ النهاية يجب أن يكون بعد البداية أو في اليوم نفسه.";
  }
  if (area && !AREA_SLUGS.has(area)) errors.area = "اختاري المجال من القائمة.";
  const yearly = raw.yearly === true || raw.yearly === "on";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { title, kind, date, endDate, yearly, area } };
}

export interface SettingsInput { weekStart: 0 | 1 | 6; timeZone: string; capacity: Capacity }

export function isTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function validateSettings(raw: Record<string, unknown>): Result<SettingsInput> {
  const errors: Errors = {};
  const weekStart = Number(raw.weekStart);
  const timeZone = clean(raw.timeZone);
  if (![6, 0, 1].includes(weekStart)) errors.weekStart = "اختاري يومًا من القائمة.";
  if (!timeZone || !isTimeZone(timeZone)) errors.timeZone = "منطقة زمنية غير معروفة. مثال: Asia/Riyadh";
  const num = (name: string, min: number, max: number) => {
    const n = Number(raw[name]);
    if (!Number.isInteger(n) || n < min || n > max) {
      errors[name] = `رقم صحيح من ${min} إلى ${max}.`;
      return min;
    }
    return n;
  };
  const capacity: Capacity = {
    activeAnnualGoals: num("activeAnnualGoals", 1, 10),
    quarterObjectives: num("quarterObjectives", 1, 10),
    activeProjects: num("activeProjects", 1, 10),
    weeklyOutcomes: num("weeklyOutcomes", 1, 10),
    optionalDaily: { GREEN: num("green", 0, 15), YELLOW: num("yellow", 0, 15), RED: num("red", 0, 15) },
  };
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value: { weekStart: weekStart as 0 | 1 | 6, timeZone, capacity } };
}

export const CAPTURE_KINDS = ["idea", "task", "outcome", "date"] as const;
export type CaptureKind = (typeof CAPTURE_KINDS)[number];
export interface CaptureInput { kind: CaptureKind; title: string; note: string; date: string | null }

/** Quick Capture: one text box + a type. Ideas keep extra lines as a note; the others are one line. */
export function validateCapture(raw: { kind?: unknown; text?: unknown; date?: unknown }): Result<CaptureInput> {
  const errors: Errors = {};
  const kind = clean(raw.kind) as CaptureKind;
  const text = clean(raw.text);
  const date = clean(raw.date) || null;
  if (!CAPTURE_KINDS.includes(kind)) errors.kind = "اختاري النوع.";
  const [first = "", ...rest] = text.split("\n");
  const title = kind === "idea" ? first.trim() : text.replace(/\s*\n\s*/g, " ");
  const note = kind === "idea" ? rest.join("\n").trim() : "";
  if (!title) errors.text = "اكتبي بضع كلمات أولًا.";
  else if (title.length > 200) errors.text = tooLong(200);
  else if (note.length > 2000) errors.text = tooLong(2000);
  if (kind === "date" && !date) errors.date = "اختاري التاريخ.";
  if (date && !parseISODate(date)) errors.date = "هذا التاريخ غير صحيح.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { kind, title, note, date } };
}

export interface RoutineInput {
  title: string; startTime: string; endTime: string | null; area: string | null; tier: Tier; days: string;
  weeklyMinimum: number | null; targetCount: number | null; activeFrom: string | null; activeTo: string | null; note: string;
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateRoutine(raw: Record<string, unknown> & { days?: unknown[] }): Result<RoutineInput> {
  const errors: Errors = {};
  const title = clean(raw.title);
  const startTime = clean(raw.startTime);
  const endTime = clean(raw.endTime) || null;
  const area = clean(raw.area) || null;
  const tier = (clean(raw.tier) || "should") as Tier;
  const days = [...new Set((raw.days ?? []).map(clean).filter((d) => /^[0-6]$/.test(d)))].sort().join("");
  const activeFrom = clean(raw.activeFrom) || null;
  const activeTo = clean(raw.activeTo) || null;
  const note = clean(raw.note);
  const optInt = (name: string, max: number) => {
    const v = clean(raw[name]);
    if (!v) return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > max) {
      errors[name] = `رقم صحيح من 1 إلى ${max}، أو اتركيه فارغًا.`;
      return null;
    }
    return n;
  };
  if (!title) errors.title = "اكتبي اسمًا قصيرًا.";
  else if (title.length > 120) errors.title = tooLong(120);
  if (!TIME.test(startTime)) errors.startTime = "اكتبي الوقت بصيغة 05:30.";
  if (endTime && !TIME.test(endTime)) errors.endTime = "اكتبي الوقت بصيغة 05:30.";
  else if (endTime && !errors.startTime && endTime <= startTime) errors.endTime = "النهاية بعد البداية.";
  if (area && !AREA_SLUGS.has(area)) errors.area = "اختاري المجال من القائمة.";
  if (!TIERS.includes(tier)) errors.tier = "اختاري الأولوية من القائمة.";
  if (!days) errors.days = "اختاري يومًا واحدًا على الأقل.";
  const weeklyMinimum = optInt("weeklyMinimum", 7);
  const targetCount = optInt("targetCount", 1000);
  if (activeFrom && !parseISODate(activeFrom)) errors.activeFrom = "هذا التاريخ غير صحيح.";
  if (activeTo && !parseISODate(activeTo)) errors.activeTo = "هذا التاريخ غير صحيح.";
  else if (activeFrom && activeTo && activeTo < activeFrom) errors.activeTo = "النهاية بعد البداية.";
  if (targetCount && (!activeFrom || !activeTo)) errors.targetCount = "الهدف يحتاج تاريخ بداية ونهاية للدورة.";
  if (note.length > 200) errors.note = tooLong(200);
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value: { title, startTime, endTime, area, tier, days, weeklyMinimum, targetCount, activeFrom, activeTo, note } };
}
