import type { LucideIcon } from "lucide-react";
import {
  HeartPulse, Users, BriefcaseBusiness, GraduationCap, Languages, BookOpen,
  Wallet, Coffee, Moon, House, Library,
} from "lucide-react";

export interface LifeArea {
  slug: string;
  /** Arabic display name (the interface is Arabic-first). */
  name: string;
  /** English term, shown small next to the Arabic. */
  english: string;
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
  { slug: "health", name: "الصحة والطاقة", english: "Health & Energy", icon: HeartPulse, href: "/areas/health", holds: "النوم والحركة وأنماط الطاقة. لا تُحفظ أي بيانات طبية.", phase: 5 },
  { slug: "family", name: "الأسرة", english: "Family", icon: Users, href: "/areas/family", holds: "الوقت مع الأطفال، والالتزامات العائلية، والنزهات.", phase: 5 },
  { slug: "career", name: "العمل والمسار المهني", english: "Career & Work", icon: BriefcaseBusiness, href: "/areas/career", holds: "نتائج العمل والمشاريع وخريطة القدرات التنفيذية.", extra: "خريطة القدرات التنفيذية · Executive Capability Map", phase: 7 },
  { slug: "phd", name: "الدكتوراه والمسار الأكاديمي", english: "PhD & Academic", icon: GraduationCap, href: "/areas/phd", holds: "جلسات البحث والطريق من مراجعة الأدبيات إلى المسودات.", extra: "مسار البحث · Research Pipeline: Literature Matrix ← Notes ← Concept Papers ← Working Papers ← Drafts", phase: 6 },
  { slug: "english", name: "الإنجليزية", english: "English", icon: Languages, href: "/areas/english", holds: "ممارسة منتظمة دون انقطاع طويل، بحد أدنى أسبوعي.", extra: "المسارات · Tracks: Business · Academic · Listening & Speaking", phase: 6 },
  { slug: "knowledge", name: "المعرفة", english: "Knowledge", icon: BookOpen, href: "/knowledge", holds: "ملاحظات المعرفة من القراءة والدورات والحوارات.", phase: 6 },
  { slug: "finance", name: "المال والادخار", english: "Finance", icon: Wallet, href: "/areas/finance", holds: "الادخار والدخل الإضافي والمراجعة المالية الشهرية.", extra: "المراجعة المالية الشهرية · Money Review", phase: 7 },
  { slug: "personal", name: "الحياة الشخصية والاجتماعية", english: "Personal & Social", icon: Coffee, href: "/areas/personal", holds: "الأصدقاء والوقت الاجتماعي والراحة الشخصية.", phase: 5 },
  { slug: "spiritual", name: "الجانب الروحي", english: "Spiritual", icon: Moon, href: "/areas/spiritual", holds: "قراءة القرآن ووقت السكينة، بحدود أسبوعية دنيا لطيفة.", phase: 5 },
  { slug: "home", name: "المنزل والتنظيم", english: "Home", icon: House, href: "/areas/home", holds: "تنظيم قصير ومنتظم للمنزل.", phase: 5 },
  { slug: "assets", name: "الأصول الفكرية", english: "Intellectual Assets", icon: Library, href: "/assets", holds: "كتب ومقالات وأبحاث ودورات وفيديوهات وأطر عمل.", phase: 7 },
];

/** Areas whose page is the shared /areas/[slug] template. */
export const TEMPLATE_AREAS = LIFE_AREAS.filter((a) => a.href.startsWith("/areas/"));

export function areaBySlug(slug: string) {
  return LIFE_AREAS.find((a) => a.slug === slug);
}
