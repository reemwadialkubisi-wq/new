# REEM LIFE OS — نظام ريم لإدارة الحياة السنوية

Hand-off for any Claude Code session continuing this project. Read this whole file before changing anything.

## 1. What this is

A private, single-user **Personal Life Operating System** for Dr. Reem (executive, PhD researcher in Strategic Management, mother; high mental load, low evening energy). It is not a to-do list, calendar or habit tracker. Every screen must help answer: **Where am I now? What matters now? What should I focus on? What can wait? Am I progressing sustainably without overload?**

Time cost targets: daily use ≤ 5 min, Weekly Review ≈ 20 min, Monthly Review ≤ 60 min. Success = sustainable progress, not perfect completion (70–80% of a week is a strong week).

## 2. How to work (non-negotiable)

- Build **one phase at a time**. After each phase: **STOP → TEST → summarize what was built and tested → WAIT for Reem's explicit approval** before starting the next phase.
- Test every phase for: navigation, UX, responsiveness (desktop 1440, tablet 834, phone), data persistence, relationships, forms, errors, empty states, duplication.
- Do not change the approved architecture or design system without a clear reason and Reem's approval.
- Never create duplicate modules (no Tasks/Actions/Work Items/To-Do variants, no second page doing the same job).
- Reem writes in Arabic and English. Reply to her in a mix, short and plain, Western digits.
- Never put secrets in the repo or in chat. Never commit the database file (`data/`).

Phases: 0 Product Architecture (done) · 1 Design System & App Shell (approved 30 Sep 2026) · **2 Annual / Quarter / Month (built, awaiting approval)** · 3 Week & Today (+ light Daily Checkout, Weekly Review, Habits basics, Anti-Overload basics) · 4 Goals & Projects · 5 Life Areas · 6 Knowledge / PhD / English · 7 Career / Finance / Intellectual Assets · 8 Review System · 9 Smart Insights & Automation.

## 3. Approved decisions (as of 30 Sep 2026)

**Colours: exactly two, plus pure greys.**
- Pink `#CF6F9B`: interaction, inspiration, achievement (primary buttons, active nav, RED energy, "needs attention").
- Mint `#7FC3A7`: success, wellbeing, calm (GREEN energy, progress bars, completed, "on track"). YELLOW energy = hollow mint ring.
- Together only ~10–15% of the UI. Text on pink or mint fills is always dark. No darker/lighter shades as new colours: in light mode text stays neutral ink; soft tints are the same two colours at low opacity (`color-mix`). No amber, clay, teal or blue anywhere. `tests/e2e/palette.spec.ts` fails if any other hue appears.
- Dark theme is the default (neutral near-black `#111111`), light theme available.

**Language & direction: Arabic-first.**
- `<html lang="ar" dir="rtl">`, sidebar on the right, logical CSS only (`ms/me/ps/pe/start/end`, `text-start`), never `ml/mr/left/right`.
- Arabic labels everywhere, with the English term shown small beside it (`NavItem.en`, `LifeArea.english`, `PageHeader english` prop). Keep key English terms: Big 3, Weekly Review, GREEN/YELLOW/RED, W40, Q4.
- **Western digits (0–9) always**, including in Arabic text. Arabic Gregorian month names (يناير … ديسمبر). E2E fails on Arabic-Indic digits.
- No letter-spacing or uppercase on Arabic text (it breaks shaping). Wrap Latin labels that sit next to digits in `<bdi>` (e.g. `<bdi>W39</bdi> · 26 سبتمبر`).
- All user text inputs use `dir="auto"`.

**Calendar.**
- Weeks start **Saturday**, end Friday (Friday = rest + weekly review). Configurable later.
- A week belongs to the month/quarter/year of its **4th day**, so months have 4 or 5 weeks and no week appears twice. Week 1 = first week whose 4th day is in the new year.
- Check: Q4 2026 → Oct W40–W43 (3–30 Oct), Nov W44–W47 (31 Oct–27 Nov), Dec W48–W52 (28 Nov–1 Jan). 1–2 Oct 2026 are in the 26 Sep–2 Oct bridge week (September, Q3).
- **The system starts with Q4 2026 (1 Oct 2026)** (Reem, 30 Sep 2026: no 2025 archive). `SYSTEM_START` in `src/lib/config.ts`. Earlier year/quarter/month/week URLs redirect to the first period of their level, the year selector starts at 2026, Q1–Q3 2026 show as «قبل بداية النظام», and the back arrow is disabled on the first period. The archive rule (past years read-only) applies from 2027 on.
- "Today" is computed in `APP_TIMEZONE` (default `Asia/Riyadh`, assumed, not yet confirmed by Reem). Dates are UTC-midnight `Date`s so server/browser time zones never matter.

**Product rules.**
1. No automatic Overdue. Unfinished items: Done · Skip without penalty · Move intentionally · Pause.
2. No failure/punishment language, no streaks, points or gamification.
3. Energy per day: GREEN normal plan · YELLOW reduce optional load · RED essentials only.
4. Tiers Must / Should / Could (ضروري / مهم / ممكن). Under pressure drop Could first, never touch Must.
5. Continuous systems (English, sleep, reading, Quran, movement) are Habits with weekly minimums, not projects.
6. Annual goals are never auto-converted into daily tasks; linking down the cascade is optional and manual.
7. One Idea Inbox; ideas never auto-become projects. Weekly triage: Do now / Research later / Keep / Delete.
8. Anti-Overload: when load exceeds capacity show calmly "Your current load may exceed your available capacity." with Continue / Reduce / Pause / Move to Incubator / Delegate / Drop. Defaults: annual goals ≤5, quarter objectives ≤5, active projects ≤3, weekly outcomes ≤5, optional daily items GREEN 7 / YELLOW 4 / RED 1.
9. Archive instead of delete for goals, projects, years.
10. Store no medical data; health tracks sleep, movement, energy only.

## 4. Architecture

Full Phase 0 document lives in the project files (`phase-0/REEM_LIFE_OS_Phase0_Architecture.md`). Key points:

- **Cascade:** Life Vision → Annual Direction → Annual Goals → Quarterly Objectives → Monthly Milestones → Weekly Outcomes → Daily Actions.
- **Entities (keep separate):** Goal (result; horizon year|quarter, parent_goal_id; quarter goals = Quarterly Objectives; progress from milestones or manual, never task counts) · Project (temporary, start/end) · Milestone (belongs to a goal or project) · WeeklyOutcome · Task (date?, week?, tier, big3_slot 1|2|3|null, status open|done|skipped|moved|paused) · Event (appointment|important_date|deadline|travel) · Habit (weekly_minimum) + HabitCheck · Routine · Idea · KnowledgeNote · IntellectualAsset (pipeline IDEA → RESEARCH → WRITE → PUBLISH → REUSE) · Review (daily|weekly|monthly|quarterly|annual) + ReviewDecision · LoadCheck · CapacitySettings.
- **Time:** one `PeriodPlan` table (level year|quarter|month|week|day, dates, theme, intention, priorities, buffer, status) + `AreaFocus` rows + `DayLog` (energy, checkout).
- **11 Life Areas:** Health & Energy, Family, Career & Work, PhD & Academic, English, Knowledge, Finance, Personal & Social, Spiritual, Home, Intellectual Assets. Every entity has one area. Area status is a quiet signal (On track / Needs attention / Resting), never a score.
- **Single home per entity:** no standalone Tasks, Calendar or Habits pages. Reviews are written on their period page; `/reviews` is history + what's due. Incubator is a view inside Ideas. Knowledge page = Knowledge area; Intellectual Assets page = that area. All other Life Area pages share one template.

## 5. Stack and code layout

Next.js **15.5** (App Router) · React 19 · TypeScript **5.9** (TS 7 breaks `next.config.ts` on Next 15) · Tailwind CSS 4 · Radix Dialog · next-themes · lucide-react · SQLite (`better-sqlite3`) + Drizzle ORM · optional Supabase auth (unused locally) · Vitest · Playwright · fonts via `@fontsource` (IBM Plex Sans Arabic, IBM Plex Sans, Newsreader). Runs **locally on Reem's Mac** (decided 30 Sep 2026: she does not want it online). No hosting.

```
src/app/globals.css          design tokens (the only place colours are defined)
src/app/layout.tsx           html lang=ar dir=rtl, fonts, theme provider
src/app/(app)/layout.tsx     app shell: sidebar + time bar + bottom bar + Quick Capture (force-dynamic)
src/app/(app)/…              one folder per route (see Routes)
src/app/login, auth/         magic-link sign-in, callback, sign-out
src/middleware.ts            auth gate (see Auth)
src/components/ui/           Button, Card/Section, Field/Input/Select/Textarea, status (EnergyChip, SignalDot,
                             StatusBadge, TierBadge, Progress, Kbd), EmptyState, Planned, PageHeader, PeriodNav,
                             MainWithRail (8/4 grid), Tabs
src/components/shell/        sidebar (collapsible groups + 72px rail, state in localStorage), time bar,
                             mobile drawer + bottom bar, Quick Capture (Ctrl/⌘K), theme switch
src/lib/nav.ts               the ONE navigation definition (6 groups, Arabic + English)
src/lib/areas.ts             the 11 Life Areas
src/lib/time/calendar.ts     calendar rules + Arabic formatting (MONTHS_AR, formatDayShortAr, formatRangeAr)
src/lib/time/current.ts      "where am I" for the time bar
src/lib/config.ts            timezone, week start, capacity defaults, authConfigured
src/db/schema.ts, drizzle/   SQLite schema + migrations (settings, period_plans, area_focus, events)
src/db/index.ts              getDb(): opens data/reem.db, applies migrations, seeds a fresh DB (Q4 2026 plan)
src/db/repo.ts               all reads/writes (plans, focus, events with yearly repeat, settings, export)
src/lib/validate.ts          form validation with Arabic messages; src/lib/periods.ts period key → dates
src/app/(app)/actions.ts     server actions for every form
src/components/plan/         EditableSection + ActionForm (keeps input on errors), plan/focus/event/settings forms
src/app/api/backup/          JSON download of everything
tests/e2e/                   Playwright specs; src/**/*.test.ts Vitest
```

**Routes:** `/` · `/today` · `/week/[yyyy-mm-dd]` (redirects to the week start) · `/month/[yyyy-mm]` · `/quarter/[yyyy-qN]` · `/year/[yyyy]` (year selector, past years = archive) · `/goals`, `/goals/[id]` · `/projects`, `/projects/[id]` · `/areas`, `/areas/[slug]` (knowledge → `/knowledge`, assets → `/assets`) · `/knowledge` · `/ideas` · `/assets`, `/assets/[id]` · `/reviews` · `/settings` · `/system` (design-system reference) · `/login`. `/week`, `/month`, `/quarter`, `/year` redirect to the current period. Detail pages return the designed 404 until their phase.

**Auth:** if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset the app runs in "Preview mode" (no login, nothing saved). When set, every page requires a session, and **only `ALLOWED_EMAIL` can sign in** (if it's unset, nobody can).

## 6. What is built

**Phase 1 (approved 30 Sep 2026):** design tokens and components; sidebar with 6 collapsible groups (remembered) and icon rail; time bar on every page; Quick Capture dialog; dark/light theme; responsive shell (drawer below 1024px, bottom bar below 768px); designed empty page for every route, each saying which phase fills it.

**Phase 2 (built 30 Sep 2026, awaiting Reem's approval):**
- Local SQLite database, created automatically on first run; migrations run on startup. A fresh database is seeded with the Q4 2026 plan (quarter theme, 4 priorities, area focus, Oct/Nov/Dec themes, 2 important dates). `REEM_SEED=off` skips it.
- Year page: theme, vision, top priorities (≤5), status, area focus, important dates, Q1–Q4 cards with their themes, year selector from 2026 (includes any year with a plan). Past years (from 2027 on) are a read-only archive; nothing before Q4 2026 exists.
- Quarter page: theme, intention, priorities (≤5; become Objectives linked to goals in Phase 4), area focus, important dates, month cards with themes and week counts.
- Month page: theme, intention, top outcomes (≤5), real 4/5 weeks, important dates, area focus.
- Important Dates (Event): important date / deadline / travel / appointment, optional end date, optional yearly repeat, optional life area. Hiding archives (never deletes).
- Settings are editable and stored: week start (Sat/Sun/Mon), time zone, all capacity limits. Backup: Settings → download JSON (`/api/backup`).
- Plans, focus and events are edited in place (Edit button on each card). Errors are in Arabic and keep what was typed.
- **Quick Capture saves (brought forward from Phase 3 at Reem's request, 30 Sep 2026).** Ctrl/⌘K → Idea (default) goes to the one Idea Inbox on `/ideas` (first line = title, other lines = note); Task goes to a chosen day (default today) or no day, shown on `/today` (today, «بلا تاريخ», and earlier ones still open, never called overdue) and on the week page; Outcome goes to this week's Weekly Outcomes on the week page (over the capacity limit it saves and shows the calm Anti-Overload line); Date goes to Important Dates. Tasks and outcomes can be marked done and hidden (archived). Tables: `ideas`, `tasks`, `weekly_outcomes` (migration 0001). Still for Phase 3: Skip / Move / Pause, Big 3, idea triage and Incubator, week theme and buffer.
- **Daily routine checklist (Reem, 30 Sep 2026; the Routine + Habits part of Phase 3, started early at her request).** Her day from 05:00 to 22:00 is a checklist on `/today`, edited at `/settings/routine`. One entity: `routine_items` (time, optional end, area, tier, weekdays, optional weekly minimum, optional cycle target with dates) + `routine_checks` (one row per item per day). One tick is the only input: it counts toward the item's weekly minimum («2 من 3 هذا الأسبوع», shown on Today and in «الأنظمة المستمرة» on the week page) and its cycle target (Al-Baqarah «12 من 90», 1 Oct – 30 Dec). No streaks, no overdue, nothing logged twice. Energy (`day_logs`, one per day) is chosen on Today and shown in the time bar: YELLOW hides Could items, RED keeps Must only. Seeded from the Q4 plan (work Sunday–Thursday, weekly review Friday; times marked «الوقت مقترح» are guesses awaiting Reem's corrections). `seedRoutine` runs on any database that has no routine yet (migration 0002).

Tests (all passing): 50 Vitest (calendar, navigation, period dates, validation, database: seed, plan upsert, focus replace, yearly and multi-day events, archive, settings) + 171 Playwright across desktop/tablet/phone (Phase 1 suite + seeded Q4 plan, save and reload, errors keep input, month → quarter flow, area focus, events add/validate/hide, nothing before Q4 2026, settings, backup, side-column form fits at 1024px, Quick Capture for all four types and where each lands, daily routine ticks feeding weekly minimums, energy hiding optional items, routine editor). E2E uses its own database file.

## 7. Commands

```bash
npm install
npm run dev                         # http://localhost:3000
npm run typecheck
npm test                            # Vitest
npm run build && npx next start -p 3100 &
PW_NO_SERVER=1 npx playwright test  # E2E against port 3100
npm run db:generate                 # after changing src/db/schema.ts: writes a new migration in drizzle/ (applied automatically on next start)
DATABASE_PATH=/tmp/e2e.db npx next start -p 3100   # e2e server with a throwaway database
```
The Ctrl+K test waits for `networkidle` because the shortcut listens only after hydration.

## 8. Where it runs (decided 30 Sep 2026)

- **Local only, on Reem's Mac.** Not online, no Vercel. Run with `npm run dev` and open http://localhost:3000.
- **No login locally.** With the Supabase env vars unset the app skips auth (single local user). The magic-link code stays for a possible cloud option later but is not used.
- **Database (DECIDED 30 Sep 2026, Reem approved):** a local SQLite file via Drizzle (`better-sqlite3`), stored in the project folder (e.g. `data/reem.db`, git-ignored), with a simple backup/export. No Supabase account needed. Supabase cloud stays optional for later sync.
- **GitHub:** `reemwadialkubisi-wq/new`, branch `main` (public; Reem may switch it to private). Never commit the database file.
- **Mac setup:** install Node.js LTS from nodejs.org → `git clone https://github.com/reemwadialkubisi-wq/new.git reem-life-os` → `cd reem-life-os` → `npm install` → `npm run dev` → open http://localhost:3000.

## 9. Next steps

1. Get Reem's **approval of Phase 2** (she runs it locally: `git pull`, `npm install`, `npm run dev`).
2. Only then start **Phase 3 — Week & Today**: week plan (theme, Weekly Outcomes ≤5, buffer), Today (energy GREEN/YELLOW/RED, Big 3, tasks, appointments), Skip / Move / Pause (no Overdue), light Daily Checkout and Weekly Review, Habits basics, Anti-Overload basics, idea triage. (Quick Capture saving already exists.) Test, then stop for approval again.
