"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { EnergyChip, Kbd, type Energy } from "@/components/ui/status";
import { cn } from "@/lib/utils";
import { MobileDrawer } from "./mobile-nav";
import { useQuickCapture } from "./quick-capture";
import { ThemeToggle } from "./theme";

export interface TimeBarData {
  year: { label: string; href: string };
  quarter: { label: string; href: string; theme?: string | null };
  month: { label: string; href: string; theme?: string | null };
  week: { label: string; range: string; href: string };
  day: { label: string; href: string };
  energy: Energy | null;
}

/** "Where am I?" on every page: 2026 › Q4 › October › W40 · 3–9 Oct › Thu 1 Oct ● ENERGY. */
export function TimeBar({ data, authConfigured }: { data: TimeBarData; authConfigured: boolean }) {
  const { open } = useQuickCapture();
  const seg = "shrink-0 rounded-sm px-1.5 py-0.5 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink";
  const sep = <ChevronRight className="size-3.5 shrink-0 text-ink-4" aria-hidden />;
  return (
    <div className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-8 lg:px-10">
        <MobileDrawer authConfigured={authConfigured} />
        <nav aria-label="Current period" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-[13px] [scrollbar-width:none]">
          <Link href={data.year.href} className={cn(seg, "hidden font-medium text-ink sm:inline")}>{data.year.label}</Link>
          <span className="hidden sm:inline">{sep}</span>
          <Link href={data.quarter.href} className={cn(seg, "hidden sm:inline")}>
            {data.quarter.label}
            {data.quarter.theme ? <span className="text-ink-3"> · {data.quarter.theme}</span> : null}
          </Link>
          <span className="hidden sm:inline">{sep}</span>
          <Link href={data.month.href} className={cn(seg, "hidden md:inline")}>
            {data.month.label}
            {data.month.theme ? <span className="text-ink-3"> · {data.month.theme}</span> : null}
          </Link>
          <span className="hidden md:inline">{sep}</span>
          <Link href={data.week.href} className={seg}>
            {data.week.label}
            <span className="text-ink-3"> · {data.week.range}</span>
          </Link>
          {sep}
          <Link href={data.day.href} className={cn(seg, "font-medium text-ink")}>{data.day.label}</Link>
          <Link href="/today" className="ml-1 shrink-0" aria-label="Today's energy">
            <EnergyChip level={data.energy} />
          </Link>
        </nav>
        <button
          type="button"
          onClick={open}
          className="hidden h-8 shrink-0 items-center gap-2 rounded-md border border-border-strong bg-surface px-2.5 text-xs text-ink-3 transition-colors hover:text-ink sm:inline-flex"
        >
          <Plus className="size-3.5" aria-hidden />
          Capture
          <span className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}
