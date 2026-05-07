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
- Auth (magic link OTP, SSR cookies, middleware)
- Jamaah app (prayer strip, quotes, discover, mosque detail, infaq, profile)
- DKM dashboard (kas, verifikasi, kajian, pengumuman, QR, broadcast, settings)
- TV Display
- Premium upgrade page
- Demo data & auto-login
- Landing page + SEO

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
**Fix Demo Login in Production**
- Goal: Demo DKM + Jamaah login E2E works on `umatpro.com`
- Tasks: seed data, verify login, set WA admin number, update docs

## Next Phases
- **Phase A**: Kampanye donasi UI
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
