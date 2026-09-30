import type { LucideIcon } from "lucide-react";
import {
  HeartPulse, Users, BriefcaseBusiness, GraduationCap, Languages, BookOpen,
  Wallet, Coffee, Moon, House, Library,
} from "lucide-react";

export interface LifeArea {
  slug: string;
  name: string;
  arabic: string;
  icon: LucideIcon;
  /** Where the area lives. Knowledge and Intellectual Assets have their own pages (one home each). */
  href: string;
  /** Short description of what the area page will hold. */
  holds: string;
  /** Area-specific extra on the shared template, if any. */
  extra?: string;
  /** Build phase that fills this page. */
  phase: number;
}

/** The 11 Life Areas. Single source for the sidebar, Areas overview and area pages. */
export const LIFE_AREAS: LifeArea[] = [
  { slug: "health", name: "Health & Energy", arabic: "الصحة والطاقة", icon: HeartPulse, href: "/areas/health", holds: "Sleep, movement and energy patterns. No medical data is stored.", phase: 5 },
  { slug: "family", name: "Family", arabic: "الأسرة", icon: Users, href: "/areas/family", holds: "Time with the children, family commitments and outings.", phase: 5 },
  { slug: "career", name: "Career & Work", arabic: "العمل والمسار المهني", icon: BriefcaseBusiness, href: "/areas/career", holds: "Work outcomes, projects and your executive capability map.", extra: "Executive Capability Map", phase: 7 },
  { slug: "phd", name: "PhD & Academic", arabic: "الدكتوراه والمسار الأكاديمي", icon: GraduationCap, href: "/areas/phd", holds: "Research sessions and the path from literature to drafts.", extra: "Research Pipeline: Literature Matrix → Notes → Concept Papers → Working Papers → Drafts", phase: 6 },
  { slug: "english", name: "English", arabic: "الإنجليزية", icon: Languages, href: "/areas/english", holds: "Steady practice without long breaks, tracked as a weekly minimum.", extra: "Tracks: Business · Academic · Listening & Speaking", phase: 6 },
  { slug: "knowledge", name: "Knowledge", arabic: "المعرفة", icon: BookOpen, href: "/knowledge", holds: "Saved knowledge notes from reading, courses and conversations.", phase: 6 },
  { slug: "finance", name: "Finance", arabic: "المال والادخار", icon: Wallet, href: "/areas/finance", holds: "Savings, additional income and the monthly Money Review.", extra: "Monthly Money Review", phase: 7 },
  { slug: "personal", name: "Personal & Social", arabic: "الحياة الشخصية والاجتماعية", icon: Coffee, href: "/areas/personal", holds: "Friends, social time and personal rest.", phase: 5 },
  { slug: "spiritual", name: "Spiritual", arabic: "الجانب الروحي", icon: Moon, href: "/areas/spiritual", holds: "Quran reading and quiet time, as gentle weekly minimums.", phase: 5 },
  { slug: "home", name: "Home", arabic: "المنزل والتنظيم", icon: House, href: "/areas/home", holds: "Short, regular home organisation.", phase: 5 },
  { slug: "assets", name: "Intellectual Assets", arabic: "الأصول الفكرية", icon: Library, href: "/assets", holds: "Books, articles, research, courses, videos and frameworks.", phase: 7 },
];

/** Areas whose page is the shared /areas/[slug] template. */
export const TEMPLATE_AREAS = LIFE_AREAS.filter((a) => a.href.startsWith("/areas/"));

export function areaBySlug(slug: string) {
  return LIFE_AREAS.find((a) => a.slug === slug);
}
