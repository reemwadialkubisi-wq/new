import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Sun, CalendarRange, CalendarDays, Layers, Mountain, Target, FolderKanban,
  Compass, HeartPulse, Users, BriefcaseBusiness, Wallet, GraduationCap, Languages, BookOpen,
  Lightbulb, Library, NotebookPen,
} from "lucide-react";

export interface NavItem {
  /** Arabic label (the interface is Arabic-first). */
  label: string;
  /** English term shown small beside the Arabic. */
  en: string;
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
    id: "overview", label: "نظرة عامة", alwaysOpen: true,
    items: [
      { label: "الرئيسية", en: "Home", href: "/", icon: LayoutDashboard },
      { label: "اليوم", en: "Today", href: "/today", icon: Sun },
      { label: "أسبوعي", en: "My Week", href: "/week", icon: CalendarRange },
    ],
  },
  {
    id: "planning", label: "التخطيط",
    items: [
      { label: "الشهر", en: "Month", href: "/month", icon: CalendarDays },
      { label: "الربع", en: "Quarter", href: "/quarter", icon: Layers },
      { label: "الخطة السنوية", en: "Annual Plan", href: "/year", icon: Mountain },
      { label: "الأهداف", en: "Goals", href: "/goals", icon: Target },
      { label: "المشاريع", en: "Projects", href: "/projects", icon: FolderKanban },
    ],
  },
  {
    id: "life", label: "الحياة",
    items: [
      { label: "مجالات الحياة", en: "Life Areas", href: "/areas", icon: Compass, match: ["/areas/personal", "/areas/spiritual", "/areas/home"] },
      { label: "الصحة والطاقة", en: "Health", href: "/areas/health", icon: HeartPulse },
      { label: "الأسرة", en: "Family", href: "/areas/family", icon: Users },
      { label: "العمل والمسار المهني", en: "Career", href: "/areas/career", icon: BriefcaseBusiness },
      { label: "المال", en: "Finance", href: "/areas/finance", icon: Wallet },
    ],
  },
  {
    id: "growth", label: "النمو",
    items: [
      { label: "الدكتوراه", en: "PhD", href: "/areas/phd", icon: GraduationCap },
      { label: "الإنجليزية", en: "English", href: "/areas/english", icon: Languages },
      { label: "المعرفة", en: "Knowledge", href: "/knowledge", icon: BookOpen },
    ],
  },
  {
    id: "create", label: "الإبداع",
    items: [
      { label: "الأفكار", en: "Ideas", href: "/ideas", icon: Lightbulb },
      { label: "الأصول الفكرية", en: "Assets", href: "/assets", icon: Library },
    ],
  },
  {
    id: "reflect", label: "المراجعة",
    items: [{ label: "المراجعات", en: "Reviews", href: "/reviews", icon: NotebookPen }],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/") return pathname === "/";
  if (item.href === "/areas") return pathname === "/areas" || (item.match ?? []).some((m) => pathname.startsWith(m));
  return pathname === item.href || pathname.startsWith(item.href + "/");
}
