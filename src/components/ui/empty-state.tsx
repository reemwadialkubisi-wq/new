import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Calm empty state: what will live here, and when. Never "nothing done" language.
 */
export function EmptyState({
  icon: Icon, title, children, phase, action, className, compact,
}: {
  icon?: LucideIcon;
  title: string;
  children?: React.ReactNode;
  phase?: number;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start",
        compact ? "gap-2" : "gap-3 rounded-lg border border-dashed border-border-strong/70 p-8",
        className,
      )}
    >
      {Icon ? (
        <span className="flex size-9 items-center justify-center rounded-md bg-surface-2 text-ink-3">
          <Icon className="size-4" aria-hidden />
        </span>
      ) : null}
      <div className="space-y-1">
        <p className={cn("font-medium text-ink", compact ? "text-sm" : "text-base")}>{title}</p>
        {children ? <div className="max-w-prose text-sm text-ink-3">{children}</div> : null}
      </div>
      {phase ? (
        <span className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-4">Arrives in Phase {phase}</span>
      ) : null}
      {action}
    </div>
  );
}
