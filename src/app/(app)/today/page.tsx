import type { Metadata } from "next";
import { CheckSquare, Repeat, Sparkles, MoonStar } from "lucide-react";
import { Card, Section, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CaptureButton } from "@/components/shell/capture-button";
import { EventsSection } from "@/components/plan/sections";
import { TaskList } from "@/components/plan/items";
import { tasksForDay } from "@/db/repo";
import { MainWithRail, PageHeader } from "@/components/ui/page-header";
import { ENERGY, type Energy } from "@/components/ui/status";
import { Planned } from "@/components/ui/planned";
import { formatDayLongAr, toISODate } from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "اليوم" };

const BIG3 = [
  { n: 1, label: "الأساسي · Essential", hint: "الشيء الوحيد الذي يجب أن يحدث اليوم." },
  { n: 2, label: "النتيجة الأهم · Most Important Outcome", hint: "تدفع نتيجة أسبوعية إلى الأمام." },
  { n: 3, label: "شخصي · عائلي · تطوير", hint: "شيء لكِ أو لمن تحبين." },
];

export default function TodayPage() {
  const now = currentPeriods();
  const day = toISODate(now.today);
  const t = tasksForDay(day);
  const none = !t.today.length && !t.undated.length && !t.earlier.length;
  return (
    <>
      <PageHeader
        eyebrow={`${now.week.label} · ${now.week.range}`}
        title="اليوم"
        english="Today"
        subtitle={formatDayLongAr(now.today)}
      />
      <MainWithRail
        main={
          <>
            <Card className="p-6">
              <SectionTitle meta="الخطوة 1">كيف طاقتك اليوم؟ · Energy</SectionTitle>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(Object.keys(ENERGY) as Energy[]).map((level) => (
                  <div key={level} className="rounded-md border border-border px-4 py-3">
                    <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-ink">
                      <span className={cn("size-2 rounded-full", ENERGY[level].dot)} aria-hidden />
                      {level}
                    </span>
                    <span className="mt-1 block text-xs text-ink-3">{ENERGY[level].meaning}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-2xs text-ink-4">اختيار الطاقة يأتي في المرحلة 3</p>
            </Card>
            <Card className="p-6">
              <SectionTitle meta="الخطوة 2">أهم 3 لليوم · Big 3</SectionTitle>
              <ol className="mt-3 divide-y divide-border">
                {BIG3.map((s) => (
                  <li key={s.n} className="flex items-start gap-4 py-3.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border-strong text-2xs font-medium text-ink-3">{s.n}</span>
                    <span>
                      <span className="block text-sm font-medium text-ink-2">{s.label}</span>
                      <span className="block text-xs text-ink-3">{s.hint}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
            <Section title="المهام · Tasks" meta={<CaptureButton label="مهمة" kind="task" size="sm" />}>
              {none ? (
                <EmptyState compact icon={CheckSquare} title="لا توجد مهام مدوّنة">
                  دوّني مهمة بالاختصار Ctrl K واختاري «مهمة».
                </EmptyState>
              ) : (
                <div className="space-y-5">
                  {t.today.length ? <TaskList items={t.today} testId="tasks-today" /> : null}
                  {t.undated.length ? (
                    <div>
                      <h3 className="text-2xs font-semibold text-ink-3">بلا تاريخ</h3>
                      <TaskList items={t.undated} testId="tasks-undated" />
                    </div>
                  ) : null}
                  {t.earlier.length ? (
                    <div>
                      <h3 className="text-2xs font-semibold text-ink-3">من أيام سابقة، ما زالت مفتوحة</h3>
                      <TaskList items={t.earlier} showDate testId="tasks-earlier" />
                    </div>
                  ) : null}
                  <p className="text-2xs text-ink-4">تخطٍّ بلا لوم · نقل بقصد · إيقاف مؤقت: تأتي في المرحلة 3.</p>
                </div>
              )}
            </Section>
            <Planned title="تطوير اختياري · Optional" empty="لا يوجد شيء اختياري مخطط" icon={Sparkles} phase={3}>
              العناصر الاختيارية تتكيف مع طاقتك: 7 في GREEN، و4 في YELLOW، و1 في RED. غير المنجز منها لا يصبح متأخرًا أبدًا.
            </Planned>
          </>
        }
        rail={
          <>
            <Planned title="الروتين · Routine" empty="لا يوجد روتين بعد" icon={Repeat} phase={5}>روتين الصباح والمساء كخطوات بسيطة.</Planned>
            <EventsSection from={day} to={day} defaultDate={day} title="المواعيد والتواريخ · Today" />
            <Planned title="إغلاق اليوم · Daily Checkout" meta="≤ 2 د" empty="أغلقي اليوم بهدوء" icon={MoonStar} phase={3}>
              تم · تخطٍّ بلا لوم · نقل بقصد · إيقاف مؤقت.
            </Planned>
          </>
        }
      />
    </>
  );
}
