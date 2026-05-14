# UmatPro — Konteks Proyek & Status Terakhir

> File ini diupdate setiap kali ada commit & push.
> Baca file ini di awal sesi untuk langsung lanjut tanpa recap.

---

## Jiwa Proyek — Kenapa UmatPro Ada

> Baca ini setiap sesi. Ini bukan sekadar proyek software.

Latar belakang utama membangun UmatPro bukan karena bisnis — tapi karena **kerinduan untuk dekat dengan masjid dan berkontribusi untuk masjid**, terutama masjid di dekat rumah.

Karena kondisi yang belum memungkinkan untuk hadir rutin dan ikut meramaikan masjid secara fisik, **UmatPro diharapkan bisa mewakili secara digital kehadiran dan kontribusi** — agar hubungan dengan masjid tetap terjaga, infaq tetap mengalir, dan ilmu dari kajian tetap terhubung, meski dari jauh.

Setiap fitur yang dibangun harus memancarkan nilai ini:
- **Transparansi** — jamaah percaya uangnya dikelola dengan amanah
- **Kedekatan** — jamaah merasa terhubung dengan masjidnya meski tidak hadir fisik
- **Kemudahan** — DKM non-teknis pun bisa pakai tanpa hambatan
- **Keberkahan** — setiap baris kode adalah amal jariyah

### ⚠️ Pengingat Keberlanjutan

> **UmatPro harus bisa self-funding agar bisa terus hidup dan bermanfaat.**

Tanpa keberlanjutan finansial, proyek ini tidak bisa dirawat, dikembangkan, dan pada akhirnya tidak bisa melayani jamaah dan masjid yang membutuhkan.

**Fitur monetisasi yang harus selalu diprioritaskan:**

| Fitur | Model | Status |
|-------|-------|--------|
| Tier Premium DKM | Subscription bulanan | ✅ Halaman `/dkm/upgrade` live |
| Broadcast WA Unlimited | Premium only | ✅ Di-gate — free lihat paywall |
| Laporan PDF | Premium only | ✅ Phase B selesai (14 Mei 2026) |
| Verifikasi Masjid (badge) | Premium benefit | Belum dibangun |
| Pasar Masjid | Revenue share / listing fee | Tabel ada, UI belum |

**Aturan pengembangan**: Setiap kali menambah fitur besar, tanyakan —
*"Apakah ini bisa menjadi bagian dari tier premium yang membuat DKM mau berlangganan?"*

---

## Gambaran Proyek

**UmatPro** adalah platform digital ekosistem masjid Indonesia.
- **Stack**: Next.js 16.2.5 (App Router) + React 19 + Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel (auto-deploy dari branch `main`)
- **Domain**: `umatpro.com` — nameserver sudah diarahkan ke Vercel (`ns1/ns2.vercel-dns.com`)
- **Repo**: `erfinbiz-blip/umatPro`
- **Branch aktif**: `claude/build-umatpro-v1-m3Oda` → selalu merge ke `main` setelah selesai

---

## Struktur Route (Lengkap)

| URL | Keterangan | Path File |
|-----|-----------|-----------|
| `/` | Landing page HTML statis | `app/route.ts` → serve `public/landing.html` |
| `/mosque/[id]` | Profil publik masjid (tanpa login) | `app/mosque/[id]/page.tsx` + `_client.tsx` |
| `/app` | Home jamaah — sekarang dengan section Kampanye Donasi | `app/app/(jamaah)/page.tsx` |
| `/app/discover` | Temukan masjid + peta | `app/app/(jamaah)/discover/page.tsx` |
| `/app/kampanye` | Daftar kampanye donasi aktif | `app/app/kampanye/page.tsx` |
| `/app/mosque/[id]` | Detail masjid (butuh login) | `app/app/(jamaah)/mosque/[id]/page.tsx` |
| `/app/infaq` | Infaq digital jamaah — support `?campaign=ID` untuk pre-select | `app/app/(jamaah)/infaq/page.tsx` |
| `/app/profile` | Profil jamaah | `app/app/(jamaah)/profile/page.tsx` |
| `/app/profile/edit` | Edit profil (nama, WA) | `app/app/(jamaah)/profile/edit/page.tsx` |
| `/app/notifications` | Notifikasi | `app/app/(jamaah)/notifications/page.tsx` |
| `/auth` | Login / Register — tab dual role Jamaah \| DKM | `app/auth/page.tsx` |
| `/auth/confirm` | Callback verifikasi magic link (demo session) | `app/auth/confirm/route.ts` |
| `/dkm` | Dashboard DKM — redirect ke onboarding jika belum punya masjid | `app/dkm/(takmir)/page.tsx` |
| `/dkm/onboarding` | Onboarding DKM baru — registrasi masjid 2-step | `app/dkm/onboarding/page.tsx` |
| `/dkm/kas` | Manajemen kas + Export CSV | `app/dkm/(takmir)/kas/page.tsx` |
| `/dkm/verifikasi` | Verifikasi infaq | `app/dkm/(takmir)/verifikasi/page.tsx` |
| `/dkm/kajian` | CRUD jadwal kajian | `app/dkm/(takmir)/kajian/page.tsx` |
| `/dkm/kampanye` | **(BARU)** Kelola kampanye donasi — CRUD, update progress, lihat donor | `app/dkm/kampanye/page.tsx` |
| `/dkm/laporan` | **(BARU)** Laporan keuangan mingguan — generate PDF, upload ttd basah | `app/dkm/(takmir)/laporan/page.tsx` |
| `/dkm/pengumuman` | CRUD pengumuman | `app/dkm/(takmir)/pengumuman/page.tsx` |
| `/dkm/qr` | QR Infaq — cetak & unduh | `app/dkm/(takmir)/qr/page.tsx` |
| `/dkm/broadcast` | Broadcast WA | `app/dkm/(takmir)/broadcast/page.tsx` |
| `/dkm/settings` | Pengaturan masjid | `app/dkm/(takmir)/settings/page.tsx` |
| `/dkm/tv/[mosque_id]` | TV Display masjid | `app/dkm/tv/[mosque_id]/page.tsx` |

**Middleware** (`middleware.ts`): Proteksi `/dkm/*` → redirect `/auth` jika belum login. Login + buka `/auth` → redirect `/app`.

---

## Sidebar DKM — Urutan Menu

Dashboard → Kas Masjid → Verifikasi Infaq → **Kajian** → **Kampanye Donasi** → **Pengumuman** → **QR Infaq** → **Laporan Mingguan** → Broadcast WA → Pengaturan

File: `components/takmir/Sidebar.tsx`
- Semua href sudah `/dkm/*`
- Active detection `/dkm` pakai exact match
- Badge merah untuk: draft kas, pending infaq

---

## Database (Supabase)

### Migrasi yang sudah dijalankan
- [x] `001_initial_schema.sql` — semua tabel utama
- [x] `002_rls_policies.sql` — Row Level Security
- [x] `003_rpc_functions.sql` — RPC `increment_campaign_raised(uuid, bigint)`
- [x] `004_platform_roles.sql` — tabel `platform_roles` untuk superadmin
- [x] `005_weekly_reports.sql` — tabel `weekly_reports` untuk laporan keuangan mingguan
- [x] `006_storage_weekly_reports.sql` — storage bucket `weekly-reports`

### Tabel utama
| Tabel | Kolom penting |
|-------|--------------|
| `profiles` | full_name, phone, avatar_url |
| `mosques` | name, address, lat, lng, photo_url, bank_name/account/holder, is_verified, tier |
| `mosque_roles` | mosque_id, user_id, role (admin/bendahara/dewan) |
| `follows` | user_id, mosque_id |
| `infaq_codes` | mosque_id, nominal, unique_code, status (pending/verified/rejected/expired) |
| `kas_transactions` | mosque_id, type (in/out), amount, description, status (draft/approved/rejected) |
| `announcements` | mosque_id, content, category (info/event/urgent/donasi), is_active |
| `kajians` | mosque_id, title, ustadz, day_of_week, time_start, topic, is_recurring, is_active |
| `prayer_schedules` | mosque_id, date, iqamah_*_offset |
| `campaigns` | mosque_id, title, target_amount, raised_amount, status |
| `weekly_reports` | mosque_id, period_start, period_end, status (generated/approved), pdf_url, signed_pdf_url, total_income, total_expense, opening_balance, closing_balance |

### Storage bucket
- `kas-receipts` — bukti foto transaksi kas
- `weekly-reports` — PDF laporan mingguan (original + signed)

---

## Komponen Penting

| Komponen | Path | Keterangan |
|----------|------|-----------|
| `InfaqQR` | `components/ui/InfaqQR.tsx` | QR code infaq, download & print |
| `PrayerStrip` | `components/jamaah/PrayerStrip.tsx` | Jadwal sholat strip + countdown |
| `TakmirSidebar` | `components/takmir/Sidebar.tsx` | Sidebar DKM dengan badge & nav |
| `Glass` | `components/ui/Glass.tsx` | Glassmorphism card |
| `GoldButton` | `components/ui/GoldButton.tsx` | Primary button gold |
| `ArabesqueBg` | `components/ui/ArabesqueBg.tsx` | Background arabesque |
| `Ticker` | `components/tv/Ticker.tsx` | Ticker pengumuman di TV |
| `SaldoWidget` | `components/tv/SaldoWidget.tsx` | Widget saldo kas di TV |
| `PrayerSchedule` | `components/tv/PrayerSchedule.tsx` | Jadwal sholat fullscreen TV |

---

## Testing

### Setup
- **Framework**: Vitest + `@edge-runtime/vm`
- **Config**: `vitest.config.ts` (environment: edge-runtime)
- **Scripts**: `npm test` (run once), `npm run test:watch` (watch mode)
- **Pre-push hook**: `.git/hooks/pre-push` — test otomatis jalan sebelum setiap `git push`. Push dibatalkan jika test gagal.

### Test files
| File | Yang ditest |
|------|------------|
| `__tests__/middleware.test.ts` | 8 kasus auth middleware — onboarding redirect, Supabase error |
| `__tests__/quotes.test.ts` | 4 kasus daily quote — array valid, determinisme per tanggal, rotasi siklik |
| `__tests__/campaigns/campaign-utils.test.ts` | 3 kasus — status transitions, labels, deadline |
| `__tests__/campaigns/jamaah-discovery.test.ts` | 4 kasus — progress calculation |
| `__tests__/campaigns/donation-flow.test.ts` | 6 kasus — form validation, donation flow |
| `__tests__/report/period.test.ts` | 4 kasus — periode Jumat–Kamis calculator |
| `__tests__/report/aggregate.test.ts` | 3 kasus — aggregate transaksi approved |
| `__tests__/report/pdf-generator.test.ts` | 1 kasus — generate PDF blob |
| `__tests__/report/actions.test.ts` | 1 kasus — server actions exist |
| `__tests__/hooks/usePWAInstall.test.ts` | 15 kasus — PWA install detection & dismiss logic |
| `__tests__/lib/auth/platform.test.ts` | 6 kasus — platform role helper functions |

### Cara jalankan manual
```bash
npm test
```

---

## Riwayat Perubahan

### Fix — Middleware Security + Testing
- Bug fix: catch block middleware redirect ke `/auth` untuk `/dkm` (bukan `NextResponse.next()`)
- Setup Vitest + 5 test kasus middleware auth
- Pre-push hook: test otomatis sebelum push

### v1.0 — Initial Build
- Full project: auth, jamaah app, takmir dashboard, TV display
- Route restructure: `/app/*` jamaah, `/dkm/*` takmir
- `public/landing.html` — landing page lengkap
- PWA icons, middleware fix, profile edit, TV iqamah fix

### Fase 2A — CRUD Pengumuman
- `/dkm/pengumuman`: buat, toggle aktif, hapus, 4 kategori
- Aktif → tampil otomatis di ticker TV

### Fase 2B — QR Code Infaq
- `components/ui/InfaqQR.tsx`: QR + download + print
- `/dkm/qr`: halaman cetak QR
- TV display: QR 120px menggantikan teks URL
- Settings: shortcut TV + QR dalam grid
- Package: `qrcode.react ^4.2.0`

### Fase 2C — Halaman Publik Masjid
- `/mosque/[id]`: profil publik tanpa login
- OG tags SSR untuk preview WhatsApp
- Share WA (teks pre-filled), salin link, QR modal
- CTA ke app jamaah

### Fase 2D — Manajemen Kajian
- `/dkm/kajian`: CRUD kajian (title, ustadz, hari, waktu, topik, rutin)
- Toggle aktif/nonaktif, edit inline, hapus
- Tampil di `/mosque/[id]` tab Kajian

### Fase 2E — Export Laporan Kas
- Tombol "CSV" di header `/dkm/kas`
- Export transaksi approved ke CSV (client-side, BOM UTF-8)
- Kolom: Tanggal, Tipe, Keterangan, Jumlah, Status

### Fase 2G — Register Masjid
- `/dkm` tampilkan form Register jika user belum punya `mosque_roles`
- Input: nama, alamat, rekening (opsional)
- Auto-assign self sebagai `admin` setelah submit

### Fase Monetisasi — Upgrade & Premium Gate
- `/dkm/upgrade`: halaman pricing Free vs Premium (Rp 99rb/bln, Rp 899rb/thn)
- CTA "Upgrade" → buka WA chat ke admin dengan pesan pre-filled
- `/dkm/broadcast`: di-gate ke premium — free lihat paywall Crown
- Sidebar: tombol "Upgrade Premium" muncul untuk tier free (di atas logout)
- Env var: `NEXT_PUBLIC_WA_ADMIN_NUMBER` (set di Vercel dengan nomor WA admin)
- Demo masjid sudah `tier: premium` → demo DKM bisa akses broadcast

### Fix Bug — Server Errors & Demo Login (21 Apr 2026)
- `app/mosque/[id]/page.tsx`: tambah `await` pada `createClient()` di `generateMetadata` → fix 500 di semua halaman publik masjid
- `app/dkm/(takmir)/page.tsx`: bungkus `fetchDashboard` dengan try-finally → fix stuck loading spinner
- `app/api/demo-session/route.ts`: ganti alur `action_link` (hash fragment) ke `/auth/confirm?token_hash=...` agar session di-set via cookie server-side → fix demo login tidak bisa masuk ke `/dkm`
- `app/auth/confirm/route.ts` *(baru)*: server-side magic link verifier menggunakan `supabase.auth.verifyOtp({ token_hash, type })`
- `app/dkm/(takmir)/upgrade/page.tsx`: fitur premium belum tersedia diberi label "(segera hadir)"

### Fix — Demo Login Cookie Attachment + Diagnostics (21 Apr 2026, lanjutan)
- `/auth/confirm`: sebelumnya `verifyOtp` set session cookie via `cookies().set()` tapi `NextResponse.redirect()` buat response baru yang TIDAK membawa cookie itu → session hilang, middleware lihat user belum login → redirect loop ke `/auth`. Fix: bangun redirect response dulu, lalu set cookie langsung ke `response.cookies` di `setAll` callback
- `/api/demo-session`: cek env var Supabase + listUsers untuk verifikasi user demo ada → pesan error spesifik per titik kegagalan (bukan "Internal error" generik). Pada error, redirect ke `/auth?error=demo_session&reason=...` daripada tampilkan JSON
- `/auth`: baca query `?error=&reason=` dan tampilkan pesan friendly, lalu clear query string via `history.replaceState`
- Validasi `NEXT_PUBLIC_SUPABASE_URL` sebelum `createAdminClient` — tampilkan 60 char pertama jika invalid
- **Health ping** ke `/auth/v1/health` Supabase sebelum `listUsers` → jika "fetch failed" langsung ngasih tahu host + kemungkinan penyebab (project di-pause, URL typo, env belum redeploy)

### Hardening — Upgrade Page Error & No-Mosque Guard
- `/dkm/upgrade`: try/catch di `fetchTier` + error state dengan tombol "Coba lagi"
- Jika user belum punya mosque → tampilkan card "Daftarkan masjid dulu" (link ke `/dkm`), tidak lagi pakai placeholder "Masjid Saya" di WA link
- `mosqueName` sekarang `string | null` — WA link hanya dirender setelah mosque terkonfirmasi

### Quote Islami Harian
- `lib/quotes/daily.ts`: 31 quote Al-Qur'an & Hadits, rotasi deterministik berdasarkan day-of-year (semua jamaah lihat quote sama di hari yang sama)
- `components/jamaah/DailyQuote.tsx`: card quote dengan ikon kitab + tombol "Salin"
- Tampil di home jamaah `/app` antara PrayerStrip dan daftar masjid
- Test: `__tests__/quotes.test.ts` — 4 kasus (valid array, determinisme, rotasi)

### Phase A — Kampanye Donasi (9 Mei 2026)
- **Goal**: Lengkapi fitur kampanye donasi — DKM kelola, Jamaah lihat & donasi
- **DKM Management** (`/dkm/kampanye`):
  - Full CRUD: create, edit, toggle status (draft → active ↔ paused → completed)
  - Post campaign updates with text progress
  - View donor counts and campaign statistics
  - Progress bars with raised/target amounts
- **Jamaah Discovery**:
  - `/app/kampanye` — dedicated page listing active campaigns
  - Featured campaigns section on home (`/app`) — top 3 with progress bars
  - Campaign cards with mosque name, progress, deadline
- **Donation Flow**:
  - Campaign pre-selection via URL: `/app/infaq?campaign=ID`
  - Auto-selects campaign in existing infaq flow
  - Uses existing infaq code generation + verification workflow
- **Tests**: 15 test files, 95 tests all passing (new: campaign status transitions, form validation, progress calculation)
- **Plan**: `wiki/plans/phase-a-campaigns.md`
- **Branch**: `feat/phase-a-campaigns`

### Phase B — Laporan Keuangan Mingguan (14 Mei 2026)
- **Goal**: DKM generate laporan keuangan mingguan (periode Jumat–Kamis) dari transaksi kas approved, export PDF dengan kop masjid, lalu upload hasil ttd basah untuk approve
- **Flow**: DKM (bendahara/admin) generate → PDF dicetak/dibacakan Jumat → ttd basah dewan pembina → upload scan → status jadi `approved`
- **Database**: Migration `005_weekly_reports.sql` — tabel `weekly_reports` dengan RLS policies
- **Storage**: Bucket `weekly-reports` untuk menyimpan PDF original dan signed PDF
- **Domain** (with fp-ts):
  - `lib/report/period.ts` — Jumat–Kamis calculator using fp-ts `pipe`, `A.map`, `A.reduce`
  - `lib/report/aggregate.ts` — Transaction aggregator with fp-ts `Array` operations and `Number` Semigroup
  - `lib/report/pdf-generator.ts` — jspdf + jspdf-autotable for PDF generation
- **Server Actions**: `app/dkm/(takmir)/laporan/actions.ts` — `generateWeeklyReport()` dan `uploadSignedReport()`
- **UI**: `/dkm/laporan` — list laporan, generate button, upload ttd basah, status badge (generated/approved)
- **Sidebar**: Menu "Laporan Mingguan" dengan icon FileText
- **Tests**: 37 test files, 236 tests all passing (10 new tests for report domain)
- **Build**: Successful, no new TS errors (21 pre-existing errors remain)
- **Plan**: `wiki/plans/phase-b-laporan-mingguan.md`
- **Branch**: `feat/phase-b-laporan-mingguan`

### Phase C — PWA Install Banner (12 Mei 2026)
- **Goal**: Bottom sheet PWA install banner di `/app/*` yang muncul sekali per session, dismissable 7 hari via localStorage, dengan support Chromium dan Safari iOS
- **Changes**:
  - `hooks/usePWAInstall.ts` — Hook dengan fp-ts untuk browser detection dan state management
  - `__tests__/hooks/usePWAInstall.test.ts` — 15 tests untuk pure functions
  - `components/jamaah/PWAInstallBanner.tsx` — Bottom sheet UI dengan Glassmorphism card
  - `app/globals.css` — Tambah `animate-slide-up` animation
  - `app/app/(jamaah)/layout.tsx` — Mount PWAInstallBanner di semua route `/app/*`
- **Tests**: 33 test files, 225 tests all passing (15 new tests)
- **Plan**: `wiki/plans/phase-c-pwa-install.md`
- **Branch**: `feat/phase-c-pwa-install`

### Platform Roles + Superadmin (11 Mei 2026)
- **Goal**: Implementasi sistem role platform-wide untuk superadmin yang bisa manage dan verifikasi masjid
- **Database**: Migration `004_platform_roles.sql` — tabel `platform_roles` dengan RLS policies
- **Auth Helper**: `lib/auth/platform.ts` — `getPlatformRole()` dan `requireSuperadmin()`
- **Superadmin Dashboard**: `/superadmin` — list masjid, toggle verifikasi, search/filter
- **Proxy Protection**: `/superadmin` diproteksi — tanpa login redirect `/auth`, user biasa redirect `/app`
- **Tests**: 16 test files, 105 tests all passing
- **Plan**: `wiki/plans/platform-roles-superadmin.md`
- **Branch**: `feature/platform-roles-superadmin`

### Fase 2H — Demo Data & Akun Demo
- `POST /api/seed-demo`: buat 2 user demo + data lengkap masjid via Supabase Admin API (idempoten)
- `GET /api/demo-session?role=dkm|jamaah`: generate magic link one-time → auto-login tanpa OTP
- `/auth`: tambah tombol "🕌 Demo DKM" dan "👤 Demo Jamaah" di bawah form login
- `supabase/seed_demo.sql`: SQL alternatif untuk Supabase SQL Editor
- `scripts/run-seed-demo.mjs`: script standalone Node.js untuk seed lokal

#### Akun Demo (sudah di-seed ke Supabase)
| Role | Email | UUID |
|------|-------|------|
| DKM Admin | `demo.dkm@umatpro.com` | `9c963e5b-3b14-4df2-a02a-ce8bd76329f8` |
| Jamaah | `demo.jamaah@umatpro.com` | `32e3f1fd-9dec-4e58-a30c-53b3731de7ef` |

- Password: `DemoUmatpro2025!`
- Masjid: **Masjid Al-Ikhlas Demo** — ID: `aaaaaaaa-0001-0001-0001-000000000001`
- Data: 5 kajian, 10 kas tx (8 approved + 2 draft), 4 pengumuman, 2 kampanye, 3 infaq codes, 7 hari jadwal sholat

---

## Pre-Release Status

> Diupdate setiap kali `/pre-release` dijalankan.

### Audit Readiness — 9 Mei 2026

**Status**: ✅ **v1.0 + Phase A** — Kampanye Donasi selesai. 95/95 tests passing.

| Check | Hasil |
|-------|-------|
| Tests | ✅ 95/95 pass (15 test files) |
| Build config | ✅ `ignoreBuildErrors: true` — 21 TS error pre-existing tidak blok Vercel |
| Supabase infra | ✅ migrasi, bucket, Auth URLs, demo data |
| Vercel env core | ✅ SUPABASE_URL, ANON_KEY, SERVICE_ROLE, APP_URL |
| Branch sync | ✅ `feat/phase-a-campaigns` pushed ke origin |
| `NEXT_PUBLIC_WA_ADMIN_NUMBER` | ⬜ **BLOCKER** — masih fallback ke `6281234567890` |
| Phase A (Kampanye Donasi) | ✅ DKM CRUD + Jamaah discovery + donation flow |

### Review Terakhir — 18 April 2026

**Fitur yang direview**: v1.0 Initial Build, Fase 2A–H, Fase Monetisasi (Upgrade Page, Broadcast Gate, Sidebar CTA), Demo Data

| Perspektif | Status | Catatan |
|-----------|--------|---------|
| 🕌 Syariah | ✅ | Akad hibah/sedekah, transparansi kas, anti-riba |
| 📱 Product | ⚠️ | Fitur premium dijanjikan belum semua tersedia → sudah diberi label "(segera hadir)" |
| 💼 Bisnis | ✅ | WA-based payment, harga terjangkau, viral via QR & TV Display |
| 🔧 Engineering | ⚠️ | WA_ADMIN_NUMBER kritis + minor TypeScript casts |
| 🧪 QA | ⚠️ | WA_ADMIN_NUMBER kritis + edge case user tanpa mosque |

**Keputusan**: ⚠️ **SIAP DENGAN CATATAN**

**Issues WAJIB sebelum go-live:**
1. ❌ Set `NEXT_PUBLIC_WA_ADMIN_NUMBER` di Vercel dengan nomor WA admin real
2. ✅ ~~Fitur premium belum ada diberi label "(segera hadir)"~~ → sudah diperbaiki

**Issues setelah release:**
1. ✅ ~~Error state di `fetchTier` (upgrade page) untuk network failure~~ → ditangani (error card + retry)
2. ✅ ~~WA link menyebut "Masjid Saya" jika user belum punya mosque~~ → ditangani (guard "Daftarkan masjid dulu")
3. Pertimbangkan server-side tier enforcement via API route

---

## Status Deployment

| Item | Status |
|------|--------|
| Vercel env vars | ✅ Done |
| Domain umatpro.com | ✅ Active |
| Supabase migrations 001-006 | ✅ Done |
| Storage bucket kas-receipts | ✅ Done |
| Storage bucket weekly-reports | ✅ Done |
| Fase 2 A/B/C/D/E/G/H | ✅ Done |
| Phase A (Kampanye Donasi) | ✅ Done |
| Phase B (Laporan Mingguan) | ✅ Done |
| Phase C (PWA Install Banner) | ✅ Done |
| Platform Roles + Superadmin | ✅ Done |
| Demo data di Supabase | ✅ Done |
| Supabase Auth Site URL + Redirect URLs | ✅ Done |
| NEXT_PUBLIC_WA_ADMIN_NUMBER di Vercel | ⬜ Wajib diset — nomor WA admin real |
| Testing demo login (DKM + Jamaah) | ⬜ Belum diverifikasi di production |

---

## Backlog

### Jamaah
- [x] ~~**Quote Islami Harian**~~ — selesai (31 quote, rotasi harian, tombol salin)
- [x] ~~**PWA Install Banner**~~ — selesai (12 Mei 2026). Bottom sheet di `/app/*` dengan Chromium + Safari iOS support, dismiss 7 hari via localStorage
- [ ] **Push Notif Permission Reminder** — pengingat halus jika PWA install tapi notif belum di-allow (`Notification.permission === 'default'`). Bukan popup paksa.
- [ ] **Notif Jadwal Sholat** — push notification 5 menit sebelum adzan (5 waktu). Butuh VAPID keys + service worker subscribe/send logic. Env: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`.

### DKM / Takmir
- [x] ~~**Kampanye Donasi**~~ — selesai (Phase A, 2026-05-09). DKM: CRUD campaign, toggle status, post update progress, lihat donor. Jamaah: list campaign, featured di home, donate dengan pre-select campaign.
- [x] ~~**Laporan Keuangan Mingguan**~~ — selesai (Phase B, 2026-05-14). Periode Jumat–Kamis, generate PDF dengan kop masjid, workflow approval via upload ttd basah. Domain logic pakai fp-ts.
- [ ] **Jadwal Imam & Khatib** — manajemen jadwal imam sholat harian dan khatib Jumat. Belum ada tabel, perlu migrasi baru.
- [ ] **Absensi Jamaah Kajian** — check-in jamaah saat hadir kajian. Belum ada tabel.
- [ ] **Multi-Masjid** — satu akun bisa kelola lebih dari satu masjid. Perlu UI switcher masjid di sidebar.

### Marketplace & Komunitas
- [ ] **Pasar Masjid** — jamaah bisa jual produk halal di halaman masjid. Tabel `marketplace_products` sudah ada di DB (status: pending → approved oleh admin).
- [ ] **Social Check** — cari teman sesama jamaah via nomor kontak (privacy-first, pakai hash SHA-256). Tabel `contact_hashes` sudah ada.

### Platform / Admin
- [ ] **Verifikasi Masjid** — admin UmatPro bisa verifikasi masjid (`is_verified = true`). Butuh halaman admin terpisah.
- [ ] **Tier Premium** — fitur eksklusif untuk DKM premium (misal: broadcast WA unlimited, laporan PDF, analytics jamaah). Kolom `tier` sudah ada di tabel `mosques`.

---

## Fase 2 — Sisa

- [ ] **F. Push Notification** — butuh VAPID keys, service worker (`public/sw.js`) sudah ada tapi belum ada logika subscribe/send. Perlu env var `VAPID_PUBLIC_KEY` dan `VAPID_PRIVATE_KEY`.

---

## Library & Dependency Penting

| Package | Versi | Kegunaan |
|---------|-------|---------|
| `next` | 16.2.5 | Framework |
| `@supabase/supabase-js` | ^2.43.1 | DB + Auth |
| `@supabase/ssr` | — | Server-side auth (middleware) |
| `qrcode.react` | ^4.2.0 | QR code (`QRCodeCanvas`, `QRCodeSVG`) |
| `adhan` | — | Hitung waktu sholat dari koordinat GPS |
| `lucide-react` | — | Ikon UI |
| `clsx` | — | Conditional className |
| `fp-ts` | ^2.16.11 | Functional programming utilities (Option, Either, Array, pipe) |
| `jspdf` | ^4.2.1 | PDF generation client-side |
| `jspdf-autotable` | ^5.0.7 | Table rendering in PDFs |

**Tailwind custom tokens** (`tailwind.config.ts`):
- `gd3` = `#D4AF37` (gold), `gd4` = `#F0D060`
- `em3` = `#065F46`, `em4` = `#10B981` (emerald)
- `tx1` = `#F0FDF4`, `bg0` = `#060D08`

---

## Env Vars yang Dibutuhkan

```
NEXT_PUBLIC_SUPABASE_URL=        # ✅ set di Vercel
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # ✅ set di Vercel
SUPABASE_SERVICE_ROLE_KEY=       # ✅ set di Vercel
NEXT_PUBLIC_APP_URL=             # ✅ https://umatpro.com
NEXT_PUBLIC_WA_ADMIN_NUMBER=     # ⬜ WAJIB: nomor WA admin real (format: 628xxx)
VAPID_PUBLIC_KEY=                # push notif — belum diimplementasi
VAPID_PRIVATE_KEY=               # push notif — belum diimplementasi
```
