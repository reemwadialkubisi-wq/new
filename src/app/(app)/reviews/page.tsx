import type { Metadata } from "next";
import Link from "next/link";
import { History } from "lucide-react";
import { Section } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MainWithRail, PageHeader } from "@/components/ui/page-header";
import { currentPeriods } from "@/lib/time/current";

export const metadata: Metadata = { title: "Reviews" };

export default function ReviewsPage() {
  const now = currentPeriods();
  const reviews = [
    { name: "Daily Checkout", time: "≤ 2 min", where: "Today", href: "/today" },
    { name: "Weekly Review", time: "≈ 20 min", where: `${now.week.label} · Friday`, href: now.week.href },
    { name: "Monthly Review", time: "≤ 60 min", where: now.month.label, href: now.month.href },
    { name: "Quarterly Review", time: "≈ 90 min", where: now.quarter.label, href: now.quarter.href },
    { name: "Annual Review", time: "≈ 2 h", where: now.year.label, href: now.year.href },
  ];
  return (
    <>
      <PageHeader
        title="Reviews"
        arabic="المراجعات"
        subtitle="Reviews are for decisions, not for judging yourself. Each one is written on its period page."
      />
      <MainWithRail
        main={
          <Section title="History">
            <EmptyState compact icon={History} title="No reviews written yet" phase={8}>
              Every review and the decisions it made (continue, stop, move, pause) will be listed here.
            </EmptyState>
          </Section>
        }
        rail={
          <Section title="Review rhythm">
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
