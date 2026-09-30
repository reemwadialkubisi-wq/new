import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Flag, FolderKanban, NotebookPen, Target, Compass } from "lucide-react";
import { Section } from "@/components/ui/card";
import { MainWithRail, PageHeader, PeriodNav } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { Progress } from "@/components/ui/status";
import { MONTHS, parseYear, quarterKey } from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ year: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Annual Plan ${(await params).year}` };
}

export default async function YearPage({ params }: Props) {
  const year = parseYear((await params).year);
  if (!year) notFound();
  const now = currentPeriods();
  const thisYear = now.today.getUTCFullYear();
  const years = [thisYear - 1, thisYear, thisYear + 1, thisYear + 2];

  return (
    <>
      <PageHeader
        eyebrow={year < thisYear ? "Archive · read only" : year === thisYear ? "Current year" : "Future year"}
        title={`Annual Plan ${year}`}
        arabic="الخطة السنوية"
        subtitle="Annual Theme not set"
        action={<PeriodNav prev={`/year/${year - 1}`} next={`/year/${year + 1}`} current={now.year.href} />}
      />
      <nav aria-label="Years" className="mb-6 flex flex-wrap gap-1.5">
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
            {y < thisYear ? <span className="ml-1.5 text-ink-4">archive</span> : null}
          </Link>
        ))}
      </nav>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((q) => (
          <Link key={q} href={`/quarter/${quarterKey(year, q)}`} className="rounded-lg border border-border bg-surface px-5 py-4 transition-colors hover:border-border-strong">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-medium text-ink">Q{q}</span>
              <span className="text-2xs text-ink-3">{MONTHS[(q - 1) * 3].slice(0, 3)} – {MONTHS[(q - 1) * 3 + 2].slice(0, 3)}</span>
            </div>
            <Progress value={null} label={`Q${q} progress`} className="mt-3" />
          </Link>
        ))}
      </div>
      <MainWithRail
        main={
          <>
            <Planned title="Vision & Direction" empty="No annual direction yet" icon={Compass} phase={2}>
              Annual Theme, Vision and Top Priorities: the few words that guide the year.
            </Planned>
            <Planned title="Annual Goals" meta="max 5 active" empty="No annual goals yet" icon={Target} phase={4}>
              Goals are never turned into daily tasks automatically.
            </Planned>
            <Planned title="Major Projects" empty="No major projects yet" icon={FolderKanban} phase={4} />
          </>
        }
        rail={
          <>
            <Planned title="Key Milestones" empty="No milestones yet" icon={Flag} phase={4} />
            <Planned title="Important Dates" empty="No important dates yet" icon={CalendarClock} phase={2} />
            <Section title="Life Areas focus">
              <p className="text-sm text-ink-3">Which areas lead this year and which rest. Set in Phase 2.</p>
            </Section>
            <Planned title="Annual Review" meta="≈ 2 h" empty="Opens in December" icon={NotebookPen} phase={8} />
          </>
        }
      />
    </>
  );
}
