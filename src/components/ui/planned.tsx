import type { LucideIcon } from "lucide-react";
import { Section } from "./card";
import { EmptyState } from "./empty-state";

/** A page section whose content arrives in a later phase: titled, with a calm designed empty state. */
export function Planned({
  title, meta, empty, children, phase, icon, className, bare,
}: {
  title: string;
  meta?: React.ReactNode;
  empty: string;
  children?: React.ReactNode;
  phase?: number;
  icon?: LucideIcon;
  className?: string;
  bare?: boolean;
}) {
  return (
    <Section title={title} meta={meta} className={className} bare={bare}>
      <EmptyState compact icon={icon} title={empty} phase={phase}>
        {children}
      </EmptyState>
    </Section>
  );
}
