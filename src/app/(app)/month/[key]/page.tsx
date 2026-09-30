import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Flag, NotebookPen, Target, Wallet } from "lucide-react";
import { Section } from "@/components/ui/card";
import { MainWithRail, PageHeader, PeriodNav } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { appConfig } from "@/lib/config";
import { MONTHS, formatRange, monthKey, parseMonthKey, quarterOfMonth, sameDay, shiftMonth, toISODate, weeksOfMonth } from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = parseMonthKey((await params).key);
  return { title: m ? `${MONTHS[m.month]} ${m.year}` : "Month" };
}

export default async function MonthPage({ params }: Props) {
  const m = parseMonthKey((await params).key);
  if (!m) notFound();
  const now = currentPeriods();
  const weeks = weeksOfMonth(m.year, m.month, appConfig.weekStart);
  const prev = shiftMonth(m.year, m.month, -1);
  const next = shiftMonth(m.year, m.month, 1);

  return (
    <>
      <PageHeader
        eyebrow={`${m.year} · Q${quarterOfMonth(m.month)}`}
        title={`${MONTHS[m.month]} ${m.year}`}
        arabic="الشهر"
        subtitle={`${weeks.length} planning weeks · Month Theme not set`}
        action={<PeriodNav prev={`/month/${monthKey(prev.year, prev.month)}`} next={`/month/${monthKey(next.year, next.month)}`} current={now.month.href} />}
      />
      <MainWithRail
        main={
          <>
            <Section title="Weeks in this month" meta="A week belongs to the month holding 4+ of its days">
              <ul className="divide-y divide-border">
                {weeks.map((w) => {
                  const current = sameDay(w.start, now.week.info.start);
                  return (
                    <li key={toISODate(w.start)}>
                      <Link href={`/week/${toISODate(w.start)}`} className="-mx-2 flex items-center gap-4 rounded-md px-2 py-3 hover:bg-surface-2">
                        <span className={cn("w-10 text-sm font-medium tabular-nums", current ? "text-accent-text" : "text-ink")}>W{w.number}</span>
                        <span className="flex-1 text-sm text-ink-2">{formatRange(w.start, w.end)}</span>
                        {current ? <span className="text-2xs font-medium text-accent-text">This week</span> : null}
                        <span className="text-2xs text-ink-4">No outcomes yet</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Section>
            <Planned title="Top Outcomes" meta="3–5" empty="No monthly outcomes yet" icon={Target} phase={2}>
              The few results that would make this month a good month.
            </Planned>
            <Planned title="Milestones" empty="No milestones due this month" icon={Flag} phase={4} />
          </>
        }
        rail={
          <>
            <Planned title="Important Dates" empty="No dates this month" icon={CalendarClock} phase={2} />
            <Planned title="Monthly Review" meta="≤ 60 min" empty="Opens at month end" icon={NotebookPen} phase={8}>
              What worked? What drained me? What should stop, continue or move?
            </Planned>
            <Planned title="Money Review" meta="30 min" empty="Monthly Money Review" icon={Wallet} phase={7} />
          </>
        }
      />
    </>
  );
}
