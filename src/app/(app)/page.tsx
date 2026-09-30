import Link from "next/link";
import { CalendarClock, Target } from "lucide-react";
import { Card, Section, SectionTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ENERGY, Progress, SignalDot, type Energy } from "@/components/ui/status";
import { Planned } from "@/components/ui/planned";
import { CaptureBar } from "@/components/shell/capture-bar";
import { LIFE_AREAS } from "@/lib/areas";
import { getSettings } from "@/db/repo";
import { formatDayLongAr } from "@/lib/time/calendar";
import { currentPeriods } from "@/lib/time/current";
import { cn } from "@/lib/utils";

function greeting(timeZone: string) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone }).format(new Date()));
  return hour < 12 ? "صباح الخير" : "مساء الخير";
}

const BIG3 = ["الأساسي · Essential", "النتيجة الأهم · Most Important Outcome", "شخصي · عائلي · تطوير"];

export default function HomePage() {
  const now = currentPeriods();
  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting(getSettings().timeZone)} يا ريم`}
        subtitle={
          <>
            {formatDayLongAr(now.today)}
            <span className="text-ink-4"> · </span>
            <bdi>{now.quarter.label}</bdi> · {now.month.label} · <bdi>{now.week.label}</bdi> ({now.week.range})
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Today */}
        <Card className="p-6 lg:col-span-8">
          <SectionTitle meta={<Link href="/today" className="hover:text-ink">فتح اليوم ←</Link>}>طاقة اليوم · Energy</SectionTitle>
          <div className="mt-4 grid grid-cols-3 gap-2" role="list" aria-label="مستويات الطاقة">
            {(Object.keys(ENERGY) as Energy[]).map((level) => (
              <Link
                key={level}
                href="/today"
                role="listitem"
                className="group rounded-md border border-border px-3 py-2.5 transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-ink">
                  <span className={cn("size-2 rounded-full", ENERGY[level].dot)} aria-hidden />
                  {level}
                </span>
                <span className="mt-0.5 block text-2xs text-ink-3">{ENERGY[level].meaning}</span>
              </Link>
            ))}
          </div>

          <SectionTitle className="mt-8">أهم 3 لليوم · Big 3</SectionTitle>
          <ol className="mt-3 divide-y divide-border">
            {BIG3.map((slot, i) => (
              <li key={slot} className="flex items-center gap-4 py-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border-strong text-2xs font-medium text-ink-3">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-ink-3">{slot}</span>
                <span className="text-2xs text-ink-4">لم تُختر بعد</span>
              </li>
            ))}
          </ol>
        </Card>

        <Planned className="lg:col-span-4" title="نتائج هذا الأسبوع · Weekly Outcomes" meta={now.week.label} empty="لا توجد نتائج لهذا الأسبوع بعد" icon={Target} phase={3}>
          حتى 5 نتائج للأسبوع، تُختار يوم الجمعة أو السبت.
        </Planned>

        <Planned className="lg:col-span-8" title={`أهداف ${now.quarter.label} · Objectives`} empty="لا توجد أهداف لهذا الربع بعد" phase={2}>
          حتى 5 أهداف في خطة الربع. التقدم يأتي من المحطات الرئيسية، لا من عدد المهام.
        </Planned>

        <Planned className="lg:col-span-4" title="مواعيد قادمة" empty="لا توجد مواعيد مهمة قادمة" icon={CalendarClock} phase={2}>
          تظهر هنا المواعيد والتواريخ المهمة والمواعيد النهائية.
        </Planned>

        <Section className="lg:col-span-8" title="حالة مجالات الحياة" meta={<Link href="/areas" className="hover:text-ink">كل المجالات ←</Link>}>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {LIFE_AREAS.map((a) => (
              <li key={a.slug} className="flex items-center justify-between gap-3">
                <Link href={a.href} className="truncate text-sm text-ink-2 hover:text-ink">{a.name}</Link>
                <SignalDot signal={null} withLabel={false} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-2xs text-ink-4">إشارات هادئة فقط: على المسار · يحتاج انتباهًا · في استراحة. بلا درجات.</p>
        </Section>

        <Section className="lg:col-span-4" title={`التقدم السنوي ${now.year.label}`}>
          <Progress value={null} label="التقدم السنوي" />
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
            <span className="text-ink-3">الحمل · Load</span>
            <span className="text-ink-2">لم يُقَس بعد</span>
          </div>
        </Section>
      </div>

      <CaptureBar />
    </div>
  );
}
