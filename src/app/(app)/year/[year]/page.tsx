import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flag, FolderKanban, NotebookPen, Target } from "lucide-react";
import { MainWithRail, PageHeader, PeriodNav } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { EventsSection, FocusSection, PlanSection } from "@/components/plan/sections";
import { PLAN_STATUS_LABELS } from "@/components/plan/labels";
import { getPlan, getPlans, plannedYears } from "@/db/repo";
import { periodRef } from "@/lib/periods";
import { MONTHS_AR, quarterKey } from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ year: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `الخطة السنوية ${(await params).year}` };
}

export default async function YearPage({ params }: Props) {
  const ref = periodRef("year", (await params).year);
  if (!ref) notFound();
  const year = ref.year;
  const now = currentPeriods();
  const thisYear = now.today.getUTCFullYear();
  const archive = year < thisYear;
  const years = [...new Set([thisYear - 1, thisYear, thisYear + 1, thisYear + 2, ...plannedYears()])].sort();
  const plan = getPlan("year", ref.key);
  const quarters = getPlans([1, 2, 3, 4].map((q) => quarterKey(year, q)));

  return (
    <>
      <PageHeader
        eyebrow={archive ? "الأرشيف · للقراءة فقط" : year === thisYear ? "السنة الحالية" : "سنة قادمة"}
        title={`الخطة السنوية ${year}`}
        english="Annual Plan"
        subtitle={plan?.theme || "لم يُحدد عنوان السنة بعد"}
        action={<PeriodNav prev={`/year/${year - 1}`} next={`/year/${year + 1}`} current={now.year.href} />}
      />
      <nav aria-label="السنوات" className="mb-6 flex flex-wrap gap-1.5">
        {years.map((y) => (
          <Link
            key={y}
            href={`/year/${y}`}
            aria-current={y === year ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-medium tabular-nums",
              y === year ? "border-ink bg-ink text-bg" : "border-border text-ink-2 hover:bg-surface-2",
            )}
          >
            {y}
            {y < thisYear ? <span className={cn("ms-1.5", y === year ? "text-bg/70" : "text-ink-4")}>أرشيف</span> : null}
          </Link>
        ))}
      </nav>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="quarters">
        {[1, 2, 3, 4].map((q) => {
          const qp = quarters.get(quarterKey(year, q));
          const current = year === thisYear && q === now.quarter.number;
          return (
            <Link
              key={q}
              href={`/quarter/${quarterKey(year, q)}`}
              className={cn(
                "flex min-h-24 flex-col rounded-lg border bg-surface px-5 py-4 transition-colors hover:border-border-strong",
                current ? "border-accent" : "border-border",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-medium text-ink">Q{q}</span>
                <span className="text-2xs text-ink-3">{MONTHS_AR[(q - 1) * 3]} – {MONTHS_AR[(q - 1) * 3 + 2]}</span>
              </div>
              <span className="mt-2 line-clamp-2 text-xs text-ink-2" dir="auto">{qp?.theme || <span className="text-ink-4">بلا عنوان بعد</span>}</span>
              {qp ? <span className="mt-auto pt-2 text-2xs text-ink-3">{PLAN_STATUS_LABELS[qp.status]}</span> : null}
            </Link>
          );
        })}
      </div>
      <MainWithRail
        main={
          <>
            <PlanSection
              level="year"
              periodKey={ref.key}
              plan={plan}
              readOnly={archive}
              title="الرؤية والاتجاه · Vision"
              labels={{
                theme: "عنوان السنة · Theme",
                themeHint: "كلمة أو عبارة قصيرة توجه السنة.",
                intention: "الرؤية والاتجاه · Vision",
                priorities: "أولويات السنة · Top Priorities",
                prioritiesHint: "حتى 5. الأهداف السنوية تأتي في المرحلة 4.",
              }}
            />
            <Planned title="الأهداف السنوية · Annual Goals" meta="حتى 5 نشطة" empty="لا توجد أهداف سنوية بعد" icon={Target} phase={4}>
              الأهداف لا تتحول إلى مهام يومية تلقائيًا أبدًا.
            </Planned>
            <Planned title="المشاريع الكبرى" empty="لا توجد مشاريع كبرى بعد" icon={FolderKanban} phase={4} />
          </>
        }
        rail={
          <>
            <EventsSection from={ref.startDate} to={ref.endDate} defaultDate={year === thisYear ? now.today.toISOString().slice(0, 10) : ref.startDate} readOnly={archive} />
            <FocusSection level="year" periodKey={ref.key} plan={plan} readOnly={archive} />
            <Planned title="المحطات الرئيسية · Milestones" empty="لا توجد محطات بعد" icon={Flag} phase={4} />
            <Planned title="المراجعة السنوية · Annual Review" meta="≈ 2 س" empty="تُفتح في ديسمبر" icon={NotebookPen} phase={8} />
          </>
        }
      />
    </>
  );
}
