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

import { getEnergy, listRoutine, routineForDay, routineProgress, saveRoutineItem, setEnergy, setRoutineCheck } from "./repo";

describe("daily routine", () => {
  it("is seeded from 5:00 to 22:00, with Al-Baqarah as a 90-reading cycle", () => {
    const items = listRoutine();
    expect(items[0]).toMatchObject({ startTime: "05:00" });
    expect(items.at(-1)).toMatchObject({ startTime: "22:00" });
    expect(items.find((i) => i.title === "سورة البقرة")).toMatchObject({ targetCount: 90, activeFrom: "2026-10-01" });
  });
  it("shows only the weekday's items (work Sunday to Thursday, review on Friday)", () => {
    const fri = routineForDay("2026-10-09", "2026-10-03", "2026-10-09").map((i) => i.item.title);
    expect(fri).toContain("المراجعة الأسبوعية");
    expect(fri).not.toContain("العمل");
    const sun = routineForDay("2026-10-04", "2026-10-03", "2026-10-09").map((i) => i.item.title);
    expect(sun).toContain("العمل");
    expect(sun).not.toContain("المراجعة الأسبوعية");
  });
  it("one tick feeds the weekly minimum and the cycle; unticking takes it back", () => {
    const eng = listRoutine().find((i) => i.title.startsWith("إنجليزي"))!;
    const baq = listRoutine().find((i) => i.title === "سورة البقرة")!;
    for (const d of ["2026-10-03", "2026-10-04"]) {
      setRoutineCheck(eng.id, d, true);
      setRoutineCheck(baq.id, d, true);
    }
    setRoutineCheck(eng.id, "2026-10-04", true); // twice the same day counts once
    const day = routineForDay("2026-10-04", "2026-10-03", "2026-10-09");
    expect(day.find((i) => i.item.id === eng.id)).toMatchObject({ done: true, week: 2 });
    expect(day.find((i) => i.item.id === baq.id)).toMatchObject({ done: true, cycle: 2 });
    setRoutineCheck(eng.id, "2026-10-04", false);
    expect(routineProgress("2026-10-03", "2026-10-09").find((p) => p.item.id === eng.id)?.week).toBe(1);
    expect(routineForDay("2026-09-30", "2026-09-26", "2026-10-02").find((i) => i.item.id === baq.id)).toBeUndefined(); // before its cycle
  });
  it("items can be edited", () => {
    const eng = listRoutine().find((i) => i.title.startsWith("إنجليزي"))!;
    saveRoutineItem(eng.id, { ...eng, startTime: "20:00" });
    expect(listRoutine().find((i) => i.id === eng.id)?.startTime).toBe("20:00");
  });
  it("energy is one per day and can change", () => {
    setEnergy("2026-10-05", "YELLOW");
    setEnergy("2026-10-05", "RED");
    expect(getEnergy("2026-10-05")).toBe("RED");
    expect(getEnergy("2026-10-06")).toBeNull();
  });
});
