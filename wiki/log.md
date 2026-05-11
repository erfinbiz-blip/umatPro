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

## [2026-05-09] feature | Phase A — Kampanye Donasi (Complete)
- **Goal**: Lengkapi fitur kampanye donasi — DKM kelola campaign, Jamaah lihat & donasi
- **DKM Management** (`/dkm/kampanye`):
  - Full CRUD: create, edit, toggle status (draft → active ↔ paused → completed)
  - Post campaign updates with text progress
  - View donor counts and campaign statistics
  - Progress bars with raised/target amounts
- **Jamaah Discovery**:
  - `/app/kampanye` — dedicated page listing active campaigns from followed mosques
  - Featured campaigns section on Jamaah home (`/app`) — top 3 campaigns with progress
  - Campaign cards with mosque name, progress bar, deadline
- **Donation Flow**:
  - Campaign pre-selection via URL: `/app/infaq?campaign=ID`
  - Auto-selects campaign in existing infaq flow, skips "select purpose" step
  - Uses existing infaq code generation + verification workflow
- **Sidebar**: Added "Kampanye Donasi" menu item to DKM sidebar
- **Tests**: 15 test files, 95 tests all passing (new: campaign status transitions, form validation, progress calculation)
- **Build**: Successful, 28 routes generated
- **Plan**: `wiki/plans/phase-a-campaigns.md`
- **Branch**: `feat/phase-a-campaigns`
- **Files changed**: 12 files, 1279 insertions
  - New: `app/dkm/kampanye/page.tsx`, `app/app/kampanye/page.tsx`, `__tests__/campaigns/*.test.ts`
  - Modified: `app/app/(jamaah)/page.tsx`, `app/app/(jamaah)/infaq/page.tsx`, `components/jamaah/InfaqFlow.tsx`, `hooks/useInfaqFlow.ts`, `components/takmir/Sidebar.tsx`

## [2026-05-11] feature | Platform Roles + Superadmin
- **Goal**: Implementasi sistem role platform-wide untuk superadmin yang bisa manage dan verifikasi masjid
- **Database**:
  - Migration `004_platform_roles.sql` — tabel `platform_roles` (user_id, role, created_at) dengan RLS policies
  - Seed script `supabase/seed_superadmin.sql` — insert superadmin user ke auth.users, profiles, dan platform_roles
- **Auth Helper** (`lib/auth/platform.ts`):
  - `getPlatformRole(supabase)` → return 'superadmin' | null
  - `requireSuperadmin(supabase)` → throw error jika bukan superadmin
- **Superadmin Dashboard** (`/superadmin`):
  - List semua masjid dengan stats (total, terverifikasi, belum verifikasi, premium)
  - Toggle verifikasi masjid (update `is_verified`)
  - Search/filter masjid by nama atau alamat
  - Protected via layout-level role check → redirect ke `/auth`
- **Proxy Protection** (`proxy.ts`):
  - `/superadmin` tanpa login → redirect `/auth`
  - `/superadmin` dengan user biasa → redirect `/app`
  - `/superadmin` dengan superadmin → lanjut
- **Tests**: 16 test files, 105 tests all passing
  - New: `__tests__/lib/auth/platform.test.ts` (6 tests), `__tests__/middleware.test.ts` (+4 tests superadmin protection)
- **Build**: Successful
- **Plan**: `wiki/plans/platform-roles-superadmin.md`
- Branch: `feature/platform-roles-superadmin`
- Files changed: 10 files

## [2026-05-11] plan | Phase C — PWA Install Banner
- Created `wiki/plans/phase-c-pwa-install.md` — implementation plan for PWA install banner
- Status: In Progress, branch: `feat/phase-c-pwa-install`
- Plan saved to wiki, ready for execution via subagent-driven-development

## [2026-05-11] feature | Phase C — PWA Install Banner (Complete)
- **Goal**: Bottom sheet PWA install banner di `/app/*` yang muncul sekali per session, dismissable 7 hari via localStorage, dengan support Chromium dan Safari iOS
- **Changes**:
  - `hooks/usePWAInstall.ts` — Hook dengan fp-ts untuk browser detection dan state management
  - `__tests__/hooks/usePWAInstall.test.ts` — 15 tests untuk pure functions (fp-ts Option, standalone detection, iOS Safari detection, dismiss logic)
  - `components/jamaah/PWAInstallBanner.tsx` — Bottom sheet UI dengan Glassmorphism card, support Chromium (native install) dan iOS Safari (educational)
  - `app/globals.css` — Tambah `animate-slide-up` animation
  - `app/app/(jamaah)/layout.tsx` — Mount PWAInstallBanner di semua route `/app/*`
- **Tests**: 33 test files, 225 tests all passing (15 new tests)
- **Build**: Successful, no new TS errors
- **Plan**: `wiki/plans/phase-c-pwa-install.md`
- **Branch**: `feat/phase-c-pwa-install`

## [2026-05-11] fix | PWA Manifest start_url
- **Problem**: PWA yang di-install membuka landing page (`/`) bukan Jamaah app (`/app`)
- **Root cause**: `public/manifest.json` `start_url` = `/` seharusnya `/app`
- **Fix**:
  - `public/manifest.json` — `start_url`: `/` → `/app`
  - Shortcuts juga diperbaiki: `/` → `/app`, `/discover` → `/app/discover`
- **Impact**: Install PWA sekarang langsung buka Jamaah app dashboard
- **Branch**: `main` (direct fix)

## [2026-05-11] investigate | Auth behavior clarification
- **Question**: Kenapa klik "Untuk Jamaah" dari landing page bisa masuk `/app` tanpa login?
- **Finding**: BUKAN bug — `/app` sengaja public per PRD (line 9: "Home Jamaah")
- **Auth model**:
  - Public (no login): `/app` (browse), `/app/discover`, `/app/mosque/[id]` (view), `/mosque/[id]` (public profile)
  - Login required: `/app/profile`, `/app/infaq`, `/app/notifications`, follow mosque, edit profile
- **Session persistence**: No expiry (`auth.sessions.not_after` = null). Access token auto-refresh setiap 1 jam. User tetap login sampai explicit logout atau browser clear cookies.
- **Middleware protection**: Hanya `/dkm/*` dan `/superadmin/*` yang diproteksi. `/app/*` tidak diproteksi (confirmed by test: `/app tanpa login → lanjut`).
- **Conclusion**: Behavior is correct per PRD design. No code changes needed.
