import { eq, isNull, sql } from "drizzle-orm";
import { periodRef } from "@/lib/periods";
import { DEFAULT_SETTINGS } from "@/lib/config";
import { areaFocus, events, habits, periodPlans, routineItems, settings, type PlanLevel } from "./schema";
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
const BAQARAH = "سورة البقرة";

/** Continuous systems with weekly minimums (Q4 plan). Only routine ticks fill them. */
const HABITS: (typeof habits.$inferInsert)[] = [
  { title: "حركة", area: "health", weeklyMinimum: 3, note: "3 جلسات قصيرة أسبوعيًا" },
  { title: "إنجليزي", area: "english", weeklyMinimum: 3, note: "3 × 20 دقيقة أسبوعيًا" },
  { title: "الدكتوراه", area: "phd", weeklyMinimum: 1, note: "1–2 جلسة أسبوعيًا" },
  { title: "معرفة تخصصية", area: "knowledge", weeklyMinimum: null, note: "0–3 مرات أسبوعيًا، بلا ضغط" },
];

type HabitIds = Record<string, number>;

/** Reem's own daily schedule (sent 30 Sep 2026). Work, commute and morning prep are Sunday–Thursday. */
const routineRows = (h: HabitIds): (typeof routineItems.$inferInsert)[] => [
  { startTime: "05:00", endTime: "05:30", title: "الفجر + حركة بسيطة 10–15 دقيقة", area: "spiritual", tier: "must", habitId: h["حركة"] },
  { startTime: "05:30", endTime: "06:00", title: "استحمام وتجهيز أولي", area: "personal", tier: "must" },
  {
    startTime: "06:00", endTime: "07:00", title: BAQARAH, area: "spiritual", tier: "must",
    targetCount: 90, activeFrom: "2026-10-01", activeTo: "2026-12-30",
    note: "إن فات الصباح: في المساء نفسه. والجمعة للتعويض.",
  },
  { startTime: "07:00", endTime: "08:00", title: "الأطفال + الطعام + التجهيز للعمل", area: "family", tier: "must", days: WORKDAYS },
  { startTime: "08:00", endTime: "08:30", title: "الذهاب للعمل", area: "career", tier: "must", days: WORKDAYS },
  { startTime: "08:30", endTime: "16:30", title: "العمل", area: "career", tier: "must", days: WORKDAYS },
  { startTime: "16:30", endTime: "17:00", title: "العودة وفصل العمل ذهنيًا", area: "health", tier: "must", days: WORKDAYS },
  { startTime: "17:00", endTime: "18:00", title: "غداء معتدل + راحة", area: "health", tier: "must" },
  { startTime: "18:00", endTime: "20:00", title: "الأطفال / الدراسة معهم", area: "family", tier: "must" },
  { startTime: "20:00", endTime: "20:20", title: "حركة أو مشي عند القدرة", area: "health", tier: "should", habitId: h["حركة"] },
  {
    startTime: "20:20", endTime: "21:00", title: "هدف معرفي واحد فقط", area: "knowledge", tier: "should",
    choiceHabitIds: [h["إنجليزي"], h["الدكتوراه"], h["معرفة تخصصية"]],
    note: "اختاري عند التعليم: إنجليزي، أو دكتوراه، أو معرفة تخصصية. واحد فقط.",
  },
  { startTime: "21:00", endTime: "21:30", title: "أطفال / مسلسل / حديث / هدوء", area: "personal", tier: "could" },
  { startTime: "21:30", endTime: "22:00", title: "تجهيز الغد وإغلاق اليوم", area: null, tier: "should", note: "Daily Checkout" },
  { startTime: "22:00", title: "نوم", area: "health", tier: "must" },
  { startTime: "10:00", endTime: "10:20", title: "المراجعة الأسبوعية", area: null, tier: "should", days: "5", note: "20 دقيقة يوم الجمعة، ومعها تعويض البقرة إن فات شيء." },
];

/** Titles of the first draft (shown to Reem before she sent her own schedule). */
const DRAFT_TITLES = [
  "استيقاظ", BAQARAH, "الأطفال والتجهيز للعمل", "قراءة تخصصية", "العمل", "حركة 20 دقيقة",
  "وقت الأطفال", "إنجليزي 20 دقيقة", "المراجعة الأسبوعية", "قراءة شخصية 10–15 دقيقة", "نوم",
];

/**
 * Seeds Reem's routine on any database that has none. A database still holding the untouched
 * first draft is moved to her real schedule: draft items are archived (their ticks stay in the
 * backup) and the Al-Baqarah item is kept, so its readings keep counting.
 */
export function seedRoutine(db: DB) {
  if (process.env.REEM_SEED === "off") return;
  if (!db.select({ id: habits.id }).from(habits).limit(1).get()) db.insert(habits).values(HABITS).run();
  const h: HabitIds = Object.fromEntries(db.select().from(habits).all().map((x) => [x.title, x.id]));
  const ROUTINE = routineRows(h);
  const current = db.select().from(routineItems).where(isNull(routineItems.archivedAt)).all();
  const everSeeded = db.select({ id: routineItems.id }).from(routineItems).limit(1).get();
  if (!everSeeded) {
    db.insert(routineItems).values(ROUTINE).run();
    return;
  }
  const untouchedDraft =
    current.length === DRAFT_TITLES.length &&
    current.every((i) => DRAFT_TITLES.includes(i.title) && i.updatedAt === i.createdAt);
  if (!untouchedDraft) return;
  const keep = current.find((i) => i.title === BAQARAH);
  db.transaction((tx) => {
    for (const i of current) {
      if (i.id !== keep?.id) tx.update(routineItems).set({ archivedAt: sql`(datetime('now'))` }).where(eq(routineItems.id, i.id)).run();
    }
    const fresh = ROUTINE.filter((r) => !(keep && r.title === BAQARAH));
    tx.insert(routineItems).values(fresh).run();
  });
}
