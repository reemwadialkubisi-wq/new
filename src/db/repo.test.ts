import { beforeAll, describe, expect, it } from "vitest";
import { periodRef } from "@/lib/periods";
import { addEvent, archiveEvent, exportAll, getFocus, getPlan, getSettings, listEvents, plannedYears, saveFocus, savePlan, saveSettings } from "./repo";

// DATABASE_PATH=:memory: (vitest.config.ts): a fresh, migrated and seeded database.

describe("fresh database", () => {
  it("has default settings", () => {
    expect(getSettings()).toMatchObject({ weekStart: 6, timeZone: "Asia/Riyadh", capacity: { activeProjects: 3 } });
  });
  it("is seeded with the Q4 2026 plan", () => {
    const q4 = getPlan("quarter", "2026-q4");
    expect(q4?.theme).toMatch(/Reset/);
    expect(q4?.priorities).toHaveLength(4);
    expect(getPlan("month", "2026-10")?.theme).toMatch(/Reset/);
    expect(getFocus(q4!.id).length).toBeGreaterThan(0);
    expect(plannedYears()).toContain(2026);
  });
});

describe("plans", () => {
  it("creates a plan on first save and updates it after", () => {
    const ref = periodRef("year", "2027")!;
    expect(getPlan("year", "2027")).toBeNull();
    savePlan(ref, { theme: "بناء", intention: "", priorities: ["أ"], status: "planning" });
    const saved = savePlan(ref, { theme: "بناء بهدوء", intention: "رؤية", priorities: ["أ", "ب"], status: "active" });
    expect(saved).toMatchObject({ key: "2027", level: "year", theme: "بناء بهدوء", priorities: ["أ", "ب"], status: "active", archivedAt: null });
  });
  it("archiving sets archived_at", () => {
    const saved = savePlan(periodRef("month", "2027-01")!, { theme: "", intention: "", priorities: [], status: "archived" });
    expect(saved.archivedAt).not.toBeNull();
  });
  it("area focus is replaced as a whole", () => {
    const ref = periodRef("month", "2027-02")!;
    saveFocus(ref, [{ area: "health", focus: "نوم", tier: "must" }, { area: "family", focus: "نزهة", tier: "could" }]);
    saveFocus(ref, [{ area: "english", focus: "3 × 20", tier: "should" }]);
    const plan = getPlan("month", "2027-02")!;
    expect(getFocus(plan.id).map((f) => f.area)).toEqual(["english"]);
  });
});

describe("events", () => {
  let yearlyId = 0;
  beforeAll(() => {
    addEvent({ title: "سفر", kind: "travel", date: "2027-03-30", endDate: "2027-04-03", yearly: false, area: null });
    yearlyId = addEvent({ title: "عيد ميلاد", kind: "important_date", date: "2020-05-10", endDate: null, yearly: true, area: "family" }).id;
  });
  it("includes multi-day events that start before the range", () => {
    const april = listEvents("2027-04-01", "2027-04-30");
    expect(april.map((e) => e.title)).toContain("سفر");
    expect(april.find((e) => e.title === "سفر")?.on).toBe("2027-04-01");
  });
  it("moves yearly events into the requested year", () => {
    expect(listEvents("2027-05-01", "2027-05-31").find((e) => e.id === yearlyId)?.on).toBe("2027-05-10");
    expect(listEvents("2019-05-01", "2019-05-31").find((e) => e.id === yearlyId)).toBeUndefined();
    expect(listEvents("2027-01-01", "2028-12-31").filter((e) => e.id === yearlyId)).toHaveLength(2);
  });
  it("archived events leave the pages but stay in the backup", () => {
    archiveEvent(yearlyId);
    expect(listEvents("2027-05-01", "2027-05-31").find((e) => e.id === yearlyId)).toBeUndefined();
    expect(exportAll().events.find((e) => e.id === yearlyId)?.archivedAt).not.toBeNull();
  });
});

describe("settings", () => {
  it("saves and reads back", () => {
    saveSettings({ weekStart: 0, timeZone: "Europe/London", capacity: { ...getSettings().capacity, activeProjects: 2 } });
    expect(getSettings()).toMatchObject({ weekStart: 0, timeZone: "Europe/London", capacity: { activeProjects: 2 } });
  });
});

import { addIdea, addOutcome, addTask, archiveIdea, listIdeas, listOutcomes, setOutcomeStatus, setTaskStatus, tasksBetween, tasksForDay } from "./repo";

describe("quick capture destinations", () => {
  it("ideas: newest first, hidden ones leave the inbox", () => {
    const a = addIdea({ title: "أ", note: "" });
    addIdea({ title: "ب", note: "تفاصيل" });
    expect(listIdeas().map((i) => i.title).slice(0, 2)).toEqual(["ب", "أ"]);
    archiveIdea(a.id);
    expect(listIdeas().map((i) => i.title)).not.toContain("أ");
  });
  it("tasks: today, undated, and earlier ones still open", () => {
    addTask({ title: "اليوم", date: "2030-01-10" });
    addTask({ title: "بلا تاريخ", date: null });
    const old = addTask({ title: "قديمة", date: "2030-01-05" });
    const closed = addTask({ title: "قديمة منجزة", date: "2030-01-04" });
    setTaskStatus(closed.id, "done");
    const t = tasksForDay("2030-01-10");
    expect(t.today.map((x) => x.title)).toEqual(["اليوم"]);
    expect(t.undated.map((x) => x.title)).toContain("بلا تاريخ");
    expect(t.earlier.map((x) => x.id)).toEqual([old.id]);
    expect(tasksBetween("2030-01-04", "2030-01-10")).toHaveLength(3);
  });
  it("weekly outcomes belong to one week", () => {
    const o = addOutcome({ weekStart: "2030-01-05", title: "مسودة" });
    addOutcome({ weekStart: "2030-01-12", title: "أخرى" });
    setOutcomeStatus(o.id, "achieved");
    expect(listOutcomes("2030-01-05")).toMatchObject([{ title: "مسودة", status: "achieved" }]);
  });
});

import { getEnergy, habitProgress, listHabits, listRoutine, routineForDay, routineProgress, saveRoutineItem, setEnergy, setRoutineCheck } from "./repo";
import { getDb } from "./index";
import { routineItems } from "./schema";
import { seedRoutine } from "./seed";

const W = ["2026-10-03", "2026-10-09"] as const; // W40, Saturday to Friday

describe("daily routine (Reem's schedule)", () => {
  it("runs from 5:00 to 22:00, with Al-Baqarah as a 90-reading cycle", () => {
    const items = listRoutine();
    expect(items[0]).toMatchObject({ startTime: "05:00", endTime: "05:30" });
    expect(items.at(-1)).toMatchObject({ startTime: "22:00", title: "نوم" });
    expect(items.find((i) => i.title === "سورة البقرة")).toMatchObject({ targetCount: 90, activeFrom: "2026-10-01" });
    expect(listHabits().map((h) => h.title)).toEqual(["حركة", "إنجليزي", "الدكتوراه", "معرفة تخصصية"]);
  });
  it("work and commute are Sunday to Thursday; the weekly review is on Friday", () => {
    const fri = routineForDay("2026-10-09", ...W).map((i) => i.item.title);
    expect(fri).toContain("المراجعة الأسبوعية");
    expect(fri).not.toContain("العمل");
    expect(fri).not.toContain("الذهاب للعمل");
    const sun = routineForDay("2026-10-04", ...W).map((i) => i.item.title);
    expect(sun).toContain("العمل");
    expect(sun).not.toContain("المراجعة الأسبوعية");
  });
  it("Fajr and the evening walk both count toward movement", () => {
    const [fajr, walk] = ["الفجر + حركة بسيطة 10–15 دقيقة", "حركة أو مشي عند القدرة"].map((t) => listRoutine().find((i) => i.title === t)!);
    setRoutineCheck(fajr.id, "2026-10-03", true);
    setRoutineCheck(walk.id, "2026-10-03", true);
    setRoutineCheck(fajr.id, "2026-10-04", true);
    setRoutineCheck(fajr.id, "2026-10-04", true); // same day twice counts once
    const movement = habitProgress(...W).find((h) => h.habit.title === "حركة")!;
    expect(movement.week).toBe(3);
    const day = routineForDay("2026-10-04", ...W).find((i) => i.item.id === walk.id)!;
    expect(day.habit?.week).toBe(3);
    expect(day.done).toBe(false);
  });
  it("the knowledge slot counts toward the one she picks, and can be changed or undone", () => {
    const slot = listRoutine().find((i) => i.title === "هدف معرفي واحد فقط")!;
    const [english, phd] = ["إنجليزي", "الدكتوراه"].map((t) => listHabits().find((h) => h.title === t)!.id);
    setRoutineCheck(slot.id, "2026-10-05", true); // no pick: nothing recorded
    expect(routineForDay("2026-10-05", ...W).find((i) => i.item.id === slot.id)?.done).toBe(false);
    setRoutineCheck(slot.id, "2026-10-05", true, english);
    setRoutineCheck(slot.id, "2026-10-06", true, english);
    let hp = habitProgress(...W);
    expect(hp.find((h) => h.habit.id === english)?.week).toBe(2);
    setRoutineCheck(slot.id, "2026-10-06", true, phd); // changed her mind
    hp = habitProgress(...W);
    expect(hp.find((h) => h.habit.id === english)?.week).toBe(1);
    expect(hp.find((h) => h.habit.id === phd)?.week).toBe(1);
    const today = routineForDay("2026-10-06", ...W).find((i) => i.item.id === slot.id)!;
    expect(today).toMatchObject({ done: true, picked: phd });
    expect(today.choices.map((c) => c.habit.title)).toEqual(["إنجليزي", "الدكتوراه", "معرفة تخصصية"]);
    setRoutineCheck(slot.id, "2026-10-06", false);
    expect(habitProgress(...W).find((h) => h.habit.id === phd)?.week).toBe(0);
  });
  it("Al-Baqarah ticks count toward its cycle, not before 1 Oct", () => {
    const baq = listRoutine().find((i) => i.title === "سورة البقرة")!;
    setRoutineCheck(baq.id, "2026-10-03", true);
    setRoutineCheck(baq.id, "2026-10-04", true);
    expect(routineProgress(...W).find((p) => p.item.id === baq.id)?.cycle).toBe(2);
    expect(routineForDay("2026-09-30", "2026-09-26", "2026-10-02").find((i) => i.item.id === baq.id)).toBeUndefined();
  });
  it("items can be edited", () => {
    const walk = listRoutine().find((i) => i.title === "حركة أو مشي عند القدرة")!;
    saveRoutineItem(walk.id, { ...walk, startTime: "20:05" });
    expect(listRoutine().find((i) => i.id === walk.id)?.startTime).toBe("20:05");
  });
  it("an untouched first draft is replaced by her schedule, keeping Al-Baqarah and its ticks", () => {
    const db = getDb();
    const baq = listRoutine().find((i) => i.title === "سورة البقرة")!;
    db.update(routineItems).set({ archivedAt: "2026-09-30 00:00:00" }).run();
    db.update(routineItems).set({ archivedAt: null, updatedAt: baq.createdAt }).where(eqId(baq.id)).run();
    const draft = ["استيقاظ", "الأطفال والتجهيز للعمل", "قراءة تخصصية", "العمل", "حركة 20 دقيقة", "وقت الأطفال", "إنجليزي 20 دقيقة", "المراجعة الأسبوعية", "قراءة شخصية 10–15 دقيقة", "نوم"];
    db.insert(routineItems).values(draft.map((title) => ({ title, startTime: "05:00", createdAt: "2026-09-30 10:00:00", updatedAt: "2026-09-30 10:00:00" }))).run();
    seedRoutine(db);
    const titles = listRoutine().map((i) => i.title);
    expect(titles).toContain("هدف معرفي واحد فقط");
    expect(titles).not.toContain("قراءة شخصية 10–15 دقيقة");
    expect(listRoutine().filter((i) => i.title === "سورة البقرة").map((i) => i.id)).toEqual([baq.id]);
    expect(routineProgress(...W).find((p) => p.item.id === baq.id)?.cycle).toBe(2);
  });
  it("energy is one per day and can change", () => {
    setEnergy("2026-10-05", "YELLOW");
    setEnergy("2026-10-05", "RED");
    expect(getEnergy("2026-10-05")).toBe("RED");
    expect(getEnergy("2026-10-06")).toBeNull();
  });
});

import { eq } from "drizzle-orm";
const eqId = (id: number) => eq(routineItems.id, id);
