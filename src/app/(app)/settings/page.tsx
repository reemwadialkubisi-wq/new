import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/card";
import { MainWithRail, PageHeader } from "@/components/ui/page-header";
import { ThemeSwitch } from "@/components/shell/theme";
import { appConfig, authConfigured } from "@/lib/config";
import { WEEKDAYS_AR } from "@/lib/time/calendar";

export const metadata: Metadata = { title: "الإعدادات" };

function Row({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm text-ink">{label}</div>
        {hint ? <div className="text-xs text-ink-3">{hint}</div> : null}
      </div>
      <div className="text-sm text-ink-2">{value}</div>
    </div>
  );
}

export default function SettingsPage() {
  const c = appConfig.capacity;
  return (
    <>
      <PageHeader title="الإعدادات" english="Settings" subtitle="تعديل هذه القيم يأتي مع قاعدة البيانات في المرحلة 2." />
      <MainWithRail
        main={
          <>
            <Section title="التقويم">
              <Row label="بداية الأسبوع" value={WEEKDAYS_AR[appConfig.weekStart]} hint="الجمعة للراحة والمراجعة الأسبوعية." />
              <Row label="المنطقة الزمنية" value={<span dir="ltr">{appConfig.timeZone}</span>} hint="تحدد ما هو «اليوم»." />
              <Row label="الأرقام" value="أرقام غربية (0–9)" />
            </Section>
            <Section title="السعة · Anti-Overload">
              <Row label="الأهداف السنوية النشطة" value={`≤ ${c.activeAnnualGoals}`} />
              <Row label="أهداف الربع" value={`≤ ${c.quarterObjectives}`} />
              <Row label="المشاريع النشطة" value={`≤ ${c.activeProjects}`} />
              <Row label="نتائج الأسبوع" value={`≤ ${c.weeklyOutcomes}`} />
              <Row label="العناصر الاختيارية اليومية" value={`GREEN ${c.optionalDaily.GREEN} · YELLOW ${c.optionalDaily.YELLOW} · RED ${c.optionalDaily.RED}`} />
            </Section>
          </>
        }
        rail={
          <>
            <Section title="المظهر">
              <ThemeSwitch />
            </Section>
            <Section title="الحساب">
              <p className="text-sm text-ink-2">
                {authConfigured ? "خاص. بريدك فقط يمكنه الدخول." : "وضع المعاينة: غير متصلة بقاعدة البيانات بعد، ولا يوجد تسجيل دخول."}
              </p>
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
