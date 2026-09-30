import Link from "next/link";
import { Check } from "lucide-react";
import { setEnergyAction, toggleRoutineAction } from "@/app/(app)/actions";
import type { DayRoutineItem, HabitProgress, RoutineProgress } from "@/db/repo";
import type { EnergyLevel } from "@/db/schema";
import { Card, SectionTitle } from "@/components/ui/card";
import { ENERGY, Progress, TierBadge } from "@/components/ui/status";
import { LIFE_AREAS } from "@/lib/areas";
import { cn } from "@/lib/utils";

const AREA_NAME = Object.fromEntries(LIFE_AREAS.map((a) => [a.slug, a.name]));

/** YELLOW hides Could items, RED keeps only Must. Unticked items never become "overdue". */
export function visibleFor(energy: EnergyLevel | null, tier: "must" | "should" | "could") {
  if (energy === "RED") return tier === "must";
  if (energy === "YELLOW") return tier !== "could";
  return true;
}

export function EnergyPicker({ day, energy }: { day: string; energy: EnergyLevel | null }) {
  return (
    <Card className="p-6">
      <SectionTitle meta="الخطوة 1">كيف طاقتك اليوم؟ · Energy</SectionTitle>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="طاقة اليوم">
        {(Object.keys(ENERGY) as EnergyLevel[]).map((level) => {
          const on = energy === level;
          return (
            <form key={level} action={setEnergyAction}>
              <input type="hidden" name="date" value={day} />
              <input type="hidden" name="energy" value={level} />
              <button
                type="submit"
                aria-pressed={on}
                className={cn(
                  "w-full rounded-md border px-4 py-3 text-start transition-colors",
                  on ? "border-ink bg-surface-2" : "border-border hover:border-border-strong hover:bg-surface-2",
                )}
              >
                <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-ink">
                  <span className={cn("size-2 rounded-full", ENERGY[level].dot)} aria-hidden />
                  {level}
                </span>
                <span className="mt-1 block text-xs text-ink-3">{ENERGY[level].meaning}</span>
              </button>
            </form>
          );
        })}
      </div>
      <p className="mt-3 text-2xs text-ink-4">
        {energy === "YELLOW"
          ? "YELLOW: أُخفيت البنود الممكنة (Could) من جدول اليوم."
          : energy === "RED"
            ? "RED: يبقى الضروري فقط. الباقي لا يُحسب عليك."
            : "اختاري الطاقة ليتكيف جدول اليوم معها."}
      </p>
    </Card>
  );
}

const habitCount = (h: HabitProgress) =>
  h.habit.weeklyMinimum ? `${h.habit.title}: ${h.week} من ${h.habit.weeklyMinimum} هذا الأسبوع` : `${h.habit.title}: ${h.week} هذا الأسبوع`;

function Counter({ p }: { p: DayRoutineItem }) {
  const parts: string[] = [];
  if (p.habit) parts.push(habitCount(p.habit));
  if (p.week !== null) parts.push(`${p.week} من ${p.item.weeklyMinimum} هذا الأسبوع`);
  if (p.cycle !== null) parts.push(`${p.cycle} من ${p.item.targetCount}`);
  return parts.length ? <span className="text-2xs tabular-nums text-ink-3" data-testid="routine-counter">{parts.join(" · ")}</span> : null;
}

/** The day from waking to sleep. One tick = the item is done today, and its counters move with it. */
export function DailyRoutine({ day, items, energy }: { day: string; items: DayRoutineItem[]; energy: EnergyLevel | null }) {
  const shown = items.filter((i) => visibleFor(energy, i.item.tier));
  const hidden = items.length - shown.length;
  const done = shown.filter((i) => i.done).length;
  return (
    <Card className="p-6">
      <SectionTitle
        meta={
          <span className="flex items-center gap-3">
            <span className="tabular-nums" data-testid="routine-done">{done} من {shown.length}</span>
            <Link href="/settings/routine" className="font-medium text-accent-text hover:underline">تعديل الجدول</Link>
          </span>
        }
      >
        جدول اليوم · Daily Routine
      </SectionTitle>
      {shown.length ? (
        <ol className="mt-3 divide-y divide-border" data-testid="routine">
          {shown.map((p) => {
            const { item, done: isDone } = p;
            return (
              <li key={item.id} className="flex items-start gap-3 py-2.5">
                <span className="w-11 shrink-0 pt-0.5 text-xs font-medium tabular-nums text-ink-3" dir="ltr">
                  {item.startTime}
                  {item.endTime ? <span className="block text-2xs font-normal text-ink-4">{item.endTime}</span> : null}
                </span>
                {p.choices.length ? (
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                      isDone ? "border-green bg-green text-accent-ink" : "border-border-strong text-transparent",
                    )}
                  >
                    <Check className="size-3" />
                  </span>
                ) : (
                  <form action={toggleRoutineAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="date" value={day} />
                    <input type="hidden" name="done" value={isDone ? "0" : "1"} />
                    <button
                      type="submit"
                      aria-label={isDone ? `إلغاء: ${item.title}` : `تم: ${item.title}`}
                      aria-pressed={isDone}
                      className={cn(
                        "mt-0.5 flex size-5 items-center justify-center rounded-full border transition-colors",
                        isDone ? "border-green bg-green text-accent-ink" : "border-border-strong text-transparent hover:border-green",
                      )}
                    >
                      <Check className="size-3" aria-hidden />
                    </button>
                  </form>
                )}
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", isDone ? "text-ink-3" : "text-ink")} dir="auto">{item.title}</span>
                  {p.choices.length ? (
                    <span className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label={`اختاري: ${item.title}`}>
                      {p.choices.map((c) => {
                        const on = p.picked === c.habit.id;
                        return (
                          <form key={c.habit.id} action={toggleRoutineAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="date" value={day} />
                            <input type="hidden" name="pick" value={c.habit.id} />
                            <input type="hidden" name="done" value={on ? "0" : "1"} />
                            <button
                              type="submit"
                              aria-pressed={on}
                              aria-label={on ? `إلغاء: ${c.habit.title}` : `تم: ${c.habit.title}`}
                              className={cn(
                                "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-2xs font-medium transition-colors",
                                on ? "border-green bg-green-soft text-green-text" : "border-border text-ink-2 hover:bg-surface-2",
                              )}
                            >
                              {c.habit.title}
                              <span className="tabular-nums text-ink-4" dir="ltr">
                                {c.week}
                                {c.habit.weeklyMinimum ? `/${c.habit.weeklyMinimum}` : ""}
                              </span>
                            </button>
                          </form>
                        );
                      })}
                    </span>
                  ) : null}
                  <span className="flex flex-wrap items-center gap-x-2 text-2xs text-ink-4">
                    {item.area ? <span>{AREA_NAME[item.area]}</span> : null}
                    <Counter p={p} />
                  </span>
                </span>
                {item.tier !== "must" ? <TierBadge tier={item.tier} /> : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-ink-3">لا توجد بنود في جدول هذا اليوم.</p>
      )}
      {hidden ? <p className="mt-3 text-2xs text-ink-4">{hidden} بنود مخفية حسب طاقتك اليوم، ولا تُحسب عليك.</p> : null}
    </Card>
  );
}

/** Weekly minimums and cycle targets: filled only by ticks on Today. */
export function RoutineProgressList({ habits, items }: { habits: HabitProgress[]; items: RoutineProgress[] }) {
  return (
    <ul className="space-y-4" data-testid="routine-progress">
      {habits.map(({ habit, week }) => (
        <li key={`h${habit.id}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-ink" dir="auto">{habit.title}</span>
            <span className="text-xs tabular-nums text-ink-3">{habit.weeklyMinimum ? `${week} من ${habit.weeklyMinimum}` : `${week} هذا الأسبوع`}</span>
          </div>
          {habit.weeklyMinimum ? (
            <Progress value={Math.min(100, Math.round((week / habit.weeklyMinimum) * 100))} label={habit.title} className="mt-1.5" />
          ) : null}
        </li>
      ))}
      {items.map((p) => {
        const target = p.item.weeklyMinimum ?? p.item.targetCount ?? 1;
        const value = p.week ?? p.cycle ?? 0;
        return (
          <li key={p.item.id}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink" dir="auto">{p.item.title}</span>
              <span className="text-xs tabular-nums text-ink-3">
                {p.week !== null ? `${p.week} من ${p.item.weeklyMinimum}` : `${p.cycle} من ${p.item.targetCount}`}
              </span>
            </div>
            <Progress value={Math.min(100, Math.round((value / target) * 100))} label={p.item.title} className="mt-1.5" />
          </li>
        );
      })}
    </ul>
  );
}
