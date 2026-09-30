import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Flag, NotebookPen, Wallet } from "lucide-react";
import { Section } from "@/components/ui/card";
import { MainWithRail, PageHeader, PeriodNav } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { EventsSection, FocusSection, PlanSection } from "@/components/plan/sections";
import { getPlan, getSettings } from "@/db/repo";
import { START_HREF, beforeStart, periodRef } from "@/lib/periods";
import { MONTHS, MONTHS_AR, formatRangeAr, monthKey, parseMonthKey, quarterOfMonth, sameDay, shiftMonth, toISODate, weeksOfMonth } from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = parseMonthKey((await params).key);
  return { title: m ? `${MONTHS_AR[m.month]} ${m.year}` : "الشهر" };
}

export default async function MonthPage({ params }: Props) {
  const key = (await params).key;
  const m = parseMonthKey(key);
  const ref = periodRef("month", key);
  if (!m || !ref) notFound();
  if (beforeStart(ref.endDate)) redirect(START_HREF.month);
  const settings = getSettings();
  const now = currentPeriods(undefined, settings);
  const archive = m.year < now.today.getUTCFullYear();
  const weeks = weeksOfMonth(m.year, m.month, settings.weekStart);
  const plan = getPlan("month", ref.key);
  const today = now.today.toISOString().slice(0, 10);
  const prev = shiftMonth(m.year, m.month, -1);
  const next = shiftMonth(m.year, m.month, 1);

  return (
    <>
      <PageHeader
        eyebrow={<><Link href={`/year/${m.year}`} className="hover:text-ink">{m.year}</Link> · <Link href={`/quarter/${m.year}-q${quarterOfMonth(m.month)}`} className="hover:text-ink">Q{quarterOfMonth(m.month)}</Link></>}
        title={`${MONTHS_AR[m.month]} ${m.year}`}
        english={MONTHS[m.month]}
        subtitle={`${weeks.length} أسابيع تخطيط · ${plan?.theme || "لم يُحدد عنوان الشهر بعد"}`}
        action={<PeriodNav prev={beforeStart(periodRef("month", monthKey(prev.year, prev.month))!.endDate) ? undefined : `/month/${monthKey(prev.year, prev.month)}`} next={`/month/${monthKey(next.year, next.month)}`} current={now.month.href} />}
      />
      <MainWithRail
        main={
          <>
            <PlanSection
              level="month"
              periodKey={ref.key}
              plan={plan}
              readOnly={archive}
              title="خطة الشهر · Month Plan"
              labels={{
                theme: "عنوان الشهر · Theme",
                themeHint: "مثال: أكتوبر = إعادة ضبط",
                intention: "النية · Intention",
                priorities: "أهم النتائج · Top Outcomes",
                prioritiesHint: "3 إلى 5 نتائج تجعل هذا الشهر شهرًا جيدًا.",
              }}
            />
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
            <Planned title="المحطات الرئيسية · Milestones" empty="لا توجد محطات مستحقة هذا الشهر" icon={Flag} phase={4} />
          </>
        }
        rail={
          <>
            <EventsSection
              from={ref.startDate}
              to={ref.endDate}
              defaultDate={today >= ref.startDate && today <= ref.endDate ? today : ref.startDate}
              readOnly={archive}
            />
            <FocusSection level="month" periodKey={ref.key} plan={plan} readOnly={archive} />
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
