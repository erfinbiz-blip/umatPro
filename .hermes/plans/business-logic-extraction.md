# Plan: Extract Business Logic from UI Components

## Goal
Extract embedded business logic from 5 HIGH-priority UI components into dedicated hooks (`hooks/`) and library modules (`lib/`). Follow TDD — write tests before implementation.

## Branch
`fix/business-logic-extraction`

## Scope (HIGH Priority Only)

### 1. InfaqFlow.tsx → `hooks/useInfaqFlow.ts` + `lib/infaq/validation.ts` + `lib/infaq/campaign.ts`
| Logic | Current Location | New Home |
|---|---|---|
| Step state machine (`select→amount→code→done`) | `InfaqFlow.tsx:28` | `hooks/useInfaqFlow.ts` |
| Amount validation (min 5000, regex strip) | `InfaqFlow.tsx:37,44-47` | `lib/infaq/validation.ts` |
| Campaign progress calc (capped at 100%) | `InfaqFlow.tsx:113-115` | `lib/infaq/campaign.ts` |
| API call `/api/infaq/generate` | `InfaqFlow.tsx:52-77` | `hooks/useInfaqFlow.ts` |
| Copy-to-clipboard with timeout | `InfaqFlow.tsx:79-83` | `hooks/useClipboard.ts` (shared) |
| Quick amounts constant | `InfaqFlow.tsx:25` | `lib/infaq/constants.ts` |

### 2. KasForm.tsx → `hooks/useKasForm.ts` + `lib/kas/validation.ts` + `lib/kas/upload.ts`
| Logic | Current Location | New Home |
|---|---|---|
| Amount parsing (`replace(/\D/g)`, `toLocaleString`) | `KasForm.tsx:24,129-130` | `lib/money/format.ts` |
| Validation (min 100, description required) | `KasForm.tsx:28-35` | `lib/kas/validation.ts` |
| Form state machine (`loading`/`error`/`success`) | `KasForm.tsx:16-22` | `hooks/useKasForm.ts` |
| Receipt upload path + storage | `KasForm.tsx:47-59` | `lib/kas/upload.ts` |
| DB insert `kas_transactions` | `KasForm.tsx:62-70` | `hooks/useKasForm.ts` |

### 3. VerifyItem.tsx → `hooks/useVerification.ts` + `lib/infaq/campaign.ts`
| Logic | Current Location | New Home |
|---|---|---|
| Expiry check (`expiresAt < new Date()`) | `VerifyItem.tsx:26-27` | `lib/infaq/validation.ts` |
| Verify action (update `infaq_codes`) | `VerifyItem.tsx:29-41` | `hooks/useVerification.ts` |
| Campaign aggregation (RPC + fallback) | `VerifyItem.tsx:43-63` | `lib/infaq/campaign.ts` |
| Reject action | `VerifyItem.tsx:70-77` | `hooks/useVerification.ts` |
| Status badge logic | `VerifyItem.tsx:84-92` | `lib/infaq/status.ts` |
| Total transfer formatting | `VerifyItem.tsx:112-113` | `lib/infaq/calculation.ts` |

### 4. PrayerSchedule.tsx → `hooks/usePrayerCountdown.ts` + `lib/prayer/countdown.ts`
| Logic | Current Location | New Home |
|---|---|---|
| `getSecondsUntil(timeStr)` | `PrayerSchedule.tsx:19-27` | `lib/prayer/countdown.ts` |
| `formatCountdown(seconds)` | `PrayerSchedule.tsx:29-36` | `lib/prayer/countdown.ts` |
| Next-prayer selection (min scan) | `PrayerSchedule.tsx:48-58` | `hooks/usePrayerCountdown.ts` |
| 1s interval ticker | `PrayerSchedule.tsx:43-67` | `hooks/usePrayerCountdown.ts` |
| `mainPrayers` filter (`syuruq`) | `PrayerSchedule.tsx:69` | `lib/prayer/constants.ts` |

### 5. InfaqQR.tsx → `lib/infaq/qr.ts`
| Logic | Current Location | New Home |
|---|---|---|
| URL construction (`window.location.origin` fallback) | `InfaqQR.tsx:17-19` | `lib/infaq/qr.ts` |
| Download QR (canvas → PNG → slugify) | `InfaqQR.tsx:21-28` | `lib/infaq/qr.ts` |
| Print QR (HTML document generation) | `InfaqQR.tsx:30-60` | `lib/infaq/qr.ts` |

### 6. Shared Extracts
| Logic | Used By | New Home |
|---|---|---|
| `useClipboard.ts` | InfaqFlow, DailyQuote, WABroadcast | `hooks/useClipboard.ts` |
| `formatRupiah` | Multiple | Already in `lib/infaq/code.ts` — keep, but consider `lib/money/format.ts` |
| `useBadgeCounts.ts` | Sidebar | `hooks/useBadgeCounts.ts` |
| `useMosqueTier.ts` | Sidebar | `hooks/useMosqueTier.ts` |

## New Files to Create

```
lib/
  infaq/
    validation.ts      — parseAmount, validateMinAmount, isExpired
    campaign.ts        — calculateProgress, incrementCampaignRaised
    constants.ts       — QUICK_AMOUNTS, MIN_CODE, MAX_CODE
    calculation.ts     — calculateTotalTransfer
    status.ts          — getStatusBadge, getStatusLabel
    qr.ts              — buildInfaqUrl, downloadQR, printQR
  kas/
    validation.ts      — validateKasAmount, validateDescription
    upload.ts          — uploadReceipt, getReceiptPublicUrl
  prayer/
    countdown.ts       — getSecondsUntil, formatCountdown
    constants.ts       — PRAYER_ORDER, PRAYER_LABELS, filterSyuruq
  money/
    format.ts          — formatRupiah, parseAmountInput
  date/
    format.ts          — formatExpiry, formatCountdown (generic)
  mosque/
    url.ts             — buildMosqueUrl

hooks/
  useInfaqFlow.ts      — state machine + generate API call
  useKasForm.ts        — form state + submit + upload
  useVerification.ts   — verify + reject + loading states
  usePrayerCountdown.ts — polling + next prayer selection
  useClipboard.ts      — copy + auto-reset
  useBadgeCounts.ts    — draft kas + pending infaq counts
  useMosqueTier.ts     — fetch mosque + tier
```

## Test Plan (TDD)

Write tests BEFORE implementation for:
1. `lib/infaq/validation.ts` — parseAmount, validateMinAmount
2. `lib/infaq/campaign.ts` — calculateProgress (edge: 0, >100, null target)
3. `lib/prayer/countdown.ts` — getSecondsUntil, formatCountdown
4. `lib/kas/validation.ts` — validateKasAmount, validateDescription
5. `lib/money/format.ts` — formatRupiah, parseAmountInput
6. `lib/infaq/qr.ts` — buildInfaqUrl (SSR vs client)

Integration tests (optional, if time):
- `hooks/useInfaqFlow.ts` — vitest + react-hooks testing library
- `hooks/useKasForm.ts` — mock Supabase

## Refactor Steps

1. **Create `lib/money/format.ts`** — extract `formatRupiah` from `lib/infaq/code.ts` (keep re-export for compat)
2. **Create `lib/infaq/validation.ts`** — tests + impl
3. **Create `lib/infaq/campaign.ts`** — tests + impl
4. **Create `hooks/useInfaqFlow.ts`** — tests + impl
5. **Refactor `InfaqFlow.tsx`** — use new hook + lib
6. **Create `lib/kas/validation.ts`** + `lib/kas/upload.ts` — tests + impl
7. **Create `hooks/useKasForm.ts`** — tests + impl
8. **Refactor `KasForm.tsx`** — use new hook + lib
9. **Create `lib/infaq/status.ts`** + `lib/infaq/calculation.ts`
10. **Create `hooks/useVerification.ts`** — tests + impl
11. **Refactor `VerifyItem.tsx`** — use new hook + lib
12. **Create `lib/prayer/countdown.ts`** + `lib/prayer/constants.ts` — tests + impl
13. **Create `hooks/usePrayerCountdown.ts`**
14. **Refactor `PrayerSchedule.tsx`** — use new hook + lib
15. **Create `lib/infaq/qr.ts`** — tests + impl
16. **Refactor `InfaqQR.tsx`** — use new service
17. **Create `hooks/useClipboard.ts`**
18. **Refactor `DailyQuote.tsx`** + `WABroadcast.tsx` — use shared hook
19. **Create `hooks/useBadgeCounts.ts`** + `hooks/useMosqueTier.ts`
20. **Refactor `Sidebar.tsx`** — use new hooks
21. **Run full test suite**
22. **Commit**

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `formatRupiah` widely imported from `lib/infaq/code.ts` | Keep re-export in `lib/infaq/code.ts` until full migration |
| Supabase client creation in hooks (anti-pattern per AGENTS.md) | Accept `supabase` as param in hooks, create in page/component |
| 21 pre-existing TS errors | Don't touch unrelated files; verify our changes don't add errors |
| `ignoreBuildErrors: true` masks issues | Run `pnpm tsc --noEmit` after refactor to check |

## Do Not Touch (per PRD)
- `middleware.ts`
- `app/auth/confirm/route.ts`
- `app/api/demo-session/route.ts`
- `lib/supabase/{client,server,admin}.ts`
- `public/landing.html`
- `supabase/migrations/001_initial_schema.sql`
- `next.config.mjs`

## Definition of Done
- [ ] All 5 HIGH-priority components refactored
- [ ] Business logic lives in `lib/` or `hooks/`, not in `.tsx`
- [ ] Tests written BEFORE implementation for all new `lib/` modules
- [ ] All tests pass (`pnpm test`)
- [ ] No new TypeScript errors introduced
- [ ] Components still render correctly (manual spot-check)
- [ ] `wiki/log.md` updated
- [ ] Commit on `fix/business-logic-extraction`
