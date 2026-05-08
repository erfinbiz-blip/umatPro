# Wiki Log

## [2026-05-06] ingest | CONTEXT.md
- Copied `CONTEXT.md` to `wiki/raw/`
- Created [[sources/context]] — source summary
- Created [[entities/umat-pro]] — project entity page
- Updated [[index]]

## [2026-05-06] ingest | PRD.md
- Copied `PRD.md` to `wiki/raw/`
- Created [[sources/prd]] — source summary
- Created [[concepts/tech-stack]] — technology stack concept page
- Updated [[index]]

## [2026-05-06] setup | Wiki initialization
- Created `wiki/` directory structure
- Wrote `wiki/AGENTS.md` — wiki guide and conventions
- Created `wiki/index.md` — content catalog
- Created `wiki/log.md` — this file

## [2026-05-07] analyze | Architecture review
- Deep codebase analysis of modules, seams, and coupling
- Identified 10 architectural debt items (3 critical, 3 high, 3 medium, 3 low)
- Created [[concepts/architecture]] — full architecture analysis with depth assessment
- Updated [[index]] with new concept page

## [2026-05-07] upgrade | Next.js 14 → 16 + React 18 → 19
- Upgraded `next` from 14.2.3 to 16.2.5
- Upgraded `react` and `react-dom` from 18.3.1 to 19.2.6
- Updated `@types/react` and `@types/react-dom` to v19
- Ran `next-async-request-api` codemod: converted `params` to `Promise` in `app/mosque/[id]/page.tsx`
- Removed deprecated `eslint` config from `next.config.mjs`
- All tests pass (9/9), build succeeds
- Branch: `next-15-upgrade`

## [2026-05-08] feature | DKM Onboarding Improvement
- **Goal**: Pisahkan tab login Jamaah/DKM di `/auth`, dan buat dedicated onboarding flow untuk user DKM baru tanpa masjid
- **Changes**:
  - `app/auth/page.tsx` — Tab switcher **Jamaah** | **DKM** dengan redirect berbeda (`/app` vs `/dkm`)
  - `app/dkm/onboarding/page.tsx` — Halaman onboarding 2-step (Data Masjid → Rekening opsional) untuk user DKM baru
  - `app/dkm/(takmir)/page.tsx` — Hapus `RegisterMosqueForm` (pindah ke onboarding), redirect ke `/dkm/onboarding` jika belum punya mosque
  - `proxy.ts` — Middleware logic: `/dkm` tanpa mosque → redirect `/dkm/onboarding`, `/dkm/onboarding` tanpa login → `/auth`, sudah punya mosque → `/dkm`
  - `__tests__/middleware.test.ts` — 3 test case baru untuk onboarding redirect (8/8 pass)
- **Tests**: 73/73 pass (12 test files)
- **Plan**: `wiki/plans/dkm-onboarding.md`

- **Root cause**: `@supabase/ssr` v0.3.0 changed cookie API from `getAll/setAll` to `get/set/remove`. Production code still used old API, causing session cookies to not be read by middleware after demo login.
- **Symptom**: "Demo DKM" and "Demo Jamaah" buttons showed spinner indefinitely, redirecting back to `/auth`.
- **Files changed**:
  - `app/auth/confirm/route.ts` — Updated cookie methods to `get/set/remove`
  - `lib/supabase/server.ts` — Updated cookie methods
  - `lib/supabase/client.ts` — Added `PUBLISHABLE_KEY` fallback
  - `proxy.ts` — Updated cookie methods
- **Commit**: `b34390d fix: update @supabase/ssr cookie API from getAll/setAll to get/set/remove`
- **Verification**: Both demo buttons now work on `umatpro.com` — DKM redirects to `/dkm`, Jamaah redirects to `/app`.

## [2026-05-07] refactor | Business logic extraction from UI
- Extracted embedded business logic from 5 HIGH-priority components into `lib/` and `hooks/`
- **Infaq domain**: `lib/infaq/validation.ts`, `campaign.ts`, `constants.ts`, `calculation.ts`, `status.ts`, `qr.ts`; `hooks/useInfaqFlow.ts`, `useClipboard.ts`
- **Kas domain**: `lib/money/format.ts`, `lib/kas/validation.ts`, `upload.ts`; `hooks/useKasForm.ts`
- **Prayer domain**: `lib/prayer/countdown.ts`, `constants.ts`; `hooks/usePrayerCountdown.ts`
- **Verification**: `hooks/useVerification.ts`
- **Refactored components**: `InfaqFlow.tsx`, `KasForm.tsx`, `PrayerSchedule.tsx`, `InfaqQR.tsx`, `VerifyItem.tsx`, `DailyQuote.tsx`, `WABroadcast.tsx`
- **Tests**: 12 test files, 70 tests all passing
- **Commits**: `feat: extract infaq business logic`, `feat: extract kas business logic`, `feat: extract prayer/qr/verification business logic`, `fix: ts errors in useVerification and upload test`
- Branch: `fix/business-logic-extraction`
