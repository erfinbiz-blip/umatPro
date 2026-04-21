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
| Laporan PDF | Premium only | Belum dibangun |
| Verifikasi Masjid (badge) | Premium benefit | Belum dibangun |
| Pasar Masjid | Revenue share / listing fee | Tabel ada, UI belum |

**Aturan pengembangan**: Setiap kali menambah fitur besar, tanyakan —
*"Apakah ini bisa menjadi bagian dari tier premium yang membuat DKM mau berlangganan?"*

---

## Gambaran Proyek

**UmatPro** adalah platform digital ekosistem masjid Indonesia.
- **Stack**: Next.js 14 (App Router) + Supabase (PostgreSQL + Auth + Storage)
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
| `/app` | Home jamaah | `app/app/(jamaah)/page.tsx` |
| `/app/discover` | Temukan masjid + peta | `app/app/(jamaah)/discover/page.tsx` |
| `/app/mosque/[id]` | Detail masjid (butuh login) | `app/app/(jamaah)/mosque/[id]/page.tsx` |
| `/app/infaq` | Infaq digital jamaah | `app/app/(jamaah)/infaq/page.tsx` |
| `/app/profile` | Profil jamaah | `app/app/(jamaah)/profile/page.tsx` |
| `/app/profile/edit` | Edit profil (nama, WA) | `app/app/(jamaah)/profile/edit/page.tsx` |
| `/app/notifications` | Notifikasi | `app/app/(jamaah)/notifications/page.tsx` |
| `/auth` | Login / Register | `app/auth/page.tsx` |
| `/auth/confirm` | Callback verifikasi magic link (demo session) | `app/auth/confirm/route.ts` |
| `/dkm` | Dashboard DKM — jika belum punya masjid tampilkan form Register | `app/dkm/(takmir)/page.tsx` |
| `/dkm/kas` | Manajemen kas + Export CSV | `app/dkm/(takmir)/kas/page.tsx` |
| `/dkm/verifikasi` | Verifikasi infaq | `app/dkm/(takmir)/verifikasi/page.tsx` |
| `/dkm/kajian` | CRUD jadwal kajian | `app/dkm/(takmir)/kajian/page.tsx` |
| `/dkm/pengumuman` | CRUD pengumuman | `app/dkm/(takmir)/pengumuman/page.tsx` |
| `/dkm/qr` | QR Infaq — cetak & unduh | `app/dkm/(takmir)/qr/page.tsx` |
| `/dkm/broadcast` | Broadcast WA | `app/dkm/(takmir)/broadcast/page.tsx` |
| `/dkm/settings` | Pengaturan masjid | `app/dkm/(takmir)/settings/page.tsx` |
| `/dkm/tv/[mosque_id]` | TV Display masjid | `app/dkm/tv/[mosque_id]/page.tsx` |

**Middleware** (`middleware.ts`): Proteksi `/dkm/*` → redirect `/auth` jika belum login. Login + buka `/auth` → redirect `/app`.

---

## Sidebar DKM — Urutan Menu

Dashboard → Kas Masjid → Verifikasi Infaq → **Kajian** → **Pengumuman** → **QR Infaq** → Broadcast WA → Pengaturan

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

### Storage bucket
- `kas-receipts` — bukti foto transaksi kas

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
| `__tests__/middleware.test.ts` | 5 kasus auth middleware — `/dkm` tanpa login, dengan login, saat Supabase error, `/app` tidak diproteksi |

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
1. Error state di `fetchTier` (upgrade page) untuk network failure
2. WA link menyebut "Masjid Saya" jika user belum punya mosque
3. Pertimbangkan server-side tier enforcement via API route

---

## Status Deployment

| Item | Status |
|------|--------|
| Vercel env vars | ✅ Done |
| Domain umatpro.com | ✅ Active |
| Supabase migrations 001-003 | ✅ Done |
| Storage bucket kas-receipts | ✅ Done |
| Fase 2 A/B/C/D/E/G/H | ✅ Done |
| Demo data di Supabase | ✅ Done |
| Supabase Auth Site URL + Redirect URLs | ✅ Done |
| NEXT_PUBLIC_WA_ADMIN_NUMBER di Vercel | ⬜ Wajib diset — nomor WA admin real |
| Testing demo login (DKM + Jamaah) | ⬜ Belum diverifikasi di production |

---

## Backlog

### Jamaah
- [ ] **Quote Islami Harian** — quote Al-Quran/Hadits berganti tiap hari + tombol salin. Array lokal, tidak butuh API. Tampil di `/app`.
- [ ] **PWA Install Banner** — bottom sheet kecil muncul jika belum install PWA. Cek `beforeinstallprompt`. Dismiss → tidak muncul lagi 7 hari (localStorage).
- [ ] **Push Notif Permission Reminder** — pengingat halus jika PWA install tapi notif belum di-allow (`Notification.permission === 'default'`). Bukan popup paksa.
- [ ] **Notif Jadwal Sholat** — push notification 5 menit sebelum adzan (5 waktu). Butuh VAPID keys + service worker subscribe/send logic. Env: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`.

### DKM / Takmir
- [ ] **Kampanye Donasi UI** — halaman kampanye untuk jamaah: daftar campaign aktif, progress bar, tombol donasi. Tabel `campaigns` + `campaign_updates` sudah ada di DB.
- [ ] **Update Progress Kampanye** — DKM bisa posting update teks/foto ke kampanye. Tabel `campaign_updates` sudah ada.
- [ ] **Jadwal Imam & Khatib** — manajemen jadwal imam sholat harian dan khatib Jumat. Belum ada tabel, perlu migrasi baru.
- [ ] **Absensi Jamaah Kajian** — check-in jamaah saat hadir kajian. Belum ada tabel.
- [ ] **Laporan Keuangan PDF** — export laporan kas bulanan ke PDF dengan kop masjid. Client-side via `jspdf` atau server-side.
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
| `next` | 14.2.3 | Framework |
| `@supabase/supabase-js` | ^2.43.1 | DB + Auth |
| `@supabase/ssr` | — | Server-side auth (middleware) |
| `qrcode.react` | ^4.2.0 | QR code (`QRCodeCanvas`, `QRCodeSVG`) |
| `adhan` | — | Hitung waktu sholat dari koordinat GPS |
| `lucide-react` | — | Ikon UI |
| `clsx` | — | Conditional className |

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
