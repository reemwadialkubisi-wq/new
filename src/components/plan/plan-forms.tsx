"use client";

import type { FormState } from "@/app/(app)/actions";
import { Input, Select, Textarea } from "@/components/ui/field";
import { LIFE_AREAS } from "@/lib/areas";
import { MAX_PRIORITIES } from "@/lib/config";
import { ActionForm, FieldError, FormField } from "./forms";
import { EVENT_KIND_LABELS, PLAN_STATUS_LABELS, TIER_LABELS } from "./labels";

type Action = (prev: FormState, form: FormData) => Promise<FormState>;

export interface PlanFormLabels {
  theme: string;
  themeHint?: string;
  intention: string;
  priorities: string;
  prioritiesHint: string;
}

export function PlanForm({
  action, labels, initial,
}: {
  action: Action;
  labels: PlanFormLabels;
  initial: { theme: string; intention: string; priorities: string[]; status: string };
}) {
  const slots = Array.from({ length: MAX_PRIORITIES }, (_, i) => initial.priorities[i] ?? "");
  return (
    <ActionForm action={action}>
      <FormField name="theme" label={labels.theme} hint={labels.themeHint}>
        <Input name="theme" defaultValue={initial.theme} maxLength={120} />
      </FormField>
      <FormField name="intention" label={labels.intention}>
        <Textarea name="intention" defaultValue={initial.intention} rows={3} />
      </FormField>
      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-xs font-medium text-ink-2">{labels.priorities}</legend>
        {slots.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-4 text-xs tabular-nums text-ink-4">{i + 1}</span>
            <Input name="priority" defaultValue={p} aria-label={`${labels.priorities} ${i + 1}`} maxLength={200} />
          </div>
        ))}
        <p className="text-xs text-ink-3">{labels.prioritiesHint}</p>
        <FieldError name="priorities" />
      </fieldset>
      <FormField name="status" label="الحالة" className="max-w-xs">
        <Select name="status" defaultValue={initial.status}>
          {Object.entries(PLAN_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </FormField>
    </ActionForm>
  );
}

export function FocusForm({ action, initial }: { action: Action; initial: Record<string, { focus: string; tier: string }> }) {
  return (
    <ActionForm action={action}>
      <p className="text-xs text-ink-3">اتركي المجال فارغًا إن كان يستريح في هذه الفترة.</p>
      <ul className="space-y-3">
        {LIFE_AREAS.map((a) => (
          <li key={a.slug} className="grid grid-cols-1 gap-2 @lg:grid-cols-[9rem_1fr_7rem] @lg:items-center">
            <label htmlFor={`focus_${a.slug}`} className="text-sm text-ink-2">{a.name}</label>
            <Input
              id={`focus_${a.slug}`}
              name={`focus_${a.slug}`}
              defaultValue={initial[a.slug]?.focus ?? ""}
              placeholder="التركيز في هذه الفترة"
              maxLength={200}
            />
            <Select name={`tier_${a.slug}`} defaultValue={initial[a.slug]?.tier ?? "should"} aria-label={`أولوية ${a.name}`}>
              {Object.entries(TIER_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
            <div className="@lg:col-span-3"><FieldError name={`focus_${a.slug}`} /></div>
          </li>
        ))}
      </ul>
    </ActionForm>
  );
}

export function EventForm({ action, defaultDate, min, max }: { action: Action; defaultDate: string; min?: string; max?: string }) {
  return (
    <ActionForm action={action} submitLabel="إضافة" resetOnSave>
      <FormField name="title" label="العنوان">
        <Input name="title" placeholder="مثال: آخر موعد للتقديم" maxLength={200} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
        <FormField name="date" label="التاريخ">
          <Input name="date" type="date" dir="ltr" defaultValue={defaultDate} min={min} max={max} />
        </FormField>
        <FormField name="endDate" label="حتى (اختياري)" hint="للسفر أو ما يمتد أكثر من يوم.">
          <Input name="endDate" type="date" dir="ltr" />
        </FormField>
        <FormField name="kind" label="النوع">
          <Select name="kind" defaultValue="important_date">
            {Object.entries(EVENT_KIND_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </FormField>
        <FormField name="area" label="المجال (اختياري)">
          <Select name="area" defaultValue="">
            <option value="">بدون</option>
            {LIFE_AREAS.map((a) => (
              <option key={a.slug} value={a.slug}>{a.name}</option>
            ))}
          </Select>
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" name="yearly" className="size-4 accent-[var(--pink)]" />
        يتكرر كل سنة (مثل عيد ميلاد)
      </label>
    </ActionForm>
  );
}

export function SettingsForm({
  action, initial,
}: {
  action: Action;
  initial: { weekStart: number; timeZone: string; capacity: { activeAnnualGoals: number; quarterObjectives: number; activeProjects: number; weeklyOutcomes: number; optionalDaily: { GREEN: number; YELLOW: number; RED: number } } };
}) {
  const c = initial.capacity;
  const num = (name: string, label: string, value: number, max: number) => (
    <FormField name={name} label={label}>
      <Input name={name} type="number" inputMode="numeric" min={0} max={max} defaultValue={value} dir="ltr" className="max-w-24" />
    </FormField>
  );
  return (
    <ActionForm action={action}>
      <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
        <FormField name="weekStart" label="بداية الأسبوع" hint="تغييرها يعيد ترقيم الأسابيع.">
          <Select name="weekStart" defaultValue={String(initial.weekStart)}>
            <option value="6">السبت</option>
            <option value="0">الأحد</option>
            <option value="1">الاثنين</option>
          </Select>
        </FormField>
        <FormField name="timeZone" label="المنطقة الزمنية" hint="مثال: Asia/Riyadh">
          <Input name="timeZone" defaultValue={initial.timeZone} dir="ltr" />
        </FormField>
      </div>
      <fieldset className="grid grid-cols-2 gap-4 @xl:grid-cols-4">
        <legend className="mb-2 text-xs font-semibold text-ink-3">السعة · Anti-Overload</legend>
        {num("activeAnnualGoals", "الأهداف السنوية النشطة", c.activeAnnualGoals, 10)}
        {num("quarterObjectives", "أهداف الربع", c.quarterObjectives, 10)}
        {num("activeProjects", "المشاريع النشطة", c.activeProjects, 10)}
        {num("weeklyOutcomes", "نتائج الأسبوع", c.weeklyOutcomes, 10)}
      </fieldset>
      <fieldset className="grid grid-cols-3 gap-4 @xl:grid-cols-4">
        <legend className="mb-2 text-xs font-semibold text-ink-3">العناصر الاختيارية اليومية حسب الطاقة</legend>
        {num("green", "GREEN", c.optionalDaily.GREEN, 15)}
        {num("yellow", "YELLOW", c.optionalDaily.YELLOW, 15)}
        {num("red", "RED", c.optionalDaily.RED, 15)}
      </fieldset>
    </ActionForm>
  );
}
