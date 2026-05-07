---
type: concept
date: 2026-05-07
source_count: 1
tags: [architecture, seams, depth, modules]
---

# Architecture Analysis — UmatPro

## Domain Context

UmatPro serves two personas: **Jamaah** (congregants) and **DKM/Takmir** (mosque management). The codebase manages mosque finances (kas), infaq donations, study schedules (kajian), announcements, and a TV display. Financial integrity and transparency are core values.

## Current Architecture Overview

### Stack
- Next.js 14 App Router
- Supabase (PostgreSQL + Auth + Storage)
- Tailwind CSS with custom tokens
- Vitest + @edge-runtime/vm

### Module Map

**Data Access Seam:**
- `lib/supabase/client.ts` — Browser client factory
- `lib/supabase/server.ts` — Server client factory (cookie-aware)
- `lib/supabase/admin.ts` — Service role client factory
- `middleware.ts` — Creates its own server client inline

**Auth Seam:**
- `lib/auth/mosque.ts` — Mixed auth + role resolution + redirect side effects

**Business Logic Modules:**
- `lib/infaq/code.ts` — Unique 3-digit infaq code generation with collision avoidance
- `lib/prayer/calculate.ts` — Prayer time calculation via adhan library
- `lib/atmosphere/index.ts` — Prayer-time gradient mapping
- `lib/quotes/daily.ts` — 31-quote deterministic rotation

**API Routes (Seam adapters):**
- `api/infaq/generate` — Code generation endpoint
- `api/prayer-times` — Prayer calculation endpoint
- `api/wa-message` — WhatsApp message formatting + financial data
- `api/demo-session` — Demo auto-login
- `api/seed-demo` — Demo data seeding

**UI Components:**
- `components/jamaah/*` — Jamaah-facing UI
- `components/takmir/*` — DKM dashboard UI
- `components/tv/*` — TV display UI
- `components/ui/*` — Shared primitives (Glass, GoldButton, ArabesqueBg)

## Architectural Debt

### Critical (Security & Data Integrity)

1. **Client-Side Tier Enforcement** — Premium feature gates (broadcast WA) are client-side only. A user can bypass by intercepting Supabase responses or modifying React state. No server-side validation exists.

2. **Financial Update Race Condition** — `VerifyItem.tsx` implements a distributed transaction fallback for campaign fundraising that is non-atomic. Two concurrent verifications on the same campaign can lose updates.

3. **Unauthenticated Financial Data Exposure** — `/api/wa-message` returns mosque financial summaries (saldo, income, expenses) without any auth check. Anyone with a mosque ID can query its finances.

### High (Testability & Coupling)

4. **Business Logic Embedded in UI** — Data fetching, mutations, file uploads, and calculations are mixed into React components. `Sidebar.tsx` fetches badge counts, manages auth state, handles responsive layout, and renders navigation — all in one module.

5. **getCurrentMosqueRole Side Effects** — The auth helper redirects the browser (`window.location.href`) when unauthenticated. This is unpredictable, untestable, and assumes a browser environment making it unusable in SSR.

6. **God Components** — `app/mosque/[id]/_client.tsx` (370 lines) handles data fetching, tab state, QR modals, share handlers, and three tab views. `app/dkm/(takmir)/page.tsx` (364 lines) embeds a mosque registration form inside the dashboard page.

### Medium (Duplication & Shallow Abstractions)

7. **Duplicated Patterns:**
   - `formatRupiah` in 2 files (identical)
   - Saldo calculation in 4 files
   - WA broadcast message template in 2 files
   - Demo user emails in 2 files
   - Mosque role fetching in 6+ files

8. **Shallow Supabase Wrappers** — `lib/supabase/*.ts` add almost no abstraction beyond env var injection. The middleware bypasses them entirely. Three slightly different cookie-handling patterns exist.

9. **Missing Abstractions:**
   - No shared validation schemas (Zod)
   - No `calculateSaldo` pure function
   - No typed API client layer
   - No data fetching hooks (useMosque, useKas, etc.)
   - No Server Actions used (Next.js 14 feature)

### Low (Maintenance)

10. **21 TypeScript Errors Ignored** — `ignoreBuildErrors: true` in `next.config.mjs` masks type safety issues.
11. **No Architecture Documentation** — No ADRs exist. Decisions are not recorded.
12. **Minimal Test Coverage** — Only 2 modules tested (middleware + quotes). All business logic is untested.

## Module Depth Assessment

| Module | Depth | Assessment |
|--------|-------|------------|
| `lib/prayer/calculate.ts` | Deep | Clean interface, pure functions, focused responsibility |
| `lib/quotes/daily.ts` | Deep | Pure logic, well-tested |
| `lib/infaq/code.ts` | Medium | Good interface but hard-wired Supabase dependency |
| `lib/supabase/*.ts` | Shallow | Thin wrappers, no added value beyond env vars |
| `lib/auth/mosque.ts` | Shallow | Mixes concerns, side effects, complex generic type |
| `Sidebar.tsx` | Shallow | Too many responsibilities, interface nearly as complex as implementation |
| `VerifyItem.tsx` | Shallow | Business logic (financial transactions) in UI component |
| `api/seed-demo` | Shallow | 373-line monolith, should be script or decomposed |

## Seams Analysis

**Strong Seams:**
- Prayer calculation (`lib/prayer/calculate.ts`) — could swap adhan library without touching callers
- Quote rotation (`lib/quotes/daily.ts`) — pure function, no external deps

**Weak Seams:**
- Supabase clients — three different creation patterns, no injection point for testing
- Auth (`lib/auth/mosque.ts`) — tightly coupled to window, Supabase, and mosque_roles schema
- Financial operations — scattered across components, API routes, and RPC functions

## Recommendations

### Immediate (Security)
1. Add server-side tier check to all premium APIs
2. Move campaign fundraising update to database trigger or atomic server action
3. Add auth check to `/api/wa-message`

### Short Term (Testability)
4. Extract custom hooks for repeated data fetching
5. Create `lib/saldo.ts` with pure `calculateSaldo` function
6. Add Zod validation schemas shared between frontend and API
7. Remove redirect side effect from `getCurrentMosqueRole`
8. Add tests for `lib/infaq/code.ts` and `lib/prayer/calculate.ts`

### Medium Term (Architecture)
9. Migrate mutations to Server Actions
10. Decompose god components into focused modules
11. Fix TypeScript errors and remove `ignoreBuildErrors`
12. Create ADRs for major decisions
13. Add test coverage thresholds (target 70% for `lib/`)

## Related
- [[concepts/tech-stack]]
- [[sources/context]]
- [[entities/umat-pro]]
