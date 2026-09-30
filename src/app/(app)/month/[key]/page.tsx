import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Flag, NotebookPen, Target, Wallet } from "lucide-react";
import { Section } from "@/components/ui/card";
import { MainWithRail, PageHeader, PeriodNav } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { appConfig } from "@/lib/config";
import { MONTHS, MONTHS_AR, formatRangeAr, monthKey, parseMonthKey, quarterOfMonth, sameDay, shiftMonth, toISODate, weeksOfMonth } from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = parseMonthKey((await params).key);
  return { title: m ? `${MONTHS_AR[m.month]} ${m.year}` : "الشهر" };
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
        title={`${MONTHS_AR[m.month]} ${m.year}`}
        english={MONTHS[m.month]}
        subtitle={`${weeks.length} أسابيع تخطيط · لم يُحدد عنوان الشهر بعد`}
        action={<PeriodNav prev={`/month/${monthKey(prev.year, prev.month)}`} next={`/month/${monthKey(next.year, next.month)}`} current={now.month.href} />}
      />
      <MainWithRail
        main={
          <>
            <Section title="أسابيع هذا الشهر" meta="الأسبوع ينتمي للشهر الذي يضم 4 أيام أو أكثر منه">
              <ul className="divide-y divide-border">
                {weeks.map((w) => {
                  const current = sameDay(w.start, now.week.info.start);
                  return (
                    <li key={toISODate(w.start)}>
                      <Link href={`/week/${toISODate(w.start)}`} className="-mx-2 flex items-center gap-4 rounded-md px-2 py-3 hover:bg-surface-2">
                        <span className={cn("w-10 text-sm font-medium tabular-nums", current ? "text-accent-text" : "text-ink")}>W{w.number}</span>
                        <span className="flex-1 text-sm text-ink-2">{formatRangeAr(w.start, w.end)}</span>
                        {current ? <span className="text-2xs font-medium text-accent-text">هذا الأسبوع</span> : null}
                        <span className="text-2xs text-ink-4">لا نتائج بعد</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Section>
            <Planned title="أهم النتائج · Top Outcomes" meta="3–5" empty="لا توجد نتائج شهرية بعد" icon={Target} phase={2}>
              النتائج القليلة التي تجعل هذا الشهر شهرًا جيدًا.
            </Planned>
            <Planned title="المحطات الرئيسية · Milestones" empty="لا توجد محطات مستحقة هذا الشهر" icon={Flag} phase={4} />
          </>
        }
        rail={
          <>
            <Planned title="تواريخ مهمة" empty="لا توجد تواريخ هذا الشهر" icon={CalendarClock} phase={2} />
            <Planned title="المراجعة الشهرية · Monthly Review" meta="≤ 60 د" empty="تُفتح في نهاية الشهر" icon={NotebookPen} phase={8}>
              ما الذي نجح؟ ما الذي استنزفني؟ ما الذي يتوقف أو يستمر أو ينتقل؟
            </Planned>
            <Planned title="المراجعة المالية · Money Review" meta="30 د" empty="المراجعة المالية الشهرية" icon={Wallet} phase={7} />
          </>
        }
      />
    </>
  );
}
