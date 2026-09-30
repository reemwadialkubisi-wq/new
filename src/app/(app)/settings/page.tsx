import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/card";
import { MainWithRail, PageHeader } from "@/components/ui/page-header";
import { ThemeSwitch } from "@/components/shell/theme";
import { appConfig, authConfigured } from "@/lib/config";
import { WEEKDAYS } from "@/lib/time/calendar";

export const metadata: Metadata = { title: "Settings" };

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
      <PageHeader title="Settings" arabic="الإعدادات" subtitle="Editing these values arrives with the database in Phase 2." />
      <MainWithRail
        main={
          <>
            <Section title="Calendar">
              <Row label="Week starts on" value={WEEKDAYS[appConfig.weekStart]} hint="Friday is rest and weekly review." />
              <Row label="Time zone" value={appConfig.timeZone} hint="Decides what “today” is." />
              <Row label="Numbers" value="Western digits (0–9)" />
            </Section>
            <Section title="Capacity (Anti-Overload)">
              <Row label="Active annual goals" value={`≤ ${c.activeAnnualGoals}`} />
              <Row label="Quarter objectives" value={`≤ ${c.quarterObjectives}`} />
              <Row label="Active projects" value={`≤ ${c.activeProjects}`} />
              <Row label="Weekly outcomes" value={`≤ ${c.weeklyOutcomes}`} />
              <Row label="Optional daily items" value={`Green ${c.optionalDaily.GREEN} · Yellow ${c.optionalDaily.YELLOW} · Red ${c.optionalDaily.RED}`} />
            </Section>
          </>
        }
        rail={
          <>
            <Section title="Appearance">
              <ThemeSwitch />
            </Section>
            <Section title="Account">
              <p className="text-sm text-ink-2">
                {authConfigured ? "Private. Only your email can sign in." : "Preview mode: not connected to the database yet, no login."}
              </p>
            </Section>
            <Section title="Design system">
              <Link href="/system" className="text-sm text-accent-text underline decoration-accent decoration-2 underline-offset-4">View tokens and components →</Link>
            </Section>
          </>
        }
      />
    </>
  );
}
