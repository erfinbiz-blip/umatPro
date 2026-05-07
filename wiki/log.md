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
