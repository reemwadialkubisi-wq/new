import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flag, FolderKanban, NotebookPen, Target } from "lucide-react";
import { Section } from "@/components/ui/card";
import { MainWithRail, PageHeader, PeriodNav } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { appConfig } from "@/lib/config";
import { MONTHS, monthKey, parseQuarterKey, quarterKey, shiftQuarter, weeksOfMonth } from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";

type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const q = parseQuarterKey((await params).key);
  return { title: q ? `Q${q.quarter} ${q.year}` : "Quarter" };
}

const FOCUS = ["Health", "Family", "Career", "Academic", "Financial", "Personal"];

export default async function QuarterPage({ params }: Props) {
  const q = parseQuarterKey((await params).key);
  if (!q) notFound();
  const now = currentPeriods();
  const months = [0, 1, 2].map((i) => (q.quarter - 1) * 3 + i);
  const prev = shiftQuarter(q.year, q.quarter, -1);
  const next = shiftQuarter(q.year, q.quarter, 1);

  return (
    <>
      <PageHeader
        eyebrow={String(q.year)}
        title={`Q${q.quarter} ${q.year}`}
        arabic="الربع"
        subtitle={`${MONTHS[months[0]]} – ${MONTHS[months[2]]} · Quarter Theme not set`}
        action={<PeriodNav prev={`/quarter/${quarterKey(prev.year, prev.quarter)}`} next={`/quarter/${quarterKey(next.year, next.quarter)}`} current={now.quarter.href} />}
      />
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {months.map((m) => (
          <Link key={m} href={`/month/${monthKey(q.year, m)}`} className="rounded-lg border border-border bg-surface px-5 py-4 transition-colors hover:border-border-strong">
            <div className="text-base font-medium text-ink">{MONTHS[m]}</div>
            <div className="mt-1 text-xs text-ink-3">{weeksOfMonth(q.year, m, appConfig.weekStart).length} weeks · Theme not set</div>
          </Link>
        ))}
      </div>
      <MainWithRail
        main={
          <>
            <Planned title="Quarter Objectives" meta="max 5" empty="No objectives yet" icon={Target} phase={2}>
              Each objective can link to an annual goal. Status: Active · Planned · Paused · Incubating · Completed.
            </Planned>
            <Planned title="Active Projects" meta="max 3" empty="No active projects" icon={FolderKanban} phase={4} />
            <Planned title="Key Milestones" empty="No milestones this quarter" icon={Flag} phase={4} />
          </>
        }
        rail={
          <>
            <Section title="Area Focus">
              <ul>
                {FOCUS.map((a) => (
                  <li key={a} className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-0">
                    <span className="text-ink-2">{a}</span>
                    <span className="text-2xs text-ink-4">Not set</span>
                  </li>
                ))}
              </ul>
            </Section>
            <Planned title="Quarterly Review" meta="≈ 90 min" empty="Opens at quarter end" icon={NotebookPen} phase={8} />
          </>
        }
      />
    </>
  );
}
