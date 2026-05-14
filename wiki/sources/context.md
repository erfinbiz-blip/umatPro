---
type: source
date: 2026-05-14
source_count: 1
tags: [context, umat-pro, project-status]
---

# CONTEXT.md — UmatPro Project Context

## Source
[[raw/CONTEXT.md]]

## Summary
UmatPro is a digital platform for Indonesian mosque ecosystems. Built with [[Next.js]] 16 + [[React]] 19 + [[Supabase]], deployed on [[Vercel]] at `umatpro.com`. The project exists not for business but out of a personal longing to stay connected with mosques and contribute digitally when physical presence isn't possible.

## Core Values
- **Transparansi** — trust in financial management
- **Kedekatan** — feeling connected to mosque despite distance
- **Kemudahan** — usable by non-technical mosque admins
- **Keberkahan** — every line of code as ongoing charity

## Current Status
- **Phase**: Phase B completed — 236/236 tests passing (37 test files)
- **Build**: `ignoreBuildErrors: true` (21 pre-existing TS errors, no new errors)
- **Demo data**: Seeded in Supabase
- **Current branch**: `feat/phase-b-laporan-mingguan`

## Architecture
- **Frontend**: Next.js 16.2.5 App Router + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js Route Handlers + Supabase
- **Database**: PostgreSQL (migrations 001-006 live)
- **Auth**: Supabase magic link OTP + SSR cookies
- **Storage**: Supabase Storage buckets `kas-receipts`, `weekly-reports`
- **Testing**: Vitest + `@edge-runtime/vm`
- **Libraries**: fp-ts, jspdf, jspdf-autotable, qrcode.react, adhan, lucide-react

## Key Features Implemented
- Auth system with dual role (Jamaah/DKM) + demo accounts
- Jamaah app (home, discover, mosque detail, infaq, profile, kampanye, notifications)
- DKM dashboard (kas, verifikasi, kajian, pengumuman, QR, broadcast, settings, kampanye, laporan)
- TV Display for mosques
- Premium upgrade page (Free vs Premium Rp 99rb/bln)
- Demo data & auto-login
- Platform roles + Superadmin dashboard
- PWA Install Banner
- Weekly Financial Reports (Jumat–Kamis) with PDF export

## Completed Phases
| Phase | Feature | Date | Tests |
|-------|---------|------|-------|
| A | Kampanye Donasi | 9 Mei 2026 | 95 pass |
| B | Laporan Keuangan Mingguan | 14 Mei 2026 | 236 pass |
| C | PWA Install Banner | 12 Mei 2026 | 225 pass |
| — | Platform Roles + Superadmin | 11 Mei 2026 | 105 pass |

## Monetization
| Fitur | Model | Status |
|-------|-------|--------|
| Tier Premium DKM | Subscription | ✅ Live |
| Broadcast WA Unlimited | Premium only | ✅ Gated |
| Laporan PDF | Premium only | ✅ Phase B complete |
| Verifikasi Masjid | Premium benefit | Not built |
| Pasar Masjid | Revenue share | UI not built |

## Blockers
1. `NEXT_PUBLIC_WA_ADMIN_NUMBER` — still fallback to dummy number
2. Demo login not yet verified in production

## Backlog Highlights
- Push notifications (VAPID keys needed)
- Jadwal Imam & Khatib
- Absensi Jamaah Kajian
- Multi-masjid support
- Pasar masjid marketplace
- Social Check
