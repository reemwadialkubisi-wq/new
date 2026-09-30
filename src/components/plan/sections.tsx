import { CalendarClock, Compass, EyeOff } from "lucide-react";
import { archiveEventAction, saveFocusAction, savePlanAction, addEventAction } from "@/app/(app)/actions";
import { getFocus, listEvents } from "@/db/repo";
import type { PeriodPlan, PlanLevel } from "@/db/schema";
import { EmptyState } from "@/components/ui/empty-state";
import { TierBadge } from "@/components/ui/status";
import { LIFE_AREAS } from "@/lib/areas";
import { formatDateAr, formatRangeAr, parseISODate } from "@/lib/time/calendar";
import { EditableSection } from "./forms";
import { EVENT_KIND_LABELS, PLAN_STATUS_LABELS } from "./labels";
import { EventForm, FocusForm, PlanForm, type PlanFormLabels } from "./plan-forms";

const AREA_NAME = Object.fromEntries(LIFE_AREAS.map((a) => [a.slug, a.name]));

/** Theme, vision/intention and the (at most 5) priorities of one period. */
export function PlanSection({
  level, periodKey, plan, title, labels, readOnly,
}: {
  level: PlanLevel;
  periodKey: string;
  plan: PeriodPlan | null;
  title: string;
  labels: PlanFormLabels;
  readOnly?: boolean;
}) {
  const empty = !plan || (!plan.theme && !plan.intention && plan.priorities.length === 0);
  const view = empty ? (
    <EmptyState compact icon={Compass} title="لم يُكتب بعد">
      {readOnly ? "لم تُكتب خطة لهذه الفترة." : "اضغطي «تعديل» لكتابة العنوان والأولويات. كلمات قليلة تكفي."}
    </EmptyState>
  ) : (
    <div className="space-y-4">
      {plan.theme ? <p className="font-display text-xl leading-snug text-ink" data-testid="plan-theme">{plan.theme}</p> : null}
      {plan.intention ? <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-ink-2">{plan.intention}</p> : null}
      {plan.priorities.length ? (
        <div>
          <h3 className="mb-2 text-xs font-semibold text-ink-3">{labels.priorities}</h3>
          <ol className="divide-y divide-border" data-testid="plan-priorities">
            {plan.priorities.map((p, i) => (
              <li key={i} className="flex gap-3 py-2.5 text-sm text-ink">
                <span className="w-4 shrink-0 tabular-nums text-ink-4">{i + 1}</span>
                <span dir="auto">{p}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
  return (
    <EditableSection
      title={title}
      readOnly={readOnly}
      meta={plan ? <span data-testid="plan-status">{PLAN_STATUS_LABELS[plan.status]}</span> : null}
      view={view}
      form={
        <PlanForm
          action={savePlanAction.bind(null, level, periodKey)}
          labels={labels}
          initial={{ theme: plan?.theme ?? "", intention: plan?.intention ?? "", priorities: plan?.priorities ?? [], status: plan?.status ?? "planning" }}
        />
      }
    />
  );
}

/** Which life areas lead this period. Areas without focus are resting. */
export function FocusSection({
  level, periodKey, plan, readOnly,
}: { level: PlanLevel; periodKey: string; plan: PeriodPlan | null; readOnly?: boolean }) {
  const rows = getFocus(plan?.id);
  const order = { must: 0, should: 1, could: 2 };
  const sorted = [...rows].sort((a, b) => order[a.tier] - order[b.tier]);
  const initial = Object.fromEntries(rows.map((r) => [r.area, { focus: r.focus, tier: r.tier }]));
  return (
    <EditableSection
      title="تركيز المجالات · Area Focus"
      readOnly={readOnly}
      view={
        sorted.length ? (
          <ul className="divide-y divide-border" data-testid="area-focus">
            {sorted.map((r) => (
              <li key={r.id} className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink">{AREA_NAME[r.area] ?? r.area}</span>
                  <TierBadge tier={r.tier} />
                </div>
                <p className="mt-0.5 text-xs text-ink-3" dir="auto">{r.focus}</p>
              </li>
            ))}
            <li className="pt-2.5 text-2xs text-ink-4">المجالات الأخرى تستريح في هذه الفترة.</li>
          </ul>
        ) : (
          <p className="text-sm text-ink-3">لم يُحدد بعد أي المجالات تقود هذه الفترة وأيها يستريح.</p>
        )
      }
      form={<FocusForm action={saveFocusAction.bind(null, level, periodKey)} initial={initial} />}
    />
  );
}

/** Important dates, deadlines and travel between `from` and `to` (ISO dates). */
export function EventsSection({
  from, to, defaultDate, readOnly, title = "تواريخ مهمة · Important Dates",
}: { from: string; to: string; defaultDate: string; readOnly?: boolean; title?: string }) {
  const items = listEvents(from, to);
  return (
    <EditableSection
      title={title}
      editLabel="إضافة"
      readOnly={readOnly}
      meta={items.length ? <span className="tabular-nums">{items.length}</span> : null}
      view={
        items.length ? (
          <ul className="divide-y divide-border" data-testid="events">
            {items.map((e) => {
              const on = parseISODate(e.on)!;
              const end = e.endDate && !e.yearly ? parseISODate(e.endDate) : null;
              return (
                <li key={`${e.id}-${e.on}`} className="group flex items-start gap-3 py-2.5">
                  <span className="w-24 shrink-0 pt-px text-xs font-medium tabular-nums text-ink">
                    {end ? formatRangeAr(parseISODate(e.date)!, end) : formatDateAr(on)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink" dir="auto">{e.title}</span>
                    <span className="block text-2xs text-ink-3">
                      {EVENT_KIND_LABELS[e.kind]}
                      {e.area ? ` · ${AREA_NAME[e.area]}` : ""}
                      {e.yearly ? " · كل سنة" : ""}
                    </span>
                  </span>
                  {readOnly ? null : (
                    <form action={archiveEventAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        className="rounded-sm p-1 text-ink-4 hover:bg-surface-2 hover:text-ink"
                        aria-label={`إخفاء: ${e.title}`}
                        title="إخفاء (يبقى في النسخة الاحتياطية)"
                      >
                        <EyeOff className="size-3.5" aria-hidden />
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState compact icon={CalendarClock} title="لا توجد تواريخ مهمة في هذه الفترة" />
        )
      }
      form={<EventForm action={addEventAction} defaultDate={defaultDate} />}
    />
  );
}
