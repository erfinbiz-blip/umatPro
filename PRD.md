# PRD — UmatPro
**Status:** Mid-Development
**Last Updated:** 22 April 2026

---

## ✅ Already Done (Jangan Diubah)
- **Auth Magic Link OTP** — login via email, session via cookie server-side, middleware proteksi `/dkm/*`
- **Home Jamaah** — prayer strip, quote Islami harian (31 quote rotasi deterministik), daftar masjid terdekat/followed
- **Discover Masjid + Peta** — `/app/discover`
- **Detail Masjid (login)** — `/app/mosque/[id]` + follow button
- **Profil Publik Masjid (no login)** — `/mosque/[id]` dengan OG tags SSR, share WA, QR modal, tab Kajian
- **Infaq Digital Jamaah** — `/app/infaq`
- **Profile + Edit Jamaah** — `/app/profile`, `/app/profile/edit`
- **Notifications** — `/app/notifications`
- **Landing Page Statis** — `public/landing.html` (SEO-ready Bahasa Indonesia)
- **Dashboard DKM** — `/dkm` (auto-tampil form Register jika user belum punya masjid)
- **Kas Masjid + Export CSV** — `/dkm/kas`
- **Verifikasi Infaq** — `/dkm/verifikasi`
- **CRUD Kajian** — `/dkm/kajian` (auto-tampil di `/mosque/[id]`)
- **CRUD Pengumuman** — `/dkm/pengumuman` (4 kategori, auto-tampil di TV ticker)
- **QR Code Infaq** — `/dkm/qr` + komponen `InfaqQR` (download + print)
- **Broadcast WA** — `/dkm/broadcast` (client-side gate: free lihat paywall Crown)
- **Settings Masjid** — `/dkm/settings`
- **TV Display per Masjid** — `/dkm/tv/[mosque_id]` (ticker, saldo widget, jadwal sholat fullscreen, QR 120px)
- **Halaman Upgrade Premium** — `/dkm/upgrade` (Free vs Premium, CTA WA admin, error state + retry, guard user tanpa masjid)
- **Sidebar DKM** — badge draft kas + pending infaq, tombol Upgrade untuk tier free
- **Demo Data & Auto-Login Demo** — `POST /api/seed-demo` + `GET /api/demo-session?role=dkm|jamaah` + tombol di `/auth`
- **Landing page statis + SEO** — `public/landing.html`
- **Migrasi DB 001-003** — schema, RLS policies, RPC `increment_campaign_raised`
- **Storage bucket** — `kas-receipts`
- **Testing** — 9 test case (middleware auth + daily quote), pre-push hook blokir push kalau fail

---

## ⚠️ Do Not Touch (Tanpa Izin Eksplisit)
- `middleware.ts` — auth protection critical, setiap perubahan butuh test coverage update di `__tests__/middleware.test.ts`
- `app/auth/confirm/route.ts` — pola cookie attachment `response.cookies.set()` di `setAll` callback harus dipertahankan (jika diganti → session hilang, redirect loop)
- `app/api/demo-session/route.ts` — diagnostic berlapis (env check → URL validasi → health ping → listUsers → generateLink). Urutan check penting untuk debug produksi
- `lib/supabase/{client,server,admin}.ts` — wrapper client Supabase, ganti → semua halaman bisa break
- `public/landing.html` — copy SEO Bahasa Indonesia, ganti → impact ranking search
- `supabase/migrations/001_initial_schema.sql` — sudah dijalankan di produksi, jangan modif. Butuh schema change → bikin `004_*.sql` baru
- `next.config.mjs` `ignoreBuildErrors: true` — intentional supaya Vercel build tidak blok; jangan di-off sampai semua TS error diselesaikan

---

## 🔧 Half-Done (Perlu Diselesaikan)
- **Demo login di produksi** — fix kode sudah live, tapi butuh seed data di project Supabase baru + verifikasi E2E. Blocked by Current Phase di bawah.
- **`NEXT_PUBLIC_WA_ADMIN_NUMBER`** — belum diset di Vercel, fallback ke nomor dummy `6281234567890` di `app/dkm/(takmir)/upgrade/page.tsx:31`. Klik Upgrade saat ini buka WA ke nomor dummy.
- **Server-side tier enforcement** — `/dkm/broadcast` tier check hanya di client, bisa di-bypass via devtools. Butuh API route yang return 403 untuk tier free.
- **Fitur premium "(segera hadir)"** — Upgrade page menjanjikan laporan PDF, verifikasi masjid, analytics jamaah — UI label sudah ada, implementasi belum.
- **21 TypeScript error pre-existing** — `components/takmir/Sidebar.tsx` (8 error lucide icon typing), `components/jamaah/PrayerStrip.tsx:38` (PrayerTimeStrings), `app/app/(jamaah)/notifications/page.tsx:102` (index type string), sisa 11 di file lain. Build tidak terganggu karena `ignoreBuildErrors`.
- **Push Notification** — service worker `public/sw.js` ada tapi belum ada logic subscribe/send. Butuh VAPID keys di env.

---

## 🎯 Current Phase: Fix Demo Login di Produksi
**Goal:** Demo DKM + Demo Jamaah berhasil login end-to-end di `umatpro.com`, tombol Upgrade arahkan ke nomor WA admin real.

Tasks:
- [ ] Seed data demo di project Supabase baru — POST `/api/seed-demo` dari browser DevTools Console *(USER)*
- [ ] Verifikasi Demo DKM login → harus sampai `/dkm` dengan data masjid Al-Ikhlas Demo *(USER)*
- [ ] Verifikasi Demo Jamaah login → harus sampai `/app` dengan home jamaah *(USER)*
- [ ] Set `NEXT_PUBLIC_WA_ADMIN_NUMBER` di Vercel (format `628xxx`) + Redeploy *(USER)*
- [ ] Update `CONTEXT.md` + `PRD.md` — centang semua item pre-release, pindah ke ✅ Done *(AI)*

**Done when:** 2 tombol Demo di `/auth` berhasil masuk ke dashboard masing-masing, dan klik "Upgrade Premium" di sidebar DKM buka WA ke nomor admin real (bukan dummy).

---

## 📋 Next Phases (Boleh Masih Kasar)
- **Phase A — Kampanye Donasi UI** (recommended): halaman kampanye untuk jamaah (list + detail + tombol donasi + progress bar) + DKM bisa posting update foto/teks ke kampanye. Tabel `campaigns` + `campaign_updates` sudah ada.
- **Phase B — Laporan Keuangan PDF** (premium benefit): export kas bulanan ke PDF dengan kop masjid via `jspdf` — monetization driver untuk tier premium.
- **Phase C — PWA Install Banner**: bottom sheet kecil di `/app` pakai `beforeinstallprompt`, dismiss 7 hari via localStorage. Quick win ~1 sesi.
- **Phase D — Push Notif Jadwal Sholat**: VAPID keys + service worker subscribe + cron kirim 5 menit sebelum adzan. Fase terbesar, butuh infra baru.
- **Phase E — Verifikasi Masjid (admin-only)**: halaman admin platform untuk verifikasi masjid → badge "Verified" di publik profile + home jamaah.
- **Phase F — Server-side Tier Enforcement**: refactor broadcast gate ke API route, enforce di backend (fix Half-Done).
- **Phase G — Backlog Panjang**: Multi-Masjid, Pasar Masjid, Social Check (SHA-256 contact hash), Jadwal Imam & Khatib, Absensi Jamaah Kajian, Analytics jamaah (premium).

---

## 🛠️ Tech Stack (Existing)
- **Frontend:** Next.js 14 App Router + TypeScript + Tailwind CSS (custom tokens `gd3`/`gd4` gold, `em3`/`em4` emerald, `tx1`/`bg0`), `lucide-react` icons, `clsx`, `qrcode.react`
- **Backend:** Next.js Route Handlers (`app/api/*`, `app/auth/confirm/route.ts`), Supabase Auth Admin API
- **Database:** Supabase PostgreSQL — tabel utama: `profiles`, `mosques`, `mosque_roles`, `follows`, `infaq_codes`, `kas_transactions`, `announcements`, `kajians`, `prayer_schedules`, `campaigns`. Migrasi 001-003 live, RLS policies aktif
- **Auth:** Supabase Auth (magic link OTP + SSR cookies via `@supabase/ssr`)
- **Storage:** Supabase Storage bucket `kas-receipts`
- **Deploy:** Vercel auto-deploy dari `main`, domain `umatpro.com` (nameserver `ns1/ns2.vercel-dns.com`)
- **Testing:** Vitest + `@edge-runtime/vm`, pre-push hook blokir push kalau fail
- **Prayer times:** `adhan` lib (hitung waktu sholat dari koordinat GPS)
- **PWA:** icon set di `public/`, service worker `public/sw.js` (subscribe/send logic belum diimplementasi)
