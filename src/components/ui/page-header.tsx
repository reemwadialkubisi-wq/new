import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title, english, subtitle, action, eyebrow, className,
}: {
  title: string;
  /** English term shown small beside the Arabic title. */
  english?: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? <div className="text-xs font-medium text-ink-3">{eyebrow}</div> : null}
        <h1 className="flex flex-wrap items-baseline gap-x-3 font-display text-2xl font-normal text-ink">
          <span>{title}</span>
          {english ? (
            <span lang="en" dir="ltr" className="font-sans text-sm font-normal text-ink-3">
              {english}
            </span>
          ) : null}
        </h1>
        {subtitle ? <p className="text-sm text-ink-2">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}

/** Previous / next period arrows used on every time-based page. */
/** Previous / current / next. Without `prev` (the first period of the system) the back arrow is shown disabled. */
export function PeriodNav({ prev, next, current }: { prev?: string; next: string; current?: string }) {
  const cls =
    "inline-flex size-9 items-center justify-center rounded-md border border-border-strong bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink";
  return (
    <nav className="flex items-center gap-2" aria-label="التنقل بين الفترات">
      {prev ? (
        <Link href={prev} className={cls} aria-label="الفترة السابقة"><ChevronRight className="size-4" /></Link>
      ) : (
        <span className={`${cls} pointer-events-none opacity-35`} aria-disabled="true" title="بداية النظام: الربع الرابع 2026">
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
      {current ? (
        <Link href={current} className="inline-flex h-9 items-center rounded-md px-3 text-xs font-medium text-ink-2 hover:bg-surface-2">
          الحالي
        </Link>
      ) : null}
      <Link href={next} className={cls} aria-label="الفترة التالية"><ChevronLeft className="size-4" /></Link>
    </nav>
  );
}

/** 12-column content grid with the 8/4 main/context split. */
export function MainWithRail({ main, rail }: { main: React.ReactNode; rail: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">{main}</div>
      <aside className="space-y-6 lg:col-span-4">{rail}</aside>
    </div>
  );
}
