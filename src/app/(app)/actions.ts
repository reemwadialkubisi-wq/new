"use server";

import { revalidatePath } from "next/cache";
import { addEvent, archiveEvent, saveFocus, savePlan, saveSettings } from "@/db/repo";
import type { PlanLevel } from "@/db/schema";
import { LIFE_AREAS } from "@/lib/areas";
import { periodRef } from "@/lib/periods";
import { validateEvent, validateFocus, validatePlan, validateSettings, type Errors } from "@/lib/validate";

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
