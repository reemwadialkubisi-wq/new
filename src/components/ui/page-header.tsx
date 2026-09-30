import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title, arabic, subtitle, action, eyebrow, className,
}: {
  title: string;
  arabic?: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? <div className="text-2xs font-semibold uppercase tracking-[0.1em] text-ink-3">{eyebrow}</div> : null}
        <h1 className="font-display text-2xl font-normal tracking-[-0.01em] text-ink">
          {title}
          {arabic ? (
            <span lang="ar" dir="rtl" className="ml-3 align-middle font-arabic text-lg font-normal text-ink-3">
              {arabic}
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
export function PeriodNav({ prev, next, current }: { prev: string; next: string; current?: string }) {
  const cls =
    "inline-flex size-9 items-center justify-center rounded-md border border-border-strong bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink";
  return (
    <nav className="flex items-center gap-2" aria-label="Period navigation">
      <Link href={prev} className={cls} aria-label="Previous period"><ChevronLeft className="size-4" /></Link>
      {current ? (
        <Link href={current} className="inline-flex h-9 items-center rounded-md px-3 text-xs font-medium text-ink-2 hover:bg-surface-2">
          Current
        </Link>
      ) : null}
      <Link href={next} className={cls} aria-label="Next period"><ChevronRight className="size-4" /></Link>
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
