# REEM LIFE OS — نظام ريم لإدارة الحياة السنوية

A private, single-user Personal Life Operating System.
Architecture: `phase-0/REEM_LIFE_OS_Phase0_Architecture.md` (project files).

**Current phase: 1 — Design System & App Shell** (awaiting approval).

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Radix · SQLite + Drizzle (local database) · Vitest · Playwright. Runs locally on your Mac.

## Run locally
```bash
npm install
# nothing to configure: the database is created in data/reem.db on first run
npm run dev                  # http://localhost:3000
```

## Checks
```bash
npm run typecheck
npm test            # calendar, validation and database rules (Vitest)
npm run build && npm run test:e2e   # every route at desktop 1440, tablet 834, phone (Playwright)
```

## Your data
Everything is saved in `data/reem.db` inside this folder, on your Mac only (never pushed to GitHub).
Settings → «تنزيل نسخة احتياطية» downloads a JSON backup.

## Updating to a new version
```bash
git pull
npm install
npm run dev
```

## Structure
```
src/app/(app)/        all pages inside the shell (one folder per route)
src/app/login, auth/  magic-link sign-in (only ALLOWED_EMAIL)
src/components/ui/    design system components
src/components/shell/ sidebar, time bar, drawer, bottom bar, Quick Capture, theme
src/lib/time/         calendar rules (Saturday weeks, 4-day rule, Western digits)
src/lib/nav.ts        the one navigation definition
src/lib/areas.ts      the 11 Life Areas
src/db/               Drizzle schema; migrations in drizzle/
```
