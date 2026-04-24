# rules.md — UmatPro Architecture & Naming Conventions

> Pola yang sudah dipakai konsisten di codebase. **Setiap kode baru HARUS ikut pola ini** kecuali ada alasan teknis yang jelas dan ditulis sebagai comment WHY.

---

## 🏗️ Architecture

### 1. Next.js 14 App Router + Route Groups
- Route groups `(jamaah)` dan `(takmir)` untuk segregasi layout per audience. **Jangan** taruh halaman jamaah di bawah `/dkm` atau sebaliknya.
- Landing statis: `app/route.ts` serve `public/landing.html`.
- Public mosque profile (no login): `app/mosque/[id]/page.tsx` — pisah dari `app/app/(jamaah)/mosque/[id]`.
- Pattern layout per audience:
  - `app/app/(jamaah)/layout.tsx` — bottom nav + `AtmosphereProvider`
  - `app/dkm/(takmir)/layout.tsx` — sidebar kiri fixed
  - `app/layout.tsx` — root: metadata, viewport, font preconnect, service worker register

### 2. Three-tier Supabase Client (JANGAN dicampur)
| Client | File | Kapan dipakai |
|--------|------|--------------|
| Browser | `lib/supabase/client.ts` → `createClient()` | Client component (`'use client'`) |
| Server (RSC + Route Handler) | `lib/supabase/server.ts` → `await createClient()` | Server component, route handler, `/auth/confirm` |
| Admin (service role) | `lib/supabase/admin.ts` → `createAdminClient()` | **HANYA di API routes** — NEVER expose ke browser |

- Import pola: `import { createClient } from '@/lib/supabase/client'`.
- Server client **harus di-await** karena `cookies()` sudah async di Next 14.2+.

### 3. Middleware Pattern
- `middleware.ts` check auth via `supabase.auth.getUser()`, redirect `/dkm/*` → `/auth` jika tidak login.
- `try/catch` — jika auth check gagal, tetap proteksi `/dkm/*` (fail closed, bukan fail open).
- Matcher kecualikan `_next/static`, icons, service worker, image files.

### 4. Route Handler Pattern (`app/api/*/route.ts`)
```ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // 1. Validate inputs / auth
  // 2. Layer diagnostic errors (env → URL → reachability → auth → action)
  // 3. Return NextResponse.json({...}) or NextResponse.redirect(...)
}
```
- **Diagnostic berlapis** — setiap titik kegagalan kasih error message spesifik (lihat `app/api/demo-session/route.ts`). JANGAN bungkus semua error jadi "Internal error".
- Route handler yang set cookie (e.g. `/auth/confirm`) **harus** pakai `response.cookies.set()` langsung, bukan `cookies().set()` — karena `NextResponse.redirect()` bikin response baru yang gak bawa cookie dari API `cookies()`.

### 5. Pola Data Fetching
- Client component: `useEffect` + `const supabase = createClient()` + async function inside.
- Query builder chain: `.from(t).select('*').eq(k, v).order(c, { ascending: false }).limit(n)`.
- Gunakan `?? []` / `?? null` untuk handle null data.
- `useCallback` untuk fetch function yang di-depend-on oleh `useEffect`.

---

## 📛 Naming Conventions

### File & Folder
| Tipe | Konvensi | Contoh |
|------|----------|--------|
| Component file | `PascalCase.tsx` | `MosqueCard.tsx`, `GoldButton.tsx` |
| Utility/lib file | `lowercase.ts` (single word) atau `kebab-case.ts` | `daily.ts`, `calculate.ts` |
| Route folder | `kebab-case` | `/dkm/upgrade`, `/app/discover` |
| Route group | `(lowercase)` | `(jamaah)`, `(takmir)` |
| Dynamic route | `[param]` | `[id]`, `[mosque_id]` |
| API route | `route.ts` di folder endpoint | `app/api/demo-session/route.ts` |
| Layout | `layout.tsx` | per route group |
| Page | `page.tsx` | default export |
| Test | `__tests__/*.test.ts` | `middleware.test.ts` |

### Code
| Tipe | Konvensi | Contoh |
|------|----------|--------|
| Component | `PascalCase` + default export | `export default function JamaahHome()` |
| Function | `camelCase` | `handleCopy`, `fetchTransactions`, `getOrCreateUser` |
| Constants module-level | `UPPER_SNAKE_CASE` | `TAKMIR_ROUTES`, `DEMO_USERS`, `EMPTY_FORM`, `QUOTES`, `DAYS` |
| Type / Interface | `PascalCase` | `KasTransaction`, `FormState`, `FilterStatus`, `DailyQuoteProps` |
| Props interface | `{Component}Props` | `GlassProps`, `GoldButtonProps`, `MosqueCardProps` |
| Boolean | `is*` / `has*` / `show*` | `is_verified`, `hasCamera`, `showForm` |
| Event handler | `handle{Event}` atau `on{Event}` | `handleSendOTP`, `handleCopy` |
| Enum-ish string | `lowercase` | `'draft'`, `'approved'`, `'premium'`, `'admin'` |

### Database (Supabase)
- Tabel & kolom: `snake_case` (`mosque_id`, `created_at`, `is_active`, `time_start`).
- UUID primary key: `id uuid default gen_random_uuid()`.
- Foreign key: `{entity}_id` (e.g. `mosque_id`, `user_id`).
- Timestamp: `created_at timestamptz default now()`.
- Status column: string enum-ish (`'draft' | 'approved' | 'rejected' | 'pending'` tergantung tabel).
- Tier: `'free' | 'premium'`.

### Bahasa
- **Bahasa Indonesia** untuk: UI copy, error messages ke user, commit message, CONTEXT.md, PRD.md, comment "kenapa" yang user-relevant.
- **Inggris** untuk: variable/function names, type names, technical comments, nama file code.
- Contoh: `<p>Masukkan email yang valid</p>` — Indo. `function validateEmail(...)` — Inggris.

---

## 🧩 Component Patterns

### Struktur `components/`
```
components/
├── ui/          # Primitives reusable cross-audience (Glass, GoldButton, ArabesqueBg, LiquidCounter, InfaqQR)
├── jamaah/      # Jamaah-specific (PrayerStrip, DailyQuote, MosqueCard, InfaqFlow, MosqueMap, AtmosphereProvider)
├── takmir/      # DKM-specific (Sidebar, KasForm, VerifyItem, WABroadcast)
└── tv/          # TV display (Ticker, SaldoWidget, PrayerSchedule)
```

### Props interface
```tsx
interface {Component}Props extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'gold' | 'subtle'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}
```
- Discriminated union untuk variant (bukan boolean flags seperti `isPrimary`).
- Semua prop UI configurable punya default.
- `className` selalu diteruskan ke root element dengan `clsx(...)`.

### forwardRef untuk primitif (`ui/`)
```tsx
const Glass = forwardRef<HTMLDivElement, GlassProps>((...) => {...})
Glass.displayName = 'Glass'
export default Glass
```
- Wajib set `displayName` (untuk React DevTools).
- **Default export**, bukan named.

### clsx dengan section comments
```tsx
className={clsx(
  // Base
  'inline-flex items-center',
  // Variants
  { 'bg-gd3': variant === 'primary' },
  // Sizes
  { 'h-11 px-5': size === 'md' },
  className
)}
```

### Loading & Null State
- State pattern: `useState<T | null>(null)` untuk data yang butuh fetch.
- `const [loading, setLoading] = useState(true)` — default true.
- Skeleton UI via `Glass` + `animate-pulse` saat loading.
- Empty state dengan Glass + text centered + CTA link.

---

## 🎨 Design System (Tailwind tokens)

### Warna (di `tailwind.config.ts`)
| Token | Hex | Pemakaian |
|-------|-----|-----------|
| `em1` | `#022D1A` | Deep emerald (button text on gold) |
| `em2` | `#064E3B` | Emerald surface |
| `em3` | `#0A6B4A` | Emerald accent |
| `em4` | `#12925A` | Emerald bright (success, verified badge) |
| `gd3` | `#D4AF37` | Gold primary (CTA, premium) |
| `gd4` | `#E8C84A` | Gold bright (hover/active) |
| `tx1` | `#F8F6F0` | Primary text (off-white) |
| `bg0` | `#060D08` | Deep background |

- **Jangan** hardcode hex di className — pakai token ini.
- Opacity scale Tailwind untuk variasi: `bg-white/5`, `border-white/10`, `text-white/40`, `text-white/60`.

### Font
- `font-display` = Playfair Display (serif) — untuk heading + logo "UmatPro".
- `font-body` = Plus Jakarta Sans (sans-serif) — default.

### Component Default Wrapper
- **Semua card** pakai `<Glass>` — jangan bikin `div` dengan glassmorphism manual.
- **Semua button primary** pakai `<GoldButton>` — jangan bikin button gradient manual.
- **Background halaman** pakai `<ArabesqueBg opacity={0.035} />` sebagai layer pertama.

### Responsive
- Mobile-first. Prefix `md:`, `lg:` untuk override ke atas.
- Safe area: `pt-safe`, `pb-20` (untuk bottom nav jamaah).
- Min height: `min-h-dvh` (bukan `min-h-screen` — `dvh` handle mobile browser chrome).

---

## 📦 Module Organization (`lib/`)

```
lib/
├── supabase/
│   ├── client.ts           # Browser client factory
│   ├── server.ts           # RSC/route handler client factory
│   ├── admin.ts            # Service role client factory
│   └── types.ts            # Database interface + convenience Row types
├── prayer/calculate.ts     # adhan wrapper — calculatePrayerTimes, formatPrayerTimes, getQiblaDirection, getNextPrayer
├── quotes/daily.ts         # Static quote data + getTodayQuote deterministic rotation
├── infaq/code.ts           # generateInfaqCode, formatRupiah
└── atmosphere/index.ts     # Atmosphere context provider & hook
```

- Setiap module export **named functions** + **named types** (bukan default). Contoh: `export function getTodayQuote()`, `export interface DailyQuote`.
- Import pakai `@/` alias (konfigurasi `tsconfig.json`). JANGAN pakai relative path `../../`.

---

## 🧪 Testing

- Framework: Vitest + `@edge-runtime/vm` (`vitest.config.ts`).
- File location: `__tests__/*.test.ts`.
- Pre-push hook `.git/hooks/pre-push` block push jika test fail — JANGAN bypass dengan `--no-verify`.
- Test naming: `describe('FeatureName', () => { it('does X when Y', ...) })`.

---

## ✍️ Comments

- **Default: no comment.** Nama variable + fungsi harus self-explanatory.
- Comment WHY, bukan WHAT. Contoh bagus:
  ```ts
  // Service role client — ONLY use in API routes / server actions
  // Never expose to the browser
  ```
- Comment untuk workaround / hidden constraint:
  ```ts
  // Server Component — cookies can only be set in middleware/route handlers
  ```
- JANGAN comment "fix for issue #123" atau "added for X flow" — itu commit/PR body, bukan code comment.

---

## 🚀 Git & Deploy

- Branch: semua kerja di branch feature, merge ke `main` untuk trigger Vercel auto-deploy.
- Commit message Bahasa Indonesia, format: `type: judul singkat` (seperti Conventional Commits tapi body Indo).
  - `fix:` bug fix
  - `feat:` fitur baru
  - `docs:` dokumentasi
  - `chore:` infrastruktur/config
  - `refactor:` refactor tanpa change behavior
- Update `CONTEXT.md` + `PRD.md` setiap kali ada perubahan besar (fitur selesai / bug fix signifikan / phase bergeser).
- **NEVER** commit secrets — `.env*` di `.gitignore`. Env var via Vercel Dashboard.
- **NEVER** `git push --force` ke `main`.

---

## ❌ Anti-Patterns (JANGAN lakukan)

1. **Import Supabase library langsung** — selalu lewat `@/lib/supabase/*`.
2. **`any` type** — pakai `unknown` + narrowing, atau fix typing-nya.
3. **`// @ts-ignore`** — kalau beneran stuck, `// @ts-expect-error` dengan comment WHY.
4. **Inline hex warna di className** — pakai token `gd3`/`em3`/dll.
5. **Button HTML manual** — pakai `GoldButton`.
6. **Card div manual dengan backdrop-blur** — pakai `Glass`.
7. **Hardcode URL/nomor WA** — env var (`NEXT_PUBLIC_WA_ADMIN_NUMBER`, `NEXT_PUBLIC_APP_URL`).
8. **Relative import `../../../..`** — pakai `@/` alias.
9. **Text UI bahasa Inggris** — gunakan Bahasa Indonesia (kecuali technical UI seperti `API`, `QR`).
10. **Fallback generik "Internal error"** — diagnostic berlapis dengan pesan spesifik per titik kegagalan.
11. **State management pakai external library** (Redux, Zustand, dll) — project ini pakai useState + Context untuk scope-nya. Kecuali ada alasan kuat.
12. **`setTimeout` / `setInterval` tanpa cleanup** di useEffect.

---

## 📋 Checklist Sebelum Buat File Baru

- [ ] Apakah ada primitif existing yang bisa dipakai? (`Glass`, `GoldButton`, `ArabesqueBg`, dll)
- [ ] File ini masuk folder yang tepat? (`ui/` untuk reusable primitif, `jamaah/`/`takmir/`/`tv/` untuk audience-specific)
- [ ] Naming ikut konvensi? (PascalCase component, kebab-case route, snake_case DB)
- [ ] Import pakai `@/` alias?
- [ ] UI copy Bahasa Indonesia?
- [ ] Ada test case yang harus ditambah? (minimal happy path untuk route handler & middleware)
- [ ] Kalau sentuh file di "Do Not Touch" (PRD §2) — sudah dapat izin user eksplisit?
