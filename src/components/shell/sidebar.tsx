"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, Plus, Settings, LogOut } from "lucide-react";
import { NAV, isActive } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/status";
import { useQuickCapture } from "./quick-capture";

const GROUPS_KEY = "rlos.sidebar.groups";
const RAIL_KEY = "rlos.sidebar.rail";

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw));
    } catch {}
  }, [key]);
  const update = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  };
  return [value, update] as const;
}

export function Brand({ rail }: { rail?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md px-2 py-1" aria-label="REEM LIFE OS home">
      <svg viewBox="0 0 28 28" className="size-7 shrink-0 text-ink" aria-hidden>
        <circle cx="14" cy="14" r="13" fill="currentColor" />
        <circle cx="14" cy="14" r="8" fill="none" stroke="var(--bg)" strokeWidth="1.5" />
        <path d="M14 6a8 8 0 0 1 0 16Z" fill="var(--bg)" />
      </svg>
      {rail ? null : (
        <span className="leading-tight">
          <span className="block text-[13px] font-semibold tracking-[0.14em] text-ink">REEM LIFE OS</span>
          <span lang="ar" dir="rtl" className="block font-arabic text-2xs text-ink-3">نظام ريم لإدارة الحياة</span>
        </span>
      )}
    </Link>
  );
}

/** Nav tree shared by the desktop sidebar and the mobile drawer. */
export function NavTree({ rail, onNavigate }: { rail?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [closed, setClosed] = useStoredState<Record<string, boolean>>(GROUPS_KEY, {});

  return (
    <nav aria-label="Main" className="space-y-3">
      {NAV.map((group) => {
        const hasActive = group.items.some((i) => isActive(i, pathname));
        const isOpen = rail || group.alwaysOpen || !closed[group.id] || hasActive;
        const listId = `nav-${group.id}`;
        return (
          <div key={group.id}>
            {rail ? (
              <div className="mx-auto mb-1.5 h-px w-6 bg-border" aria-hidden />
            ) : group.alwaysOpen ? (
              <div className="px-3 pb-1 text-2xs font-semibold uppercase tracking-[0.1em] text-ink-4">{group.label}</div>
            ) : (
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={listId}
                onClick={() => setClosed({ ...closed, [group.id]: isOpen })}
                className="group flex w-full items-center justify-between rounded-sm px-3 pb-1 text-2xs font-semibold uppercase tracking-[0.1em] text-ink-4 hover:text-ink-2"
              >
                {group.label}
                <ChevronDown className={cn("size-3.5 transition-transform", !isOpen && "-rotate-90")} aria-hidden />
              </button>
            )}
            {isOpen ? (
              <ul id={listId} className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item, pathname);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={rail ? item.label : undefined}
                        className={cn(
                          "flex h-7 items-center gap-3 rounded-md text-[13px] transition-colors",
                          rail ? "mx-auto w-10 justify-center" : "px-3",
                          active ? "bg-surface-3 font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                        )}
                      >
                        <Icon className={cn("size-4 shrink-0", active ? "text-accent" : "text-ink-3")} aria-hidden />
                        {rail ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export function SidebarFooter({ rail, authConfigured, onNavigate }: { rail?: boolean; authConfigured: boolean; onNavigate?: () => void }) {
  const { open } = useQuickCapture();
  const pathname = usePathname();
  const row = cn(
    "flex h-7 w-full items-center gap-3 rounded-md text-[13px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink",
    rail ? "mx-auto w-10 justify-center" : "px-3",
  );
  return (
    <div className="space-y-0.5 border-t border-border pt-2">
      <button type="button" onClick={() => { onNavigate?.(); open(); }} className={row} title={rail ? "Quick Capture (Ctrl K)" : undefined}>
        <Plus className="size-4 text-ink-3" aria-hidden />
        {rail ? <span className="sr-only">Quick Capture</span> : (
          <>
            <span className="flex-1 text-left">Quick Capture</span>
            <span className="flex gap-0.5"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
          </>
        )}
      </button>
      <Link
        href="/settings"
        onClick={onNavigate}
        aria-current={pathname.startsWith("/settings") ? "page" : undefined}
        className={cn(row, pathname.startsWith("/settings") && "bg-surface-3 font-medium text-ink")}
        title={rail ? "Settings" : undefined}
      >
        <Settings className="size-4 text-ink-3" aria-hidden />
        {rail ? <span className="sr-only">Settings</span> : (
          <>
            <span className="flex-1">Settings</span>
            {authConfigured ? null : (
              <span className="text-2xs text-ink-4" title="Not connected to the database yet: no login, nothing is saved.">Preview mode</span>
            )}
          </>
        )}
      </Link>
      {authConfigured ? (
        <form action="/auth/signout" method="post">
          <button type="submit" className={row} title={rail ? "Sign out" : undefined}>
            <LogOut className="size-4 text-ink-3" aria-hidden />
            {rail ? <span className="sr-only">Sign out</span> : "Sign out"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function Sidebar({ authConfigured }: { authConfigured: boolean }) {
  const [rail, setRail] = useStoredState<boolean>(RAIL_KEY, false);
  return (
    <aside
      data-rail={rail}
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-bg py-4 transition-[width] duration-200 lg:flex",
        rail ? "w-[72px] px-2" : "w-[248px] px-3",
      )}
    >
      <div className={cn("mb-3 flex items-center", rail ? "flex-col gap-3" : "justify-between")}>
        <Brand rail={rail} />
        <button
          type="button"
          onClick={() => setRail(!rail)}
          className="rounded-md p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink"
          aria-label={rail ? "Expand sidebar" : "Collapse sidebar"}
          title={rail ? "Expand sidebar" : "Collapse sidebar"}
        >
          {rail ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>
      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-2">
        <NavTree rail={rail} />
      </div>
      <SidebarFooter rail={rail} authConfigured={authConfigured} />
    </aside>
  );
}
