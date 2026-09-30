import { cn } from "@/lib/utils";

/* ---------- Energy (GREEN / YELLOW / RED) ---------- */

export type Energy = "GREEN" | "YELLOW" | "RED";

export const ENERGY: Record<Energy, { label: string; meaning: string; dot: string; soft: string; text: string }> = {
  GREEN: { label: "Green", meaning: "Normal plan", dot: "bg-green", soft: "bg-green-soft", text: "text-green" },
  YELLOW: { label: "Yellow", meaning: "Reduce optional load", dot: "bg-yellow", soft: "bg-yellow-soft", text: "text-yellow" },
  RED: { label: "Red", meaning: "Essentials only", dot: "bg-red", soft: "bg-red-soft", text: "text-red" },
};

export function EnergyChip({ level, className }: { level: Energy | null; className?: string }) {
  if (!level)
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-dashed border-border-strong px-2.5 py-0.5 text-2xs font-medium text-ink-3", className)}>
        <span className="size-1.5 rounded-full bg-ink-4" aria-hidden />
        <span className="max-sm:sr-only">Energy not set</span>
      </span>
    );
  const e = ENERGY[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-semibold tracking-wide", e.soft, e.text, className)}>
      <span className={cn("size-1.5 rounded-full", e.dot)} aria-hidden />
      {level}
    </span>
  );
}

/* ---------- Life Area signal (never a score) ---------- */

export type AreaSignal = "on-track" | "needs-attention" | "resting";
const SIGNAL: Record<AreaSignal, { label: string; dot: string }> = {
  "on-track": { label: "On track", dot: "bg-green" },
  "needs-attention": { label: "Needs attention", dot: "bg-yellow" },
  resting: { label: "Resting", dot: "bg-ink-4" },
};

export function SignalDot({ signal, withLabel = true }: { signal: AreaSignal | null; withLabel?: boolean }) {
  const s = signal ? SIGNAL[signal] : { label: "No signal yet", dot: "border border-ink-4 bg-transparent" };
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink-2">
      <span className={cn("size-2 rounded-full", s.dot)} aria-hidden />
      {withLabel ? s.label : <span className="sr-only">{s.label}</span>}
    </span>
  );
}

/* ---------- Entity status ---------- */

export type EntityStatus = "active" | "planned" | "paused" | "incubating" | "completed" | "archived";
const STATUS: Record<EntityStatus, string> = {
  active: "bg-accent-soft text-accent",
  planned: "bg-surface-2 text-ink-2",
  paused: "bg-yellow-soft text-yellow",
  incubating: "bg-surface-2 text-ink-3",
  completed: "bg-green-soft text-green",
  archived: "bg-surface-2 text-ink-4",
};

export function StatusBadge({ status }: { status: EntityStatus }) {
  return (
    <span className={cn("inline-flex h-5 items-center rounded-sm px-2 text-2xs font-medium capitalize", STATUS[status])}>
      {status}
    </span>
  );
}

/* ---------- Priority tier ---------- */

export type Tier = "must" | "should" | "could";
export function TierBadge({ tier }: { tier: Tier }) {
  const cls = { must: "border-ink text-ink", should: "border-border-strong text-ink-2", could: "border-border text-ink-3" }[tier];
  return (
    <span className={cn("inline-flex h-5 items-center rounded-sm border px-1.5 text-2xs font-medium capitalize", cls)}>
      {tier}
    </span>
  );
}

/* ---------- Progress (calm, thin) ---------- */

export function Progress({ value, label, className }: { value: number | null; label?: string; className?: string }) {
  const v = value == null ? 0 : Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3"
        role="progressbar"
        aria-valuenow={value == null ? undefined : v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${v}%` }} />
      </div>
      <span className="w-9 text-right text-2xs tabular-nums text-ink-3">{value == null ? "—" : `${v}%`}</span>
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border-strong bg-surface-2 px-1 font-sans text-[11px] font-medium text-ink-3">
      {children}
    </kbd>
  );
}
