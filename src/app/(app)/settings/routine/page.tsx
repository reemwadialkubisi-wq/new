import type { Metadata } from "next";
import Link from "next/link";
import { EyeOff } from "lucide-react";
import { archiveRoutineAction, saveHabitAction, saveRoutineAction } from "../../actions";
import { PageHeader } from "@/components/ui/page-header";
import { TierBadge } from "@/components/ui/status";
import { EditableSection } from "@/components/plan/forms";
import { HabitForm, RoutineForm } from "@/components/plan/plan-forms";
import { Section } from "@/components/ui/card";
import { listHabits, listRoutine } from "@/db/repo";
import { LIFE_AREAS } from "@/lib/areas";
import { WEEKDAYS_AR } from "@/lib/time/calendar";

export const metadata: Metadata = { title: "الجدول اليومي" };

const AREA_NAME = Object.fromEntries(LIFE_AREAS.map((a) => [a.slug, a.name]));

function daysLabel(days: string) {
  if (days === "0123456") return "كل يوم";
  if (days === "01234") return "من الأحد إلى الخميس";
  return [...days].map((d) => WEEKDAYS_AR[Number(d)]).join("، ");
}

export default function RoutinePage() {
  const items = listRoutine();
  const habits = listHabits();
  const habitName = Object.fromEntries(habits.map((h) => [h.id, h.title]));
  return (
    <>
      <PageHeader
        eyebrow={<Link href="/settings" className="hover:text-ink">الإعدادات</Link>}
        title="الجدول اليومي"
        english="Daily Routine"
        subtitle="يومك من الاستيقاظ إلى النوم. كل ✓ في صفحة اليوم يُحسب تلقائيًا في مجاله وحدّه الأسبوعي وهدفه."
      />
      <Section title="الأنظمة المستمرة · Habits" meta="تمتلئ من علامات ✓ فقط" className="mb-6">
        <ul className="divide-y divide-border" data-testid="habits">
          {habits.map((h) => (
            <li key={h.id} className="py-3">
              <EditableSection
                className="border-0 bg-transparent p-0"
                title={h.title}
                meta={h.weeklyMinimum ? `${h.weeklyMinimum} أسبوعيًا` : "بلا حد أدنى"}
                view={<p className="text-xs text-ink-3" dir="auto">{h.note || " "}</p>}
                form={<HabitForm action={saveHabitAction.bind(null, h.id)} initial={h} />}
              />
            </li>
          ))}
        </ul>
      </Section>
      <div className="space-y-4">
        <EditableSection
          title="إضافة بند"
          editLabel="إضافة"
          view={<p className="text-sm text-ink-3">بند جديد في الجدول: وقته وأيامه ومجاله، وحد أدنى أسبوعي أو هدف إن وُجد.</p>}
          form={<RoutineForm action={saveRoutineAction.bind(null, null)} submitLabel="إضافة" habits={habits} />}
        />
        {items.map((i) => (
          <EditableSection
            key={i.id}
            title={`${i.startTime}${i.endTime ? `–${i.endTime}` : ""} · ${i.title}`}
            view={
              <div className="flex items-start justify-between gap-4" data-testid="routine-item">
                <div className="space-y-1 text-sm">
                  <p className="text-ink-2">
                    {daysLabel(i.days)}
                    {i.area ? ` · ${AREA_NAME[i.area]}` : ""}
                    {i.weeklyMinimum ? ` · ${i.weeklyMinimum} مرات أسبوعيًا` : ""}
                    {i.targetCount ? ` · هدف ${i.targetCount} (${i.activeFrom} – ${i.activeTo})` : ""}
                    {i.habitId ? ` · يُحسب في ${habitName[i.habitId]}` : ""}
                    {i.choiceHabitIds?.length ? ` · اختيار: ${i.choiceHabitIds.map((id) => habitName[id]).filter(Boolean).join(" / ")}` : ""}
                  </p>
                  {i.note ? <p className="text-xs text-ink-3" dir="auto">{i.note}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <TierBadge tier={i.tier} />
                  <form action={archiveRoutineAction}>
                    <input type="hidden" name="id" value={i.id} />
                    <button type="submit" className="rounded-sm p-1 text-ink-4 hover:bg-surface-2 hover:text-ink" aria-label={`إخفاء: ${i.title}`} title="إخفاء (يبقى في النسخة الاحتياطية)">
                      <EyeOff className="size-3.5" aria-hidden />
                    </button>
                  </form>
                </div>
              </div>
            }
            form={<RoutineForm action={saveRoutineAction.bind(null, i.id)} initial={i} habits={habits} />}
          />
        ))}
      </div>
    </>
  );
}
