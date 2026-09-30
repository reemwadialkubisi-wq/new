import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Section } from "@/components/ui/card";
import { MainWithRail, PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/shell/theme";
import { EditableSection } from "@/components/plan/forms";
import { SettingsForm } from "@/components/plan/plan-forms";
import { saveSettingsAction } from "../actions";
import { databasePath } from "@/db";
import { getSettings } from "@/db/repo";
import { authConfigured } from "@/lib/config";
import { WEEKDAYS_AR } from "@/lib/time/calendar";

export const metadata: Metadata = { title: "الإعدادات" };

function Row({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm text-ink">{label}</div>
        {hint ? <div className="text-xs text-ink-3">{hint}</div> : null}
      </div>
      <div className="text-sm text-ink-2" data-testid={`setting-${label}`}>{value}</div>
    </div>
  );
}

export default function SettingsPage() {
  const s = getSettings();
  const c = s.capacity;
  return (
    <>
      <PageHeader title="الإعدادات" english="Settings" subtitle="التقويم وحدود السعة. التغيير يسري على كل الصفحات فورًا." />
      <MainWithRail
        main={
          <EditableSection
            title="التقويم والسعة"
            view={
              <>
                <Row label="بداية الأسبوع" value={WEEKDAYS_AR[s.weekStart]} hint="الأسبوع ينتمي للشهر الذي يضم 4 أيام أو أكثر منه." />
                <Row label="المنطقة الزمنية" value={<span dir="ltr">{s.timeZone}</span>} hint="تحدد ما هو «اليوم»." />
                <Row label="الأرقام" value="أرقام غربية (0–9)" />
                <Row label="الأهداف السنوية النشطة" value={`≤ ${c.activeAnnualGoals}`} />
                <Row label="أهداف الربع" value={`≤ ${c.quarterObjectives}`} />
                <Row label="المشاريع النشطة" value={`≤ ${c.activeProjects}`} />
                <Row label="نتائج الأسبوع" value={`≤ ${c.weeklyOutcomes}`} />
                <Row
                  label="العناصر الاختيارية اليومية"
                  value={<span dir="ltr">GREEN {c.optionalDaily.GREEN} · YELLOW {c.optionalDaily.YELLOW} · RED {c.optionalDaily.RED}</span>}
                />
              </>
            }
            form={<SettingsForm action={saveSettingsAction} initial={s} />}
          />
        }
        rail={
          <>
            <Section title="المظهر">
              <ThemeSwitch />
            </Section>
            <Section title="بياناتك · Data">
              <p className="text-sm text-ink-2">
                {authConfigured ? "خاص. بريدك فقط يمكنه الدخول." : "محفوظة على هذا الجهاز فقط، ولا تُرفع إلى أي مكان."}
              </p>
              <p className="mt-2 break-all text-2xs text-ink-4" dir="ltr">{databasePath()}</p>
              <a href="/api/backup" download className={buttonVariants({ variant: "secondary", size: "sm", className: "mt-4" })}>
                <Download aria-hidden /> تنزيل نسخة احتياطية
              </a>
              <p className="mt-2 text-xs text-ink-3">ملف JSON بكل خططك وتواريخك. احفظيه في مكان آمن من حين لآخر.</p>
            </Section>
            <Section title="الجدول اليومي · Routine">
              <p className="text-sm text-ink-2">يومك من 5:00 إلى 22:00 كقائمة ✓ في صفحة اليوم.</p>
              <Link href="/settings/routine" className="mt-2 inline-block text-sm text-accent-text underline decoration-accent decoration-2 underline-offset-4">تعديل الجدول ←</Link>
            </Section>
            <Section title="نظام التصميم">
              <Link href="/system" className="text-sm text-accent-text underline decoration-accent decoration-2 underline-offset-4">عرض الألوان والمكونات ←</Link>
            </Section>
          </>
        }
      />
    </>
  );
}
