# UmatPro — Konteks Proyek & Status Terakhir

> File ini dibuat untuk melanjutkan sesi Claude Code tanpa harus mengulang dari awal.
> Update file ini setiap akhir sesi kerja.

---

## Gambaran Proyek

**UmatPro** adalah platform digital ekosistem masjid Indonesia.
- **Stack**: Next.js 14 (App Router) + Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel (auto-deploy dari branch `main`)
- **Domain**: `umatpro.com` — nameserver sudah diarahkan ke Vercel (`ns1/ns2.vercel-dns.com`)
- **Repo**: `erfinbiz-blip/umatPro`
- **Branch aktif**: `claude/build-umatpro-v1-m3Oda` → merge ke `main` untuk deploy

---

## Struktur Route

| URL | Keterangan | Path File |
|-----|-----------|-----------|
| `/` | Landing page (HTML statis) | `app/route.ts` → serve `public/landing.html` |
| `/mosque/[id]` | **Profil publik masjid (tanpa login)** | `app/mosque/[id]/page.tsx` + `_client.tsx` |
| `/app` | Home jamaah | `app/app/(jamaah)/page.tsx` |
| `/app/discover` | Temukan masjid + peta | `app/app/(jamaah)/discover/page.tsx` |
| `/app/mosque/[id]` | Detail masjid (login) | `app/app/(jamaah)/mosque/[id]/page.tsx` |
| `/app/infaq` | Infaq digital jamaah | `app/app/(jamaah)/infaq/page.tsx` |
| `/app/profile` | Profil jamaah | `app/app/(jamaah)/profile/page.tsx` |
| `/app/profile/edit` | Edit profil (nama, WA) | `app/app/(jamaah)/profile/edit/page.tsx` |
| `/app/notifications` | Notifikasi | `app/app/(jamaah)/notifications/page.tsx` |
| `/auth` | Login / Register | `app/auth/page.tsx` |
| `/dkm` | Dashboard DKM (protected) | `app/dkm/(takmir)/page.tsx` |
| `/dkm/kas` | Manajemen kas | `app/dkm/(takmir)/kas/page.tsx` |
| `/dkm/verifikasi` | Verifikasi infaq | `app/dkm/(takmir)/verifikasi/page.tsx` |
| `/dkm/pengumuman` | **CRUD pengumuman** | `app/dkm/(takmir)/pengumuman/page.tsx` |
| `/dkm/qr` | **QR Infaq — cetak & unduh** | `app/dkm/(takmir)/qr/page.tsx` |
| `/dkm/broadcast` | Broadcast WA | `app/dkm/(takmir)/broadcast/page.tsx` |
| `/dkm/settings` | Pengaturan masjid | `app/dkm/(takmir)/settings/page.tsx` |
| `/dkm/tv/[mosque_id]` | TV Display masjid | `app/dkm/tv/[mosque_id]/page.tsx` |

**Middleware** (`middleware.ts`): Proteksi semua route `/dkm/*` → redirect ke `/auth` jika belum login. Jika sudah login dan buka `/auth`, redirect ke `/app`.

---

## Database (Supabase)

### Migrasi yang sudah dijalankan
- [x] `001_initial_schema.sql` — Semua tabel utama
- [x] `002_rls_policies.sql` — Row Level Security
- [x] `003_rpc_functions.sql` — RPC `increment_campaign_raised(uuid, bigint)`

### Tabel utama
- `profiles` — data user (full_name, phone, avatar_url)
- `mosques` — data masjid (name, address, lat, lng, photo_url, is_verified)
- `follows` — relasi user ↔ masjid
- `infaq_codes` — kode unik infaq (nominal, status: pending/verified/rejected)
- `kas_transactions` — transaksi kas (type: in/out, amount, status: draft/approved/rejected)
- `announcements` — pengumuman masjid (content, category: info/event/urgent/donasi, is_active)
- `prayer_schedules` — jadwal iqamah per masjid per tanggal (iqamah_*_offset)
- `kajians` — jadwal kajian (title, ustadz, day_of_week, time_start, is_recurring, is_active)
- `campaigns` — kampanye donasi (target_amount, raised_amount)

### Storage bucket
- `kas-receipts` — bukti foto transaksi kas

---

## Perubahan Sesi Sebelumnya (v1.0 Fixes)

- Route restructure: `/app/*` jamaah, `/dkm/*` takmir
- `app/route.ts` — Route Handler serving `public/landing.html`
- `public/landing.html` — Landing page lengkap (hero, fitur, FAQ, CTA)
- `public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — PWA icons
- `app/app/(jamaah)/profile/edit/page.tsx` — Form edit nama & WA
- Fix profile total infaq (query real dari `infaq_codes`)
- Fix TV iqamah offsets (fetch dari `prayer_schedules`)
- Fix middleware try-catch
- `supabase/migrations/003_rpc_functions.sql` — RPC `increment_campaign_raised`

---

## Perubahan Sesi Ini (Fase 2 — A, B, C)

### A. CRUD Pengumuman (`/dkm/pengumuman`)
- **File**: `app/dkm/(takmir)/pengumuman/page.tsx`
- Buat pengumuman dengan 4 kategori: info, event, urgent, donasi
- Toggle aktif/nonaktif (aktif = tampil di ticker TV otomatis)
- Hapus dengan konfirmasi
- Counter pengumuman aktif di header

### B. QR Code Infaq
- **File**: `components/ui/InfaqQR.tsx` — reusable component (QRCodeCanvas + download + print)
- **File**: `app/dkm/(takmir)/qr/page.tsx` — halaman `/dkm/qr` dengan QR + panduan + link
- TV display (`app/dkm/tv/[mosque_id]/page.tsx`) — QR code 120px menggantikan teks URL
- Settings page — shortcut grid TV Display + QR Infaq
- Sidebar DKM — menu QR Infaq (icon QrCode)
- QR encode URL: `[origin]/app/infaq?mosque=[mosque_id]`
- **Package baru**: `qrcode.react ^4.2.0`

### C. Halaman Publik Profil Masjid (`/mosque/[id]`)
- **File**: `app/mosque/[id]/page.tsx` — metadata SSR (OG tags, title, description untuk WA preview)
- **File**: `app/mosque/[id]/_client.tsx` — full public page:
  - Buka tanpa login
  - Jadwal sholat real-time (PrayerStrip)
  - Tab: Info, Kajian, Pengumuman
  - QR modal infaq (tap ikon di hero)
  - Tombol Bagikan WA (teks pre-filled) + Salin Link
  - CTA "Buka di Aplikasi UmatPro"
- `app/app/(jamaah)/mosque/[id]/page.tsx` — tambah tombol Share2 → copy URL `/mosque/[id]`

### Sidebar DKM (diperbaiki)
- Semua href diperbaiki ke `/dkm/*` (sebelumnya `/dashboard`, `/kas`, dll — broken)
- Active detection `/dkm` menggunakan exact match
- Menu baru: Pengumuman (Bell), QR Infaq (QrCode)
- Urutan: Dashboard → Kas → Verifikasi → **Pengumuman** → **QR Infaq** → Broadcast WA → Pengaturan

---

## Status Deployment

| Item | Status |
|------|--------|
| Vercel env vars | ✅ Done |
| Domain umatpro.com | ✅ Active (nameserver Vercel) |
| Supabase migrations 001-003 | ✅ Done |
| Storage bucket kas-receipts | ✅ Done |
| Fase 2A: CRUD Pengumuman | ✅ Done |
| Fase 2B: QR Code Infaq | ✅ Done |
| Fase 2C: Halaman Publik Masjid | ✅ Done |
| Supabase Auth Site URL | ⬜ Set ke `https://umatpro.com` |
| Testing alur lengkap | ⬜ Belum |

### Yang masih perlu dilakukan manual
1. **Supabase Auth URL**: Dashboard → Authentication → URL Configuration
   - Site URL: `https://umatpro.com`
   - Redirect URLs: `https://umatpro.com/**`

---

## Fase 2 — Sisa (Belum Diimplementasi)

- [ ] **D. Manajemen Kajian** — CRUD jadwal kajian per masjid di dashboard DKM
- [ ] **E. Export Laporan Kas** — download transaksi kas ke CSV/Excel dari `/dkm/kas`
- [ ] **F. Push Notification** — PWA service worker sudah ada di `public/sw.js`, tinggal logika subscribe & send
- [ ] **G. Halaman Admin** — daftarkan masjid baru, verifikasi masjid (saat ini hanya via Supabase dashboard)

---

## Komponen Penting

| Komponen | Path | Keterangan |
|----------|------|-----------|
| `InfaqQR` | `components/ui/InfaqQR.tsx` | QR code infaq dengan download & print |
| `PrayerStrip` | `components/jamaah/PrayerStrip.tsx` | Jadwal sholat strip dengan countdown |
| `TakmirSidebar` | `components/takmir/Sidebar.tsx` | Sidebar DKM dengan badge & nav |
| `Glass` | `components/ui/Glass.tsx` | Glassmorphism card container |
| `GoldButton` | `components/ui/GoldButton.tsx` | Primary button gold themed |
| `ArabesqueBg` | `components/ui/ArabesqueBg.tsx` | Background arabesque pattern |
| `Ticker` | `components/tv/Ticker.tsx` | Ticker pengumuman di TV display |
| `SaldoWidget` | `components/tv/SaldoWidget.tsx` | Widget saldo kas di TV display |
| `PrayerSchedule` | `components/tv/PrayerSchedule.tsx` | Jadwal sholat fullscreen TV |

---

## Library & Dependency Penting

- `next`: 14.2.3
- `@supabase/supabase-js`: ^2.43.1
- `@supabase/ssr`: server-side auth (middleware)
- `qrcode.react`: ^4.2.0 — QR code generation (`QRCodeCanvas`, `QRCodeSVG`)
- `adhan`: perhitungan waktu sholat berdasarkan koordinat GPS
- `lucide-react`: ikon UI
- Tailwind CSS dengan custom color tokens di `tailwind.config.ts`:
  - `gd3` = `#D4AF37` (gold), `em3` = `#065F46` (emerald), `tx1` = `#F0FDF4` (text)

---

## Env Vars yang Dibutuhkan

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_API_TOKEN=      # untuk broadcast WA (opsional)
WHATSAPP_PHONE_ID=       # untuk broadcast WA (opsional)
```
