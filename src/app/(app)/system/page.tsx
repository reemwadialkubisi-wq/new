import type { Metadata } from "next";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { EnergyChip, Kbd, Progress, SignalDot, StatusBadge, TierBadge } from "@/components/ui/status";

export const metadata: Metadata = { title: "Design System" };

const COLORS = [
  ["bg", "Page"], ["surface", "Surface"], ["surface-2", "Surface 2"], ["border", "Border"],
  ["ink", "Ink"], ["ink-2", "Ink 2"], ["ink-3", "Ink 3"], ["accent", "Accent · teal"],
  ["green", "Energy · sage"], ["yellow", "Energy · amber"], ["red", "Energy · clay"], ["accent-soft", "Accent soft"],
];

export default function SystemPage() {
  return (
    <>
      <PageHeader eyebrow="Settings" title="Design System" subtitle="The single source for every page: tokens, type and components." />
      <div className="space-y-6">
        <Section title="Colour tokens" meta="Switch theme to see dark values">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {COLORS.map(([token, label]) => (
              <li key={token}>
                <div className="h-14 rounded-md border border-border" style={{ background: `var(--${token})` }} />
                <div className="mt-1.5 text-xs text-ink-2">{label}</div>
                <div className="text-2xs text-ink-4">--{token}</div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Typography" meta="Newsreader · IBM Plex Sans · IBM Plex Sans Arabic">
          <div className="space-y-4">
            <p className="font-display text-2xl">Where am I, and what matters now?</p>
            <p className="font-display text-xl">Q4 · Reset, Design, Prepare</p>
            <p className="text-lg font-medium">Section heading 20</p>
            <p className="text-base">Body 16. Sustainable progress, not perfect completion.</p>
            <p className="text-sm text-ink-2">Body 14 (default UI). Week 40 · 3–9 Oct 2026 · 90 readings</p>
            <p lang="ar" dir="rtl" className="font-arabic text-base">النجاح هو التقدم المستدام، وليس الإنجاز الكامل. الأسبوع 40 · 3–9 أكتوبر 2026</p>
          </div>
        </Section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section title="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button>Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="quiet">Quiet link</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button size="sm">Small</Button>
            </div>
          </Section>
          <Section title="Status & signals">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2"><EnergyChip level="GREEN" /><EnergyChip level="YELLOW" /><EnergyChip level="RED" /><EnergyChip level={null} /></div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="active" /><StatusBadge status="planned" /><StatusBadge status="paused" />
                <StatusBadge status="incubating" /><StatusBadge status="completed" /><StatusBadge status="archived" />
              </div>
              <div className="flex flex-wrap gap-2"><TierBadge tier="must" /><TierBadge tier="should" /><TierBadge tier="could" /></div>
              <div className="flex flex-wrap gap-5"><SignalDot signal="on-track" /><SignalDot signal="needs-attention" /><SignalDot signal="resting" /></div>
              <Progress value={62} label="Example progress" />
              <div className="flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
            </div>
          </Section>
          <Section title="Forms">
            <div className="space-y-4">
              <Field label="Weekly outcome" htmlFor="ds-outcome" hint="A result, not a task. Arabic or English.">
                <Input id="ds-outcome" placeholder="Map requirements for the 3 licences" />
              </Field>
              <Field label="Month theme" htmlFor="ds-theme" error="Please keep the theme under 40 characters.">
                <Input id="ds-theme" aria-invalid defaultValue="إعادة ضبط الإيقاع اليومي وبناء الأساس للربع القادم" />
              </Field>
              <Field label="Life area" htmlFor="ds-area">
                <Select id="ds-area" defaultValue="phd"><option value="phd">PhD & Academic</option><option value="family">Family</option></Select>
              </Field>
              <Field label="Note" htmlFor="ds-note"><Textarea id="ds-note" placeholder="…" /></Field>
            </div>
          </Section>
          <Section title="Empty state">
            <EmptyState icon={Target} title="No outcomes for this week" phase={3}>
              Calm and useful: what will live here, never “nothing done”.
            </EmptyState>
          </Section>
        </div>

        <Card className="p-6">
          <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-ink-3">Layout</p>
          <p className="mt-2 text-sm text-ink-2">
            Sidebar 248px (72px rail) · content max 1200px · 12-column grid, 8 / 4 main and context · spacing on a 4px scale ·
            page padding 40px desktop, 16px phone · breakpoints 768 / 1024.
          </p>
        </Card>
      </div>
    </>
  );
}
