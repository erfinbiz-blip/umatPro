---
type: source
date: 2026-05-06
source_count: 1
tags: [context, umat-pro, project-status]
---

# CONTEXT.md — UmatPro Project Context

## Source
[[raw/CONTEXT.md]]

## Summary
UmatPro is a digital platform for Indonesian mosque ecosystems. Built with [[Next.js]] 14 + [[Supabase]], deployed on [[Vercel]] at `umatpro.com`. The project exists not for business but out of a personal longing to stay connected with mosques and contribute digitally when physical presence isn't possible.

## Core Values
- **Transparansi** — trust in financial management
- **Kedekatan** — feeling connected to mosque despite distance
- **Kemudahan** — usable by non-technical mosque admins
- **Keberkahan** — every line of code as ongoing charity

## Current Status
- **Pre-release**: Ready with notes — 1 env var blocker (`NEXT_PUBLIC_WA_ADMIN_NUMBER`)
- **Tests**: 9/9 passing
- **Build**: `ignoreBuildErrors: true` (21 pre-existing TS errors)
- **Demo data**: Seeded in Supabase

## Architecture
- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS
- **Backend**: Next.js Route Handlers + Supabase
- **Database**: PostgreSQL (migrations 001-003 live)
- **Auth**: Supabase magic link OTP + SSR cookies
- **Storage**: Supabase Storage bucket `kas-receipts`
- **Testing**: Vitest + `@edge-runtime/vm`

## Key Features Implemented
- Auth system with demo accounts
- Jamaah app (home, discover, mosque detail, infaq, profile)
- DKM dashboard (kas, verifikasi, kajian, pengumuman, QR, broadcast, settings)
- TV Display for mosques
- Premium upgrade page (Free vs Premium Rp 99rb/bln)
- Demo data & auto-login

## Monetization
| Fitur | Model | Status |
|-------|-------|--------|
| Tier Premium DKM | Subscription | Live |
| Broadcast WA Unlimited | Premium only | Gated |
| Laporan PDF | Premium only | Not built |
| Verifikasi Masjid | Premium benefit | Not built |
| Pasar Masjid | Revenue share | UI not built |

## Blockers
1. `NEXT_PUBLIC_WA_ADMIN_NUMBER` — still fallback to dummy number
2. Demo login not yet verified in production

## Backlog Highlights
- Push notifications (VAPID keys needed)
- Kampanye donasi UI
- Laporan keuangan PDF
- Multi-masjid support
- Pasar masjid marketplace
