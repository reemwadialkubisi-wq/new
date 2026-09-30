import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { closeDb } from "./index";
import { areaWeek, getEnergy, habitProgress, listHabits, listRoutine, routineForDay, setEnergy, setRoutineCheck } from "./repo";

// A real file on disk, closed and opened again, like quitting and restarting the app on the Mac.
const dir = mkdtempSync(path.join(tmpdir(), "reem-"));
process.env.DATABASE_PATH = path.join(dir, "reem.db");
afterAll(() => {
  closeDb();
  process.env.DATABASE_PATH = ":memory:";
  rmSync(dir, { recursive: true, force: true });
});

const W = ["2026-10-03", "2026-10-09"] as const;

describe("end to end on a file database", () => {
  it("tick → habit, cycle and area counts, energy, all still there after a restart", () => {
    closeDb();
    const item = (t: string) => listRoutine().find((i) => i.title === t)!;
    const english = listHabits().find((h) => h.title === "إنجليزي")!.id;
    setRoutineCheck(item("سورة البقرة").id, "2026-10-04", true);
    setRoutineCheck(item("الفجر + حركة بسيطة 10–15 دقيقة").id, "2026-10-04", true);
    setRoutineCheck(item("هدف معرفي واحد فقط").id, "2026-10-04", true, english);
    setEnergy("2026-10-04", "YELLOW");

    closeDb(); // restart

    const day = routineForDay("2026-10-04", ...W);
    expect(day.find((i) => i.item.title === "سورة البقرة")).toMatchObject({ done: true, cycle: 1 });
    expect(habitProgress(...W).find((h) => h.habit.title === "حركة")?.week).toBe(1);
    expect(habitProgress(...W).find((h) => h.habit.id === english)?.week).toBe(1);
    expect(getEnergy("2026-10-04")).toBe("YELLOW");
    // each tick lands in its area; the knowledge slot lands in the area of the pick
    expect(areaWeek("spiritual", ...W).total).toBe(2);
    expect(areaWeek("english", ...W).ticks).toEqual([{ title: "هدف معرفي واحد فقط: إنجليزي", n: 1 }]);
    expect(areaWeek("knowledge", ...W).total).toBe(0);
    expect(areaWeek("health", ...W).habits.find((h) => h.habit.title === "حركة")?.week).toBe(1);
  });
});
