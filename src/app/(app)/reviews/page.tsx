import type { Metadata } from "next";
import Link from "next/link";
import { History } from "lucide-react";
import { Section } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MainWithRail, PageHeader } from "@/components/ui/page-header";
import { currentPeriods } from "@/lib/time/current";

export const metadata: Metadata = { title: "المراجعات" };

export default function ReviewsPage() {
  const now = currentPeriods();
  const reviews = [
    { name: "إغلاق اليوم · Daily Checkout", time: "≤ 2 د", where: "اليوم", href: "/today" },
    { name: "المراجعة الأسبوعية", time: "≈ 20 د", where: `${now.week.label} · الجمعة`, href: now.week.href },
    { name: "المراجعة الشهرية", time: "≤ 60 د", where: now.month.label, href: now.month.href },
    { name: "المراجعة الربعية", time: "≈ 90 د", where: now.quarter.label, href: now.quarter.href },
    { name: "المراجعة السنوية", time: "≈ 2 س", where: now.year.label, href: now.year.href },
  ];
  return (
    <>
      <PageHeader
        title="المراجعات"
        english="Reviews"
        subtitle="المراجعة لاتخاذ القرار، لا لمحاسبة النفس. كل مراجعة تُكتب في صفحة فترتها."
      />
      <MainWithRail
        main={
          <Section title="السجل">
            <EmptyState compact icon={History} title="لم تُكتب أي مراجعة بعد" phase={8}>
              ستظهر هنا كل مراجعة والقرارات التي اتخذتها: استمرار، توقف، نقل، إيقاف مؤقت.
            </EmptyState>
          </Section>
        }
        rail={
          <Section title="إيقاع المراجعات">
            <ul className="divide-y divide-border">
              {reviews.map((r) => (
                <li key={r.name}>
                  <Link href={r.href} className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 hover:bg-surface-2">
                    <span>
                      <span className="block text-sm text-ink">{r.name}</span>
                      <span className="block text-2xs text-ink-3">{r.where}</span>
                    </span>
                    <span className="text-2xs text-ink-4">{r.time}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        }
      />
    </>
  );
}
