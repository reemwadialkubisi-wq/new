import { describe, expect, it } from "vitest";
import { ALL_NAV_ITEMS, NAV, isActive } from "./nav";
import { LIFE_AREAS } from "./areas";

describe("navigation has no duplicates", () => {
  it("every href and label appears exactly once", () => {
    const hrefs = ALL_NAV_ITEMS.map((i) => i.href);
    const labels = ALL_NAV_ITEMS.map((i) => i.label);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(new Set(labels).size).toBe(labels.length);
  });
  it("has the six approved groups in order", () => {
    expect(NAV.map((g) => g.label)).toEqual(["نظرة عامة", "التخطيط", "الحياة", "النمو", "الإبداع", "المراجعة"]);
  });
  it("no Tasks, Calendar or Habits pages exist", () => {
    for (const bad of ["tasks", "calendar", "habits", "todo", "actions"])
      expect(ALL_NAV_ITEMS.some((i) => i.href.includes(bad))).toBe(false);
  });
  it("there are 11 life areas with unique homes", () => {
    expect(LIFE_AREAS).toHaveLength(11);
    expect(new Set(LIFE_AREAS.map((a) => a.href)).size).toBe(11);
  });
  it("exactly one item is active for each area page", () => {
    for (const a of LIFE_AREAS) {
      const active = ALL_NAV_ITEMS.filter((i) => isActive(i, a.href));
      expect(active.length, a.href).toBe(1);
    }
  });
});
