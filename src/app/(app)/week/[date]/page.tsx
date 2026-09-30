import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CalendarClock, Target, NotebookPen, Hourglass } from "lucide-react";
import { Card, Section, SectionTitle } from "@/components/ui/card";
import { MainWithRail, PageHeader, PeriodNav } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { appConfig } from "@/lib/config";
import {
  MONTHS, addDays, formatRange, parseISODate, sameDay, shortMonth, shortWeekday, toISODate, weekInfo,
} from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = parseISODate((await params).date);
  return { title: d ? `Week ${weekInfo(d, appConfig.weekStart).number}` : "Week" };
}

const WEEK_AREAS = ["Work", "Family", "Health", "PhD / Knowledge", "English", "Personal / Social"];

export default async function WeekPage({ params }: Props) {
  const d = parseISODate((await params).date);
  if (!d) notFound();
  const w = weekInfo(d, appConfig.weekStart);
  if (!sameDay(w.start, d)) redirect(`/week/${toISODate(w.start)}`);
  const now = currentPeriods();
  const days = Array.from({ length: 7 }, (_, i) => addDays(w.start, i));

  return (
    <>
      <PageHeader
        eyebrow={`${w.year} · Q${w.quarter} · ${MONTHS[w.month]}`}
        title={`Week ${w.number}`}
        arabic="أسبوعي"
        subtitle={
          <>
            {formatRange(w.start, w.end)} {w.end.getUTCFullYear()} · Saturday to Friday
            {w.bridge ? <span className="text-ink-3"> · Bridge week between Q{w.quarter} and Q{(w.quarter % 4) + 1}</span> : null}
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
                <div className={cn("text-2xs font-medium uppercase tracking-[0.08em]", isToday ? "text-accent" : "text-ink-3")}>
                  {shortWeekday(day)}
                </div>
                <div className={cn("mt-0.5 text-base tabular-nums", isToday ? "font-semibold text-ink" : "text-ink-2")}>
                  {day.getUTCDate()} <span className="text-xs text-ink-3">{shortMonth(day.getUTCMonth())}</span>
                </div>
                <div className="mt-1 h-4 text-2xs text-ink-4">{isToday ? "Today" : isFriday ? "Rest · Review" : ""}</div>
              </li>
            );
          })}
        </ol>
      </Card>

      <MainWithRail
        main={
          <>
            <Section title="Weekly Theme">
              <p className="text-sm text-ink-3">No theme yet. One short phrase that sets the tone of the week.</p>
            </Section>
            <Planned title="Weekly Outcomes" meta="max 5" empty="No outcomes for this week" icon={Target} phase={3}>
              Results, not tasks. A week at 70–80% is a strong week.
            </Planned>
            <Section title="Area Focus">
              <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {WEEK_AREAS.map((a) => (
                  <li key={a} className="flex items-center justify-between border-b border-border py-2.5 text-sm">
                    <span className="text-ink-2">{a}</span>
                    <span className="text-2xs text-ink-4">Not set</span>
                  </li>
                ))}
              </ul>
            </Section>
          </>
        }
        rail={
          <>
            <Planned title="Appointments" empty="No appointments this week" icon={CalendarClock} phase={3} />
            <Planned title="Buffer" empty="No buffer reserved" icon={Hourglass} phase={3}>Keep space for the unexpected.</Planned>
            <Planned title="Weekly Review" meta="Friday · ≈ 20 min" empty="Opens on Friday" icon={NotebookPen} phase={3}>
              Progress, energy, wins, challenges, stop, continue, next week's priorities.
            </Planned>
          </>
        }
      />
    </>
  );
}
