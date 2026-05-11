---
type: source
date: 2026-05-06
source_count: 1
tags: [prd, umat-pro, requirements]
---

# PRD.md — Product Requirements Document

## Source
[[raw/PRD.md]]

## Summary
Product requirements for UmatPro — a mosque ecosystem platform. Document defines what's done, what not to touch, what's half-done, current phase, and next phases.

## Already Done
- Auth (magic link OTP, SSR cookies, middleware, dual role login)
- Jamaah app (prayer strip, quotes, discover, mosque detail, infaq, profile)
- DKM dashboard (kas, verifikasi, kajian, pengumuman, QR, broadcast, settings)
- DKM onboarding (dedicated flow for new admins)
- TV Display
- Premium upgrade page
- Demo data & auto-login
- Landing page + SEO
- **Phase A: Kampanye Donasi** (2026-05-09) — DKM CRUD + Jamaah discovery + donation flow
- **Platform Roles + Superadmin** (2026-05-11) — `platform_roles` table, RLS policies, `/superadmin` dashboard

## Do Not Touch (Critical)
- `middleware.ts` — auth protection, needs test coverage update
- `app/auth/confirm/route.ts` — cookie attachment pattern critical
- `app/api/demo-session/route.ts` — layered diagnostics
- `lib/supabase/{client,server,admin}.ts` — wrappers, changes break everything
- `public/landing.html` — SEO copy
- `supabase/migrations/001_initial_schema.sql` — production migration
- `next.config.mjs` `ignoreBuildErrors: true` — intentional for Vercel

## Half-Done
- Demo login in production (needs seed + E2E verification)
- `NEXT_PUBLIC_WA_ADMIN_NUMBER` env var
- Server-side tier enforcement (client-side only, bypassable)
- Premium features promised but not built (PDF, verification, analytics)
- 21 pre-existing TypeScript errors
- Push notifications (service worker exists, no logic)

## Current Phase
**Next: Phase B — Laporan Keuangan PDF**
- Goal: Export kas bulanan ke PDF dengan kop masjid (premium benefit)
- Driver: monetization untuk tier premium

## Phase History
- ✅ **Phase A**: Kampanye donasi UI — completed 2026-05-09

## Next Phases
- **Phase B**: Laporan keuangan PDF (premium)
- **Phase C**: PWA install banner
- **Phase D**: Push notif jadwal sholat
- **Phase E**: Verifikasi masjid (admin-only)
- **Phase F**: Server-side tier enforcement
- **Phase G**: Backlog (multi-masjid, marketplace, social check, etc.)

## Tech Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage)
- Vercel deployment
- Vitest + `@edge-runtime/vm`
- `adhan` library for prayer times
