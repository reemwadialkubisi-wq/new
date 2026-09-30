import { appConfig } from "../config";
import {
  MONTHS, formatDayShort, formatRange, monthKey, quarterKey, quarterOfMonth, todayIn, toISODate, weekInfo,
} from "./calendar";

/** "Where am I?" — the current period at every level, with links. */
export function currentPeriods(now: Date = new Date()) {
  const today = todayIn(appConfig.timeZone, now);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const quarter = quarterOfMonth(month);
  const week = weekInfo(today, appConfig.weekStart);
  return {
    today,
    year: { label: String(year), href: `/year/${year}` },
    quarter: { label: `Q${quarter}`, href: `/quarter/${quarterKey(year, quarter)}`, number: quarter },
    month: { label: MONTHS[month], href: `/month/${monthKey(year, month)}` },
    week: {
      label: `W${week.number}`,
      range: formatRange(week.start, week.end),
      href: `/week/${toISODate(week.start)}`,
      info: week,
    },
    day: { label: formatDayShort(today), href: "/today" },
  };
}

export type CurrentPeriods = ReturnType<typeof currentPeriods>;
