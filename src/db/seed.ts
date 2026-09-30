import { periodRef } from "@/lib/periods";
import { DEFAULT_SETTINGS } from "@/lib/config";
import { areaFocus, events, periodPlans, routineItems, settings, type PlanLevel } from "./schema";
import type { DB } from "./index";

type SeedPlan = { level: PlanLevel; key: string; theme: string; intention?: string; priorities?: string[]; status?: "planning" | "active" };

/**
 * First real data: the Q4 2026 plan from the build prompt (Reset · Design · Prepare).
 * Runs once, on a brand-new database. Everything here is editable in the app.
 */
const Q4_2026: SeedPlan[] = [
  {
    level: "quarter", key: "2026-q4", status: "active",
    theme: "إعادة ضبط · تصميم · استعداد (Reset · Design · Prepare)",
    intention: "ربع لإعادة الإيقاع اليومي، وإغلاق الملفات المفتوحة، وتصميم 2027 من بيانات حقيقية.",
    priorities: [
      "إعادة ضبط الإيقاع اليومي: النوم قرابة 10:00 والاستيقاظ قرابة 5:00",
      "إغلاق 3 ملفات بحلول 31 أكتوبر",
      "الإنجليزية دون انقطاع طويل: 3 × 20 دقيقة أسبوعيًا",
      "تصميم استراتيجية الحياة 2027 من بيانات حقيقية",
    ],
  },
  {
    level: "month", key: "2026-10", status: "active", theme: "إعادة ضبط · Reset",
    priorities: [
      "إغلاق الملفات الثلاثة: شهادة الكفاءة في العربية، رخصة التدريب، رخصة الممارسة الأكاديمية",
      "خريطة المتطلبات والمسار الحرج لكل ملف",
      "إيقاع يومي ثابت: نوم واستيقاظ مبكران",
    ],
  },
  { level: "month", key: "2026-11", theme: "تصميم 2027 · Design", priorities: ["تصميم استراتيجية الحياة 2027"] },
  { level: "month", key: "2026-12", theme: "استعداد · Prepare Q1 2027", priorities: ["تجهيز خطة Q1 2027"] },
];

export function seed(db: DB) {
  if (db.select().from(settings).get()) return;
  db.insert(settings).values({ id: 1, weekStart: DEFAULT_SETTINGS.weekStart, timeZone: DEFAULT_SETTINGS.timeZone, capacity: DEFAULT_SETTINGS.capacity }).run();
  if (process.env.REEM_SEED === "off") return;

  for (const p of Q4_2026) {
    const ref = periodRef(p.level, p.key)!;
    db.insert(periodPlans).values({
      ...ref, theme: p.theme, intention: p.intention ?? "", priorities: p.priorities ?? [], status: p.status ?? "planning",
    }).run();
  }
  const q4 = db.select().from(periodPlans).all().find((p) => p.key === "2026-q4")!;
  db.insert(areaFocus).values([
    { periodPlanId: q4.id, area: "health", focus: "النوم محمي، وحركة 3 جلسات قصيرة أسبوعيًا", tier: "must" },
    { periodPlanId: q4.id, area: "family", focus: "وقت يومي مع الأطفال", tier: "must" },
    { periodPlanId: q4.id, area: "career", focus: "إغلاق الملفات الثلاثة", tier: "must" },
    { periodPlanId: q4.id, area: "english", focus: "3 × 20 دقيقة أسبوعيًا", tier: "should" },
    { periodPlanId: q4.id, area: "phd", focus: "1–2 جلسة بحث أسبوعيًا", tier: "should" },
    { periodPlanId: q4.id, area: "spiritual", focus: "سورة البقرة يوميًا: 90 قراءة من 1 أكتوبر إلى 30 ديسمبر", tier: "must" },
  ]).run();
  db.insert(events).values([
    { title: "آخر موعد لإغلاق الملفات الثلاثة", kind: "deadline", date: "2026-10-31", area: "career" },
    { title: "نهاية دورة سورة البقرة (90 قراءة)", kind: "important_date", date: "2026-12-30", area: "spiritual" },
  ]).run();
}

const WORKDAYS = "01234"; // Sunday to Thursday

/**
 * Reem's day from the Q4 2026 plan (draft shown to her on 30 Sep 2026; times marked
 * "مقترح" are guesses she is asked to correct). Runs whenever there is no routine yet,
 * so existing databases get it too. Everything is editable in /settings/routine.
 */
export function seedRoutine(db: DB) {
  if (process.env.REEM_SEED === "off") return;
  if (db.select({ id: routineItems.id }).from(routineItems).limit(1).get()) return;
  db.insert(routineItems).values([
    { startTime: "05:00", title: "استيقاظ", area: "health", tier: "must" },
    {
      startTime: "06:00", endTime: "07:00", title: "سورة البقرة", area: "spiritual", tier: "must",
      targetCount: 90, activeFrom: "2026-10-01", activeTo: "2026-12-30",
      note: "إن فات الصباح: في المساء نفسه. والجمعة للتعويض.",
    },
    { startTime: "07:00", endTime: "08:00", title: "الأطفال والتجهيز للعمل", area: "family", tier: "must", days: WORKDAYS, note: "الوقت مقترح" },
    { startTime: "08:00", endTime: "08:30", title: "قراءة تخصصية", area: "knowledge", tier: "could", days: WORKDAYS, note: "0–3 مرات أسبوعيًا. إن وصلتِ متأخرة لا تُعوَّض." },
    { startTime: "08:30", endTime: "16:30", title: "العمل", area: "career", tier: "must", days: WORKDAYS },
    { startTime: "17:30", title: "حركة 20 دقيقة", area: "health", tier: "should", weeklyMinimum: 3, note: "الوقت مقترح" },
    { startTime: "18:00", title: "وقت الأطفال", area: "family", tier: "must", note: "الوقت مقترح" },
    { startTime: "19:30", title: "إنجليزي 20 دقيقة", area: "english", tier: "should", weeklyMinimum: 3, note: "Business · Academic · Listening. الوقت مقترح" },
    { startTime: "10:00", endTime: "10:20", title: "المراجعة الأسبوعية", area: null, tier: "should", days: "5", note: "20 دقيقة يوم الجمعة" },
    { startTime: "21:30", title: "قراءة شخصية 10–15 دقيقة", area: "personal", tier: "could", note: "فرصة، بلا عدّاد" },
    { startTime: "22:00", title: "نوم", area: "health", tier: "must" },
  ]).run();
}
