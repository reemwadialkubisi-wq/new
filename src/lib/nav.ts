import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Sun, CalendarRange, CalendarDays, Layers, Mountain, Target, FolderKanban,
  Compass, HeartPulse, Users, BriefcaseBusiness, Wallet, GraduationCap, Languages, BookOpen,
  Lightbulb, Library, NotebookPen,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Extra path prefixes that should mark this item active. */
  match?: string[];
}
export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
  /** Overview is always open. */
  alwaysOpen?: boolean;
}

/** Sidebar structure (Phase 0 §7.1). Every item appears exactly once. */
export const NAV: NavGroup[] = [
  {
    id: "overview", label: "Overview", alwaysOpen: true,
    items: [
      { label: "Home", href: "/", icon: LayoutDashboard },
      { label: "Today", href: "/today", icon: Sun },
      { label: "My Week", href: "/week", icon: CalendarRange },
    ],
  },
  {
    id: "planning", label: "Planning",
    items: [
      { label: "Month", href: "/month", icon: CalendarDays },
      { label: "Quarter", href: "/quarter", icon: Layers },
      { label: "Annual Plan", href: "/year", icon: Mountain },
      { label: "Goals", href: "/goals", icon: Target },
      { label: "Projects", href: "/projects", icon: FolderKanban },
    ],
  },
  {
    id: "life", label: "Life",
    items: [
      { label: "Life Areas", href: "/areas", icon: Compass, match: ["/areas/personal", "/areas/spiritual", "/areas/home"] },
      { label: "Health & Energy", href: "/areas/health", icon: HeartPulse },
      { label: "Family", href: "/areas/family", icon: Users },
      { label: "Career & Work", href: "/areas/career", icon: BriefcaseBusiness },
      { label: "Finance", href: "/areas/finance", icon: Wallet },
    ],
  },
  {
    id: "growth", label: "Growth",
    items: [
      { label: "PhD", href: "/areas/phd", icon: GraduationCap },
      { label: "English", href: "/areas/english", icon: Languages },
      { label: "Knowledge", href: "/knowledge", icon: BookOpen },
    ],
  },
  {
    id: "create", label: "Create",
    items: [
      { label: "Ideas", href: "/ideas", icon: Lightbulb },
      { label: "Intellectual Assets", href: "/assets", icon: Library },
    ],
  },
  {
    id: "reflect", label: "Reflect",
    items: [{ label: "Reviews", href: "/reviews", icon: NotebookPen }],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/") return pathname === "/";
  if (item.href === "/areas") return pathname === "/areas" || (item.match ?? []).some((m) => pathname.startsWith(m));
  return pathname === item.href || pathname.startsWith(item.href + "/");
}
