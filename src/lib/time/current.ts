import { getSettings } from "@/db/repo";
import type { AppSettings } from "../config";
import {
  MONTHS_AR, formatDayShortAr, formatRangeAr, monthKey, quarterKey, quarterOfMonth, todayIn, toISODate, weekInfo,
} from "./calendar";

/** "Where am I?" — the current period at every level, with links. */
export function currentPeriods(now: Date = new Date(), settings: Pick<AppSettings, "timeZone" | "weekStart"> = getSettings()) {
  const today = todayIn(settings.timeZone, now);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const quarter = quarterOfMonth(month);
  const week = weekInfo(today, settings.weekStart);
  return {
    today,
    year: { label: String(year), href: `/year/${year}` },
    quarter: { label: `Q${quarter}`, href: `/quarter/${quarterKey(year, quarter)}`, number: quarter },
    month: { label: MONTHS_AR[month], href: `/month/${monthKey(year, month)}` },
    week: {
      label: `W${week.number}`,
      range: formatRangeAr(week.start, week.end),
      href: `/week/${toISODate(week.start)}`,
      info: week,
    },
    day: { label: formatDayShortAr(today), href: "/today" },
  };
}

export type CurrentPeriods = ReturnType<typeof currentPeriods>;
