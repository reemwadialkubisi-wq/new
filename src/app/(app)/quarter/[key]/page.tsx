import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Flag, FolderKanban, NotebookPen, Target } from "lucide-react";
import { MainWithRail, PageHeader, PeriodNav } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { EventsSection, FocusSection, PlanSection } from "@/components/plan/sections";
import { getPlan, getPlans, getSettings } from "@/db/repo";
import { START_HREF, beforeStart, periodRef } from "@/lib/periods";
import { MONTHS_AR, monthKey, parseQuarterKey, quarterKey, shiftQuarter, weeksOfMonth } from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const q = parseQuarterKey((await params).key);
  return { title: q ? `Q${q.quarter} ${q.year}` : "الربع" };
}

export default async function QuarterPage({ params }: Props) {
  const ref = periodRef("quarter", (await params).key);
  if (!ref) notFound();
  if (beforeStart(ref.endDate)) redirect(START_HREF.quarter);
  const { year } = ref;
  const quarter = ref.quarter!;
  const settings = getSettings();
  const now = currentPeriods(undefined, settings);
  const archive = year < now.today.getUTCFullYear();
  const months = [0, 1, 2].map((i) => (quarter - 1) * 3 + i);
  const prev = shiftQuarter(year, quarter, -1);
  const next = shiftQuarter(year, quarter, 1);
  const plan = getPlan("quarter", ref.key);
  const monthPlans = getPlans(months.map((m) => monthKey(year, m)));
  const today = now.today.toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        eyebrow={<Link href={`/year/${year}`} className="hover:text-ink">{year}</Link>}
        title={`الربع ${quarter} · ${year}`}
        english={`Q${quarter}`}
        subtitle={`${MONTHS_AR[months[0]]} – ${MONTHS_AR[months[2]]} · ${plan?.theme || "لم يُحدد عنوان الربع بعد"}`}
        action={<PeriodNav prev={beforeStart(periodRef("quarter", quarterKey(prev.year, prev.quarter))!.endDate) ? undefined : `/quarter/${quarterKey(prev.year, prev.quarter)}`} next={`/quarter/${quarterKey(next.year, next.quarter)}`} current={now.quarter.href} />}
      />
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3" data-testid="months">
        {months.map((m) => {
          const mp = monthPlans.get(monthKey(year, m));
          const current = now.month.href === `/month/${monthKey(year, m)}`;
          return (
            <Link
              key={m}
              href={`/month/${monthKey(year, m)}`}
              className={cn("rounded-lg border bg-surface px-5 py-4 transition-colors hover:border-border-strong", current ? "border-accent" : "border-border")}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-medium text-ink">{MONTHS_AR[m]}</span>
                <span className="text-2xs text-ink-3">{weeksOfMonth(year, m, settings.weekStart).length} أسابيع</span>
              </div>
              <div className="mt-1 line-clamp-2 text-xs text-ink-2" dir="auto">{mp?.theme || <span className="text-ink-4">بلا عنوان بعد</span>}</div>
            </Link>
          );
        })}
      </div>
      <MainWithRail
        main={
          <>
            <PlanSection
              level="quarter"
              periodKey={ref.key}
              plan={plan}
              readOnly={archive}
              title="خطة الربع · Quarter Plan"
              labels={{
                theme: "عنوان الربع · Theme",
                themeHint: "مثال: إعادة ضبط · تصميم · استعداد",
                intention: "النية · Intention",
                priorities: "أولويات الربع · Priorities",
                prioritiesHint: `حتى 5. تصبح «أهداف الربع» المرتبطة بالأهداف السنوية في المرحلة 4.`,
              }}
            />
            <Planned title="أهداف الربع · Objectives" meta={`حتى ${settings.capacity.quarterObjectives}`} empty="تُربط بالأهداف السنوية في المرحلة 4" icon={Target} phase={4} />
            <Planned title="المشاريع النشطة" meta={`حتى ${settings.capacity.activeProjects}`} empty="لا توجد مشاريع نشطة" icon={FolderKanban} phase={4} />
            <Planned title="المحطات الرئيسية" empty="لا توجد محطات هذا الربع" icon={Flag} phase={4} />
          </>
        }
        rail={
          <>
            <FocusSection level="quarter" periodKey={ref.key} plan={plan} readOnly={archive} />
            <EventsSection
              from={ref.startDate}
              to={ref.endDate}
              defaultDate={today >= ref.startDate && today <= ref.endDate ? today : ref.startDate}
              readOnly={archive}
            />
            <Planned title="المراجعة الربعية · Quarterly Review" meta="≈ 90 د" empty="تُفتح في نهاية الربع" icon={NotebookPen} phase={8} />
          </>
        }
      />
    </>
  );
}
