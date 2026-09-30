import { describe, expect, it } from "vitest";
import { periodRef } from "./periods";
import { validateEvent, validateFocus, validatePlan, validateSettings } from "./validate";

describe("periodRef", () => {
  it("gives each level its calendar dates", () => {
    expect(periodRef("year", "2026")).toMatchObject({ startDate: "2026-01-01", endDate: "2026-12-31" });
    expect(periodRef("quarter", "2026-Q4")).toMatchObject({ key: "2026-q4", quarter: 4, startDate: "2026-10-01", endDate: "2026-12-31" });
    expect(periodRef("month", "2028-02")).toMatchObject({ month: 2, quarter: 1, startDate: "2028-02-01", endDate: "2028-02-29" });
    expect(periodRef("month", "2026-13")).toBeNull();
    expect(periodRef("quarter", "2026-q5")).toBeNull();
  });
});

describe("validatePlan", () => {
  it("trims text and drops empty priorities", () => {
    const r = validatePlan({ theme: "  Reset ", intention: "", priorities: ["أ", "", "  ب  "], status: "active" });
    expect(r).toEqual({ ok: true, value: { theme: "Reset", intention: "", priorities: ["أ", "ب"], status: "active" } });
  });
  it("holds at most 5 priorities, with a calm message", () => {
    const r = validatePlan({ priorities: ["1", "2", "3", "4", "5", "6"] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.priorities).toMatch(/5 كحد أقصى/);
  });
  it("rejects long text and unknown status", () => {
    const r = validatePlan({ theme: "x".repeat(81), status: "done" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["status", "theme"]);
  });
});

describe("validateFocus", () => {
  it("keeps only areas with text, and ignores unknown areas", () => {
    const r = validateFocus([
      { area: "health", focus: "نوم", tier: "must" },
      { area: "family", focus: "  " },
      { area: "nope", focus: "x" },
    ]);
    expect(r).toEqual({ ok: true, value: [{ area: "health", focus: "نوم", tier: "must" }] });
  });
});

describe("validateEvent", () => {
  it("requires a title and a real date", () => {
    const r = validateEvent({ title: "", date: "2026-02-30" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["date", "title"]);
  });
  it("end date cannot be before the start", () => {
    const r = validateEvent({ title: "سفر", kind: "travel", date: "2026-11-10", endDate: "2026-11-01" });
    expect(r.ok).toBe(false);
  });
  it("accepts a yearly date with an area", () => {
    const r = validateEvent({ title: "عيد ميلاد", date: "2026-03-05", yearly: "on", area: "family" });
    expect(r).toMatchObject({ ok: true, value: { yearly: true, area: "family", kind: "important_date", endDate: null } });
  });
});

describe("validateSettings", () => {
  const base = { weekStart: "6", timeZone: "Asia/Riyadh", activeAnnualGoals: "5", quarterObjectives: "5", activeProjects: "3", weeklyOutcomes: "5", green: "7", yellow: "4", red: "1" };
  it("accepts the defaults", () => {
    expect(validateSettings(base)).toMatchObject({ ok: true, value: { weekStart: 6, capacity: { optionalDaily: { RED: 1 } } } });
  });
  it("rejects unknown time zones and out-of-range numbers", () => {
    const r = validateSettings({ ...base, timeZone: "Mars/Olympus", activeProjects: "0", red: "1.5" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["activeProjects", "red", "timeZone"]);
  });
});

import { validateCapture } from "./validate";

describe("validateCapture", () => {
  it("idea keeps the first line as title and the rest as a note", () => {
    expect(validateCapture({ kind: "idea", text: "عنوان\nتفاصيل\nأكثر" })).toEqual({
      ok: true, value: { kind: "idea", title: "عنوان", note: "تفاصيل\nأكثر", date: null },
    });
  });
  it("other types become one line", () => {
    expect(validateCapture({ kind: "task", text: "اتصال\nبالمدرسة" })).toMatchObject({ ok: true, value: { title: "اتصال بالمدرسة", note: "" } });
  });
  it("needs text, a known type, and a date for «موعد»", () => {
    const r = validateCapture({ kind: "date", text: " " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["date", "text"]);
    expect(validateCapture({ kind: "nope", text: "x" }).ok).toBe(false);
  });
});
