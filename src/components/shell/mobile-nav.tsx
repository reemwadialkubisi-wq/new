"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarRange, LayoutDashboard, Menu, Plus, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Brand, NavTree, SidebarFooter } from "./sidebar";
import { useQuickCapture } from "./quick-capture";

/** Drawer holding the full sidebar, below the desktop breakpoint. */
export function MobileDrawer({ authConfigured }: { authConfigured: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="-ms-1.5 rounded-md p-1.5 text-ink-2 hover:bg-surface-2 lg:hidden" aria-label="فتح القائمة">
        <Menu className="size-5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/25 dark:bg-black/50 lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 start-0 z-50 flex w-[288px] max-w-[85vw] flex-col bg-bg px-3 py-4 shadow-pop focus:outline-none lg:hidden">
          <Dialog.Title className="sr-only">القائمة</Dialog.Title>
          <div className="mb-6 flex items-center justify-between">
            <Brand />
            <Dialog.Close className="rounded-md p-1.5 text-ink-3 hover:bg-surface-2" aria-label="إغلاق القائمة">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto pb-4">
            <NavTree onNavigate={() => setOpen(false)} />
          </div>
          <SidebarFooter authConfigured={authConfigured} onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Phone bottom bar: Home · Today · Week · Capture. */
export function BottomBar() {
  const pathname = usePathname();
  const { open } = useQuickCapture();
  const items = [
    { href: "/", label: "الرئيسية", icon: LayoutDashboard, active: pathname === "/" },
    { href: "/today", label: "اليوم", icon: Sun, active: pathname === "/today" },
    { href: "/week", label: "الأسبوع", icon: CalendarRange, active: pathname.startsWith("/week") },
  ];
  const cls = "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium";
  return (
    <nav
      aria-label="تنقل سريع"
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn(cls, active ? "text-accent-text" : "text-ink-3")}>
          <Icon className="size-5" aria-hidden />
          {label}
        </Link>
      ))}
      <button type="button" onClick={open} className={cn(cls, "text-ink-3")}>
        <Plus className="size-5" aria-hidden />
        تدوين
      </button>
    </nav>
  );
}
