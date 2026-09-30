import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CalendarClock, Target, NotebookPen, Hourglass } from "lucide-react";
import { Card, Section, SectionTitle } from "@/components/ui/card";
import { MainWithRail, PageHeader, PeriodNav } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { getSettings } from "@/db/repo";
import {
  MONTHS_AR, WEEKDAYS_AR, addDays, formatRangeAr, parseISODate, sameDay, toISODate, weekInfo,
} from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = parseISODate((await params).date);
  return { title: d ? `الأسبوع ${weekInfo(d, getSettings().weekStart).number}` : "الأسبوع" };
}

const WEEK_AREAS = ["العمل", "الأسرة", "الصحة", "الدكتوراه والمعرفة", "الإنجليزية", "شخصي واجتماعي"];

export default async function WeekPage({ params }: Props) {
  const d = parseISODate((await params).date);
  if (!d) notFound();
  const w = weekInfo(d, getSettings().weekStart);
  if (!sameDay(w.start, d)) redirect(`/week/${toISODate(w.start)}`);
  const now = currentPeriods();
  const days = Array.from({ length: 7 }, (_, i) => addDays(w.start, i));

  return (
    <>
      <PageHeader
        eyebrow={`${w.year} · Q${w.quarter} · ${MONTHS_AR[w.month]}`}
        title={`الأسبوع ${w.number}`}
        english={`W${w.number}`}
        subtitle={
          <>
            {formatRangeAr(w.start, w.end)} {w.end.getUTCFullYear()} · من {WEEKDAYS_AR[w.start.getUTCDay()]} إلى {WEEKDAYS_AR[w.end.getUTCDay()]}
            {w.bridge ? <span className="text-ink-3"> · أسبوع عابر بين Q{w.quarter} وQ{(w.quarter % 4) + 1}</span> : null}
          </>
        }
        action={
          <PeriodNav
            prev={`/week/${toISODate(addDays(w.start, -7))}`}
            next={`/week/${toISODate(addDays(w.start, 7))}`}
            current={now.week.href}
          />
        }
      />

      <Card className="mb-6 overflow-x-auto">
        <ol className="grid min-w-[560px] grid-cols-7 divide-x divide-border">
          {days.map((day) => {
            const isToday = sameDay(day, now.today);
            const isFriday = day.getUTCDay() === 5;
            return (
              <li key={toISODate(day)} className={cn("px-3 py-3", isToday && "bg-accent-soft")}>
                <div className={cn("text-2xs font-medium", isToday ? "text-accent-text" : "text-ink-3")}>
                  {WEEKDAYS_AR[day.getUTCDay()]}
                </div>
                <div className={cn("mt-0.5 text-base tabular-nums", isToday ? "font-semibold text-ink" : "text-ink-2")}>
                  {day.getUTCDate()} <span className="text-xs text-ink-3">{MONTHS_AR[day.getUTCMonth()]}</span>
                </div>
                <div className="mt-1 h-4 text-2xs text-ink-4">{isToday ? "اليوم" : isFriday ? "راحة · مراجعة" : ""}</div>
              </li>
            );
          })}
        </ol>
      </Card>

      <MainWithRail
        main={
          <>
            <Section title="عنوان الأسبوع · Theme">
              <p className="text-sm text-ink-3">لا يوجد عنوان بعد. عبارة قصيرة تحدد روح الأسبوع.</p>
            </Section>
            <Planned title="نتائج الأسبوع · Weekly Outcomes" meta="حتى 5" empty="لا توجد نتائج لهذا الأسبوع" icon={Target} phase={3}>
              نتائج وليست مهام. أسبوع بنسبة 70–80% أسبوع قوي.
            </Planned>
            <Section title="تركيز المجالات · Area Focus">
              <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {WEEK_AREAS.map((a) => (
                  <li key={a} className="flex items-center justify-between border-b border-border py-2.5 text-sm">
                    <span className="text-ink-2">{a}</span>
                    <span className="text-2xs text-ink-4">لم يُحدد</span>
                  </li>
                ))}
              </ul>
            </Section>
          </>
        }
        rail={
          <>
            <Planned title="المواعيد" empty="لا توجد مواعيد هذا الأسبوع" icon={CalendarClock} phase={3} />
            <Planned title="وقت احتياطي · Buffer" empty="لا يوجد وقت احتياطي محجوز" icon={Hourglass} phase={3}>اتركي مساحة لما لا يُتوقع.</Planned>
            <Planned title="المراجعة الأسبوعية · Weekly Review" meta="الجمعة · ≈ 20 د" empty="تُفتح يوم الجمعة" icon={NotebookPen} phase={3}>
              التقدم، الطاقة، الإنجازات، التحديات، ما يتوقف، ما يستمر، أولويات الأسبوع القادم.
            </Planned>
          </>
        }
      />
    </>
  );
}
