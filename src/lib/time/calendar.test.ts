import { describe, expect, it } from "vitest";
import {
  day, formatRange, parseISODate, parseMonthKey, parseQuarterKey, shiftMonth, shiftQuarter,
  startOfWeek, todayIn, weekInfo, weeksOfMonth, toISODate,
} from "./calendar";

const summary = (year: number, month: number) =>
  weeksOfMonth(year, month).map((w) => `W${w.number} ${formatRange(w.start, w.end)}`);

describe("Saturday-start weeks, 4-day rule (Q4 2026 check from the build prompt)", () => {
  it("October 2026 has W40–W43, 3 Oct – 30 Oct", () => {
    expect(summary(2026, 9)).toEqual(["W40 3–9 Oct", "W41 10–16 Oct", "W42 17–23 Oct", "W43 24–30 Oct"]);
  });
  it("November 2026 has W44–W47, 31 Oct – 27 Nov", () => {
    expect(summary(2026, 10)).toEqual(["W44 31 Oct–6 Nov", "W45 7–13 Nov", "W46 14–20 Nov", "W47 21–27 Nov"]);
  });
  it("December 2026 has 5 weeks W48–W52, 28 Nov – 1 Jan", () => {
    expect(summary(2026, 11)).toEqual([
      "W48 28 Nov–4 Dec", "W49 5–11 Dec", "W50 12–18 Dec", "W51 19–25 Dec", "W52 26 Dec–1 Jan",
    ]);
  });
  it("1–2 Oct 2026 belong to the 26 Sep – 2 Oct week, counted in September, marked as a bridge week", () => {
    for (const d of [day(2026, 9, 1), day(2026, 9, 2)]) {
      const w = weekInfo(d);
      expect(toISODate(w.start)).toBe("2026-09-26");
      expect(w.month).toBe(8);
      expect(w.quarter).toBe(3);
      expect(w.number).toBe(39);
      expect(w.bridge).toBe(true);
    }
  });
  it("weeks start Saturday and end Friday", () => {
    const w = weekInfo(day(2026, 9, 7));
    expect(w.start.getUTCDay()).toBe(6);
    expect(w.end.getUTCDay()).toBe(5);
  });
  it("1 Jan 2027 belongs to W52 of 2026; W1 2027 starts Sat 2 Jan", () => {
    expect(weekInfo(day(2027, 0, 1))).toMatchObject({ year: 2026, number: 52 });
    const w1 = weekInfo(day(2027, 0, 2));
    expect(w1).toMatchObject({ year: 2027, number: 1 });
  });
  it("every month of 2026–2028 has 4 or 5 weeks and every week appears exactly once", () => {
    const seen = new Set<string>();
    for (let y = 2026; y <= 2028; y++)
      for (let m = 0; m < 12; m++) {
        const weeks = weeksOfMonth(y, m);
        expect(weeks.length === 4 || weeks.length === 5).toBe(true);
        for (const w of weeks) {
          const k = toISODate(w.start);
          expect(seen.has(k)).toBe(false);
          seen.add(k);
        }
      }
  });
  it("week start is configurable (Monday)", () => {
    expect(toISODate(startOfWeek(day(2026, 9, 1), 1))).toBe("2026-09-28");
  });
});

describe("parsing and shifting", () => {
  it("rejects invalid dates", () => {
    expect(parseISODate("2026-02-30")).toBeNull();
    expect(parseISODate("hello")).toBeNull();
    expect(parseMonthKey("2026-13")).toBeNull();
    expect(parseQuarterKey("2026-q5")).toBeNull();
  });
  it("shifts months and quarters across years", () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
    expect(shiftQuarter(2026, 4, 1)).toEqual({ year: 2027, quarter: 1 });
    expect(shiftQuarter(2026, 1, -1)).toEqual({ year: 2025, quarter: 4 });
  });
  it("today is computed in Reem's time zone, not the server's", () => {
    // 22:30 UTC on 30 Sep = 01:30 on 1 Oct in Riyadh
    const now = new Date(Date.UTC(2026, 8, 30, 22, 30));
    expect(toISODate(todayIn("Asia/Riyadh", now))).toBe("2026-10-01");
    expect(toISODate(todayIn("UTC", now))).toBe("2026-09-30");
  });
});
