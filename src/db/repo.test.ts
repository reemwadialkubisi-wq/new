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
