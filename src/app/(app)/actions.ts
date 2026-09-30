"use server";

import { revalidatePath } from "next/cache";
import {
  addEvent, addIdea, addOutcome, addTask, archiveEvent, archiveIdea, archiveOutcome, archiveTask,
  archiveRoutineItem, getSettings, saveHabit, listOutcomes, saveFocus, savePlan, saveRoutineItem, saveSettings,
  setEnergy, setOutcomeStatus, setRoutineCheck, setTaskStatus,
} from "@/db/repo";
import { ENERGIES, type EnergyLevel } from "@/db/schema";
import type { PlanLevel } from "@/db/schema";
import { LIFE_AREAS } from "@/lib/areas";
import { periodRef } from "@/lib/periods";
import { formatDateAr, parseISODate, startOfWeek, todayIn, toISODate } from "@/lib/time/calendar";
import { validateCapture, validateEvent, validateFocus, validateHabit, validatePlan, validateRoutine, validateSettings, type Errors } from "@/lib/validate";

export interface FormState {
  ok?: boolean;
  errors?: Errors;
  /** Changes on every successful save so client forms know to close. */
  savedAt?: number;
}

const done = (): FormState => {
  revalidatePath("/", "layout");
  return { ok: true, savedAt: Date.now() };
};

export async function savePlanAction(level: PlanLevel, key: string, _prev: FormState, form: FormData): Promise<FormState> {
  const ref = periodRef(level, key);
  if (!ref) return { errors: { form: "هذه الفترة غير موجودة." } };
  const result = validatePlan({
    theme: form.get("theme"),
    intention: form.get("intention"),
    priorities: form.getAll("priority"),
    status: form.get("status") ?? undefined,
  });
  if (!result.ok) return { errors: result.errors };
  savePlan(ref, result.value);
  return done();
}

export async function saveFocusAction(level: PlanLevel, key: string, _prev: FormState, form: FormData): Promise<FormState> {
  const ref = periodRef(level, key);
  if (!ref) return { errors: { form: "هذه الفترة غير موجودة." } };
  const result = validateFocus(
    LIFE_AREAS.map((a) => ({ area: a.slug, focus: form.get(`focus_${a.slug}`), tier: form.get(`tier_${a.slug}`) })),
  );
  if (!result.ok) return { errors: result.errors };
  saveFocus(ref, result.value);
  return done();
}

export async function addEventAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = validateEvent({
    title: form.get("title"),
    kind: form.get("kind"),
    date: form.get("date"),
    endDate: form.get("endDate"),
    yearly: form.get("yearly"),
    area: form.get("area"),
  });
  if (!result.ok) return { errors: result.errors };
  addEvent(result.value);
  return done();
}

export async function archiveEventAction(form: FormData) {
  const id = Number(form.get("id"));
  if (Number.isInteger(id) && id > 0) archiveEvent(id);
  revalidatePath("/", "layout");
}

export async function saveSettingsAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = validateSettings(Object.fromEntries(form));
  if (!result.ok) return { errors: result.errors };
  saveSettings(result.value);
  return done();
}

/* Quick Capture */

export interface CaptureResult {
  ok?: boolean;
  /** Where it went, in plain Arabic. */
  message?: string;
  errors?: Errors;
}

export async function captureAction(input: { kind: string; text: string; date?: string }): Promise<CaptureResult> {
  const result = validateCapture(input);
  if (!result.ok) return { errors: result.errors };
  const { kind, title, note, date } = result.value;
  const settings = getSettings();
  const today = todayIn(settings.timeZone);
  let message: string;

  if (kind === "idea") {
    addIdea({ title, note });
    message = "حُفظت في صندوق الأفكار.";
  } else if (kind === "task") {
    addTask({ title, date });
    message = date ? `حُفظت مهمة ليوم ${formatDateAr(parseISODate(date)!)}.` : "حُفظت مهمة بلا تاريخ، وتظهر في صفحة اليوم.";
  } else if (kind === "outcome") {
    const weekStart = toISODate(startOfWeek(today, settings.weekStart));
    addOutcome({ weekStart, title });
    const count = listOutcomes(weekStart).length;
    const max = settings.capacity.weeklyOutcomes;
    message =
      count > max
        ? `حُفظت. هذا الأسبوع فيه الآن ${count} نتائج، والحد الذي اخترتِه ${max}. قد يتجاوز الحمل طاقتك المتاحة؛ يمكنك نقل واحدة لاحقًا.`
        : `حُفظت في نتائج هذا الأسبوع (${count} من ${max}).`;
  } else {
    addEvent({ title, kind: "important_date", date: date!, endDate: null, yearly: false, area: null });
    message = `حُفظ في التواريخ المهمة: ${formatDateAr(parseISODate(date!)!)}.`;
  }
  revalidatePath("/", "layout");
  return { ok: true, message };
}

/* Small item actions (forms with a hidden id) */

const idOf = (form: FormData) => {
  const id = Number(form.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function toggleTaskAction(form: FormData) {
  const id = idOf(form);
  if (id) setTaskStatus(id, form.get("done") === "1" ? "done" : "open");
  revalidatePath("/", "layout");
}

export async function archiveTaskAction(form: FormData) {
  const id = idOf(form);
  if (id) archiveTask(id);
  revalidatePath("/", "layout");
}

export async function toggleOutcomeAction(form: FormData) {
  const id = idOf(form);
  if (id) setOutcomeStatus(id, form.get("done") === "1" ? "achieved" : "open");
  revalidatePath("/", "layout");
}

export async function archiveOutcomeAction(form: FormData) {
  const id = idOf(form);
  if (id) archiveOutcome(id);
  revalidatePath("/", "layout");
}

export async function archiveIdeaAction(form: FormData) {
  const id = idOf(form);
  if (id) archiveIdea(id);
  revalidatePath("/", "layout");
}

/* Daily routine and energy */

const isDay = (v: FormDataEntryValue | null): v is string => typeof v === "string" && parseISODate(v) !== null;

export async function toggleRoutineAction(form: FormData) {
  const id = idOf(form);
  const date = form.get("date");
  const pick = Number(form.get("pick")) || null;
  if (id && isDay(date)) setRoutineCheck(id, date, form.get("done") === "1", pick);
  revalidatePath("/", "layout");
}

export async function setEnergyAction(form: FormData) {
  const date = form.get("date");
  const energy = form.get("energy") as EnergyLevel;
  if (isDay(date) && ENERGIES.includes(energy)) setEnergy(date, energy);
  revalidatePath("/", "layout");
}

export async function saveRoutineAction(id: number | null, _prev: FormState, form: FormData): Promise<FormState> {
  const result = validateRoutine({ ...Object.fromEntries(form), days: form.getAll("days") });
  if (!result.ok) return { errors: result.errors };
  saveRoutineItem(id, result.value);
  return done();
}

export async function archiveRoutineAction(form: FormData) {
  const id = idOf(form);
  if (id) archiveRoutineItem(id);
  revalidatePath("/", "layout");
}

export async function saveHabitAction(id: number | null, _prev: FormState, form: FormData): Promise<FormState> {
  const result = validateHabit(Object.fromEntries(form));
  if (!result.ok) return { errors: result.errors };
  saveHabit(id, result.value);
  return done();
}
