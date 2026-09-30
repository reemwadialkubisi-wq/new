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
- Never put secrets in the repo or in chat. Keys live only in Vercel / Supabase settings.

Phases: 0 Product Architecture (done) · **1 Design System & App Shell (built, awaiting approval)** · 2 Annual / Quarter / Month · 3 Week & Today (+ light Daily Checkout, Weekly Review, Habits basics, Anti-Overload basics) · 4 Goals & Projects · 5 Life Areas · 6 Knowledge / PhD / English · 7 Career / Finance / Intellectual Assets · 8 Review System · 9 Smart Insights & Automation.

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

Next.js **15.5** (App Router) · React 19 · TypeScript **5.9** (TS 7 breaks `next.config.ts` on Next 15) · Tailwind CSS 4 · Radix Dialog · next-themes · lucide-react · Supabase (Postgres + Auth via `@supabase/ssr`) · Drizzle ORM · Vitest · Playwright · fonts via `@fontsource` (IBM Plex Sans Arabic, IBM Plex Sans, Newsreader). Runs **locally on Reem's Mac** (decided 30 Sep 2026: she does not want it online). No hosting.

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
src/db/schema.ts, drizzle/   Drizzle schema (Phase 1: app_settings only, RLS on)
tests/e2e/                   Playwright specs; src/**/*.test.ts Vitest
```

**Routes:** `/` · `/today` · `/week/[yyyy-mm-dd]` (redirects to the week start) · `/month/[yyyy-mm]` · `/quarter/[yyyy-qN]` · `/year/[yyyy]` (year selector, past years = archive) · `/goals`, `/goals/[id]` · `/projects`, `/projects/[id]` · `/areas`, `/areas/[slug]` (knowledge → `/knowledge`, assets → `/assets`) · `/knowledge` · `/ideas` · `/assets`, `/assets/[id]` · `/reviews` · `/settings` · `/system` (design-system reference) · `/login`. `/week`, `/month`, `/quarter`, `/year` redirect to the current period. Detail pages return the designed 404 until their phase.

**Auth:** if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset the app runs in "Preview mode" (no login, nothing saved). When set, every page requires a session, and **only `ALLOWED_EMAIL` can sign in** (if it's unset, nobody can).

## 6. What Phase 1 built (awaiting Reem's approval)

Design tokens and components; sidebar with 6 collapsible groups (remembered) and icon rail; time bar on every page (`2026 › Q3 › سبتمبر › W39 · 26 سبتمبر – 2 أكتوبر › الأربعاء 30 سبتمبر ● energy`, each part a link); Quick Capture dialog (Idea default, Task/Outcome/Date; saving arrives with the database); dark/light theme; responsive shell (drawer below 1024px, bottom bar Home/Today/Week/Capture below 768px); magic-link auth; designed empty page for every route, each saying which phase fills it.

Tests (all passing): 17 Vitest (calendar rules incl. Q4 2026 check, Arabic formatting, navigation has no duplicates) + 125 Playwright across desktop/tablet/phone (every route renders with one h1 and no console errors, dir=rtl + lang=ar, no Arabic-Indic digits, no horizontal scroll, no broken internal links, 404s for invalid periods, calendar weeks, one home for Knowledge/Assets, Quick Capture, theme persistence, sidebar collapse/rail persistence, sidebar fits 1440×900 and sits on the right, drawer and bottom bar, only pink/mint hues).

## 7. Commands

```bash
npm install
npm run dev                         # http://localhost:3000
npm run typecheck
npm test                            # Vitest
npm run build && npx next start -p 3100 &
PW_NO_SERVER=1 npx playwright test  # E2E against port 3100
npm run db:generate / db:migrate    # Drizzle (needs DATABASE_URL)
```
The Ctrl+K test waits for `networkidle` because the shortcut listens only after hydration.

## 8. Where it runs (decided 30 Sep 2026)

- **Local only, on Reem's Mac.** Not online, no Vercel. Run with `npm run dev` and open http://localhost:3000.
- **No login locally.** With the Supabase env vars unset the app skips auth (single local user). The magic-link code stays for a possible cloud option later but is not used.
- **Database (DECIDED 30 Sep 2026, Reem approved):** a local SQLite file via Drizzle (`better-sqlite3`), stored in the project folder (e.g. `data/reem.db`, git-ignored), with a simple backup/export. No Supabase account needed. Supabase cloud stays optional for later sync.
- **GitHub:** `reemwadialkubisi-wq/new`, branch `main` (public; Reem may switch it to private). Never commit the database file.
- **Mac setup:** install Node.js LTS from nodejs.org → `git clone https://github.com/reemwadialkubisi-wq/new.git reem-life-os` → `cd reem-life-os` → `npm install` → `npm run dev` → open http://localhost:3000.

## 9. Next steps

1. Get Reem's **approval of Phase 1** (she runs it locally on her Mac). (Local SQLite storage is already approved.)
2. Only then start **Phase 2 — Annual / Quarter / Month**: `PeriodPlan` + `AreaFocus` + Important Dates (Event) tables with migrations, year selector with archive, Q1–Q4, months with real 4/5 weeks, themes, top outcomes, area focus, editable settings (week start, time zone, capacity). Test calendar correctness, persistence, forms and errors, then stop for approval again.
