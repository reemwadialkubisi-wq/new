import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Flag, FolderKanban, NotebookPen, Target, Compass } from "lucide-react";
import { Section } from "@/components/ui/card";
import { MainWithRail, PageHeader, PeriodNav } from "@/components/ui/page-header";
import { Planned } from "@/components/ui/planned";
import { Progress } from "@/components/ui/status";
import { MONTHS_AR, parseYear, quarterKey } from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ year: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `الخطة السنوية ${(await params).year}` };
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
        eyebrow={year < thisYear ? "الأرشيف · للقراءة فقط" : year === thisYear ? "السنة الحالية" : "سنة قادمة"}
        title={`الخطة السنوية ${year}`}
        english="Annual Plan"
        subtitle="لم يُحدد عنوان السنة بعد"
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
            {y < thisYear ? <span className="ms-1.5 text-ink-4">أرشيف</span> : null}
          </Link>
        ))}
      </nav>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((q) => (
          <Link key={q} href={`/quarter/${quarterKey(year, q)}`} className="rounded-lg border border-border bg-surface px-5 py-4 transition-colors hover:border-border-strong">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-medium text-ink">Q{q}</span>
              <span className="text-2xs text-ink-3">{MONTHS_AR[(q - 1) * 3]} – {MONTHS_AR[(q - 1) * 3 + 2]}</span>
            </div>
            <Progress value={null} label={`تقدم Q${q}`} className="mt-3" />
          </Link>
        ))}
      </div>
      <MainWithRail
        main={
          <>
            <Planned title="الرؤية والاتجاه · Vision" empty="لا يوجد اتجاه سنوي بعد" icon={Compass} phase={2}>
              عنوان السنة والرؤية والأولويات: الكلمات القليلة التي توجه السنة.
            </Planned>
            <Planned title="الأهداف السنوية · Annual Goals" meta="حتى 5 نشطة" empty="لا توجد أهداف سنوية بعد" icon={Target} phase={4}>
              الأهداف لا تتحول إلى مهام يومية تلقائيًا أبدًا.
            </Planned>
            <Planned title="المشاريع الكبرى" empty="لا توجد مشاريع كبرى بعد" icon={FolderKanban} phase={4} />
          </>
        }
        rail={
          <>
            <Planned title="المحطات الرئيسية · Milestones" empty="لا توجد محطات بعد" icon={Flag} phase={4} />
            <Planned title="تواريخ مهمة" empty="لا توجد تواريخ مهمة بعد" icon={CalendarClock} phase={2} />
            <Section title="تركيز مجالات الحياة">
              <p className="text-sm text-ink-3">أي المجالات تقود هذه السنة وأيها يستريح. يُحدد في المرحلة 2.</p>
            </Section>
            <Planned title="المراجعة السنوية · Annual Review" meta="≈ 2 س" empty="تُفتح في ديسمبر" icon={NotebookPen} phase={8} />
          </>
        }
      />
    </>
  );
}
