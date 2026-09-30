# REEM LIFE OS — نظام ريم لإدارة الحياة السنوية

A private, single-user Personal Life Operating System.
Architecture: `phase-0/REEM_LIFE_OS_Phase0_Architecture.md` (project files).

**Current phase: 1 — Design System & App Shell** (awaiting approval).

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Radix · Supabase (Postgres + Auth) · Drizzle · Vitest · Playwright · Vercel.

## Run locally
```bash
npm install
cp .env.example .env.local   # optional: without Supabase keys the app runs in preview mode (no login, nothing saved)
npm run dev                  # http://localhost:3000
```

## Checks
```bash
npm run typecheck
npm test            # calendar + navigation rules (Vitest)
npm run build && npm run test:e2e   # every route at desktop 1440, tablet 834, phone (Playwright)
```

## Connecting (one time)
1. **GitHub** — push this folder to a private repository.
2. **Supabase** — create a project; in Vercel set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ALLOWED_EMAIL`, `DATABASE_URL`; run `npm run db:migrate`. In Supabase Auth → URL configuration add `https://<your-domain>/auth/callback`.
3. **Vercel** — import the GitHub repository. Every push deploys.

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
