# UmatPro — PRD (Status Living Document)

> Baca di awal setiap sesi AI. File ini adalah **zona operasi**: mana yang boleh disentuh, mana yang tidak.
> Diupdate setiap phase selesai / ada perubahan status.

---

## 1. What Already Works — ZONA AMAN (jangan disentuh AI tanpa izin eksplisit)

Semua fitur di bawah ini sudah hidup di produksi dan tested secara manual/otomatis. AI **tidak boleh** refactor, "rapikan", atau menambah abstraksi di file-file ini kecuali user eksplisit minta.

### Foundation
- **Auth Magic Link (Supabase OTP)** — `app/auth/page.tsx`, `app/auth/confirm/route.ts`. Cookie attachment fix sudah di-apply — jangan ganti pola `response.cookies.set()` di `setAll` callback.
- **Middleware proteksi `/dkm/*`** — `middleware.ts`. 5 test case di `__tests__/middleware.test.ts`.
- **Supabase client (SSR + browser)** — `lib/supabase/{client,server,admin}.ts`.
- **Landing page statis** — `public/landing.html` (Bahasa Indonesia, SEO-ready).

### Jamaah (`/app`)
- **Home Jamaah** — `app/app/(jamaah)/page.tsx`: prayer strip, quote harian, daftar masjid terdekat + followed, CTA DKM, greeting by time.
- **Prayer Strip** — `components/jamaah/PrayerStrip.tsx` (adhan lib, countdown next prayer).
- **Daily Quote Islami** — `components/jamaah/DailyQuote.tsx` + `lib/quotes/daily.ts` (31 quote, rotasi deterministik, tombol Salin). Test: `__tests__/quotes.test.ts`.
- **Discover/Map masjid** — `app/app/(jamaah)/discover/page.tsx`.
- **Detail masjid** — `app/app/(jamaah)/mosque/[id]/page.tsx` (butuh login).
- **Infaq digital** — `app/app/(jamaah)/infaq/page.tsx`.
- **Profile + Edit** — `app/app/(jamaah)/profile/{,edit/}page.tsx`.
- **Notifications** — `app/app/(jamaah)/notifications/page.tsx`.

### Publik (tanpa login)
- **Profil publik masjid** — `app/mosque/[id]/page.tsx` + `_client.tsx`. OG tags SSR, share WA, QR modal.

### DKM / Takmir (`/dkm`)
- **Dashboard** — `app/dkm/(takmir)/page.tsx` (auto-register form jika belum ada mosque).
- **Kas Masjid + Export CSV** — `app/dkm/(takmir)/kas/page.tsx`.
- **Verifikasi Infaq** — `app/dkm/(takmir)/verifikasi/page.tsx`.
- **CRUD Kajian** — `app/dkm/(takmir)/kajian/page.tsx` (muncul di mosque publik).
- **CRUD Pengumuman** — `app/dkm/(takmir)/pengumuman/page.tsx` (4 kategori, muncul di TV ticker).
- **QR Infaq** — `app/dkm/(takmir)/qr/page.tsx` + `components/ui/InfaqQR.tsx` (download + print).
- **Broadcast WA** — `app/dkm/(takmir)/broadcast/page.tsx` (client-side tier gate: free lihat paywall Crown).
- **Settings masjid** — `app/dkm/(takmir)/settings/page.tsx`.
- **Sidebar** — `components/takmir/Sidebar.tsx` (badge draft kas & pending infaq, tombol Upgrade untuk tier free).

### TV Display (publik per masjid)
- **TV** — `app/dkm/tv/[mosque_id]/page.tsx` + komponen `Ticker`, `SaldoWidget`, `PrayerSchedule`, `InfaqQR 120px`.

### Monetisasi (partial live)
- **Halaman Upgrade** — `app/dkm/(takmir)/upgrade/page.tsx`. Free vs Premium (Rp 99rb/bln, Rp 899rb/thn). CTA buka WA admin. Fitur premium belum jadi dilabeli "(segera hadir)". Error state + retry + "Daftarkan masjid dulu" guard untuk user tanpa mosque.

### Database & Infra
- **Migrasi 001–003** — initial schema, RLS policies, RPC `increment_campaign_raised`.
- **Storage bucket** `kas-receipts`.
- **Demo data** — `POST /api/seed-demo` (idempoten) + `GET /api/demo-session?role=dkm|jamaah` (magic link auto-login).
- **Auth URLs Supabase** — Site URL + Redirect URLs sudah diset.

### Testing
- `npm test` — 9/9 pass. Pre-push hook blokir push kalau test gagal.

---

## 2. Current Phase — Fix Demo Login di Produksi (1 task per sesi)

**Context**: Project Supabase lama (`nmbfrqtzxcmkxmfxbsxr.supabase.co`) hilang/typo, project baru (`olbsgsxccrjqyffvxblf.supabase.co`) sudah hidup. Vercel env var sudah diupdate per user. Tinggal verifikasi end-to-end.

### Task 2.1 — Seed data demo di project Supabase baru ⬜ USER
**Siapa**: User (dari browser/device, karena sandbox AI di-deny ke `umatpro.com`)
**Cara**:
```js
// Di DevTools Console pada https://umatpro.com
fetch('/api/seed-demo', { method: 'POST' }).then(r => r.json()).then(console.log)
```
**DoD**: JSON balasan berisi UUID 2 user demo (DKM + Jamaah) + UUID masjid Al-Ikhlas Demo. Screenshot ke AI.

### Task 2.2 — Verifikasi Demo DKM login ⬜ USER
**Langkah**: Buka `umatpro.com/auth` → klik "🕌 Demo DKM".
**DoD**: Redirect sukses ke `/dkm`, dashboard muncul dengan data masjid Al-Ikhlas Demo (5 kajian, 10 kas tx, 4 pengumuman). Sidebar tampil dengan badge.

### Task 2.3 — Verifikasi Demo Jamaah login ⬜ USER
**Langkah**: Buka `umatpro.com/auth` → klik "👤 Demo Jamaah".
**DoD**: Redirect sukses ke `/app`, home jamaah muncul (prayer strip, quote harian, daftar masjid).

### Task 2.4 — Set `NEXT_PUBLIC_WA_ADMIN_NUMBER` di Vercel ⬜ USER
**Langkah**: Vercel → Settings → Environment Variables → Production → tambah `NEXT_PUBLIC_WA_ADMIN_NUMBER=628xxx` (nomor admin real) → Redeploy.
**DoD**: Di `/dkm` klik "Upgrade Premium" → buka WA ke nomor admin real (bukan dummy `6281234567890`).

### Task 2.5 — Update CONTEXT.md setelah semua task di atas done ⬜ AI
Tandai Pre-Release Status checkbox "Testing demo login" + "WA_ADMIN_NUMBER" → ✅. Commit + push.

---

## 3. What's Broken / Half-Done

### 3.1 Demo login di produksi — BLOCKED by Task 2.1-2.3
Status: sudah fix di kode (`app/auth/confirm/route.ts` cookie attachment + `app/api/demo-session/route.ts` health ping diagnostic). Tinggal verifikasi setelah user seed data.

### 3.2 `NEXT_PUBLIC_WA_ADMIN_NUMBER` fallback dummy
File: `app/dkm/(takmir)/upgrade/page.tsx:31` — `const WA_ADMIN = process.env.NEXT_PUBLIC_WA_ADMIN_NUMBER ?? '6281234567890'`.
Impact: Tombol Upgrade Premium saat ini buka WA ke nomor dummy.
Fix: Task 2.4.

### 3.3 Server-side tier enforcement untuk /dkm/broadcast
File: `app/dkm/(takmir)/broadcast/page.tsx`. Saat ini tier check hanya di client — user bisa bypass via devtools.
Phase breakdown:
- **3.3a**: Extract tier check ke server component / API route `/api/dkm/broadcast` yang return 403 jika tier ≠ premium.
- **3.3b**: Hapus client-side gate redundant (atau pertahankan untuk UX cepat, tapi API tetap enforce).
- **3.3c**: Add test: request API dengan user tier free → expect 403.

### 3.4 Fitur premium "(segera hadir)" — UI promise tanpa backend
File: `app/dkm/(takmir)/upgrade/page.tsx` — menjanjikan broadcast unlimited, laporan PDF, verifikasi masjid, analytics jamaah. Yang sudah jadi: broadcast unlimited (karena sudah di-gate). Sisanya belum.
Split ke phase 4 (next phases): Laporan PDF, Verifikasi Masjid, Analytics.

### 3.5 21 TypeScript error pre-existing
Build tidak terganggu (`ignoreBuildErrors: true`). Tapi signal-to-noise saat typecheck manual jelek.
Phase breakdown:
- **3.5a**: Fix `components/takmir/Sidebar.tsx` — 8 error dari lucide-react `ForwardRefExoticComponent` vs `ComponentType` mismatch di `NavItem` props typing.
- **3.5b**: Fix `components/jamaah/PrayerStrip.tsx:38` — `PrayerTimeStrings` tidak assignable ke `Record<string, string> | null`.
- **3.5c**: Fix `app/app/(jamaah)/notifications/page.tsx:102` — index type string ke struct keys `{info|event|urgent|donasi}`.
- **3.5d**: Sisa TS error di file lain (12).

---

## 4. Next Phases

### Phase A — Kampanye Donasi UI (≈ 2-3 sesi) — RECOMMENDED
Tabel `campaigns` + `campaign_updates` sudah ada di DB.
- **A1**: Halaman list campaign `/app/kampanye` (jamaah) — grid card dengan progress bar, target, raised amount.
- **A2**: Halaman detail `/app/kampanye/[id]` — deskripsi, progress, tombol Donasi (pre-fill infaq), list updates.
- **A3**: Halaman DKM `/dkm/kampanye` — CRUD campaign (title, target, status, cover image).
- **A4**: Form Post Update di DKM → tabel `campaign_updates` (text + optional foto).
- **A5**: Notifikasi ke follower masjid saat ada campaign baru (optional, butuh push notif).

### Phase B — Laporan Keuangan PDF (premium benefit) (≈ 1-2 sesi)
- **B1**: Install `jspdf` + `jspdf-autotable`.
- **B2**: Endpoint `/api/dkm/laporan-pdf?month=YYYY-MM` yang fetch kas approved bulan tsb → generate PDF dengan kop masjid (nama, alamat, logo).
- **B3**: Tombol "Download PDF" di `/dkm/kas` (gate ke premium).
- **B4**: Unit test generator PDF.

### Phase C — PWA Install Banner (≈ 1 sesi, quick win)
- Listen `beforeinstallprompt` event, simpan ke state.
- Bottom sheet glass di `/app` jika belum install, tombol "Install" + "Nanti".
- Dismiss → simpan `localStorage['pwa_dismiss_at']`, jangan tampil lagi 7 hari.

### Phase D — Push Notif Jadwal Sholat (≈ 3-4 sesi, butuh infra)
- **D1**: Generate VAPID keys, set di Vercel env.
- **D2**: Service worker logic subscribe (`public/sw.js`) + simpan subscription ke tabel baru `push_subscriptions`.
- **D3**: Cron job Vercel / Supabase Edge Function: setiap 5 menit cek waktu sholat per subscription (pakai lokasi), send push 5 menit sebelum adzan.
- **D4**: UI jamaah: toggle on/off notif sholat di `/app/profile`.

### Phase E — Verifikasi Masjid (admin-only) (≈ 1-2 sesi)
- **E1**: Tabel `admin_users` atau kolom `is_platform_admin` di `profiles`.
- **E2**: Halaman `/admin/mosques` — list masjid, tombol "Verifikasi" → set `is_verified = true`.
- **E3**: Badge "Verified" muncul di `/mosque/[id]`, home jamaah, search result.
- **E4**: Middleware proteksi `/admin/*`.

### Phase F — Fase 2 Sisa (Push Notif) — lihat Phase D.

### Phase G — Long-term Backlog (belum di-breakdown)
- Multi-Masjid (satu user kelola > 1 masjid) — butuh UI switcher masjid di sidebar.
- Pasar Masjid UI — tabel `marketplace_products` sudah ada.
- Social Check (SHA-256 contact hash) — tabel `contact_hashes` sudah ada.
- Jadwal Imam & Khatib — butuh tabel baru.
- Absensi Jamaah Kajian — butuh tabel baru.
- Tier Premium analytics — dashboard metrics per masjid.

---

## Aturan Kerja AI

1. **Sebelum ngoding**: baca Section 1, pastikan tidak menyentuh file "zona aman" kecuali user minta eksplisit.
2. **Pecah task**: kalau current phase task > 1 sesi, pecah lagi di Section 2.
3. **Monetisasi first**: setiap fitur besar, tanyakan — *"Bisa jadi bagian tier premium?"*
4. **Update file ini**: setiap task selesai, pindahkan ke Section 1. Setiap bug ditemukan, masuk Section 3.
5. **Default no comments**: ikut rules di `.claude/instructions`. Comment hanya untuk WHY non-obvious.
6. **Test sebelum push**: pre-push hook sudah ada, jangan bypass (`--no-verify` terlarang).
