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
| `/app` | Home jamaah | `app/app/(jamaah)/page.tsx` |
| `/app/discover` | Temukan masjid + peta | `app/app/(jamaah)/discover/page.tsx` |
| `/app/mosque/[id]` | Detail masjid | `app/app/(jamaah)/mosque/[id]/page.tsx` |
| `/app/infaq` | Infaq digital jamaah | `app/app/(jamaah)/infaq/page.tsx` |
| `/app/profile` | Profil jamaah | `app/app/(jamaah)/profile/page.tsx` |
| `/app/profile/edit` | Edit profil (nama, WA) | `app/app/(jamaah)/profile/edit/page.tsx` |
| `/app/notifications` | Notifikasi | `app/app/(jamaah)/notifications/page.tsx` |
| `/auth` | Login / Register | `app/auth/page.tsx` |
| `/dkm` | Dashboard DKM (protected) | `app/dkm/(takmir)/page.tsx` |
| `/dkm/kas` | Manajemen kas | `app/dkm/(takmir)/kas/page.tsx` |
| `/dkm/verifikasi` | Verifikasi infaq | `app/dkm/(takmir)/verifikasi/page.tsx` |
| `/dkm/broadcast` | Kirim pengumuman | `app/dkm/(takmir)/broadcast/page.tsx` |
| `/dkm/settings` | Pengaturan masjid | `app/dkm/(takmir)/settings/page.tsx` |
| `/dkm/tv/[mosque_id]` | TV Display masjid | `app/dkm/tv/[mosque_id]/page.tsx` |

**Middleware** (`middleware.ts`): Proteksi semua route `/dkm/*` — redirect ke `/auth` jika belum login. Jika sudah login dan buka `/auth`, redirect ke `/app`.

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
- `kas_transactions` — transaksi kas (type: in/out, amount, status: pending/approved/rejected)
- `announcements` — pengumuman masjid (is_active, title, body)
- `prayer_schedules` — jadwal iqamah per masjid per tanggal (iqamah_subuh_offset, dst.)
- `campaigns` — kampanye donasi (target_amount, raised_amount)

### Storage bucket
- `kas-receipts` — bukti foto transaksi kas

---

## Perubahan Terakhir (Sesi Ini)

### Infrastruktur
- Restructure route: `app/(jamaah)/` → `app/app/(jamaah)/` dan `app/(takmir)/` → `app/dkm/(takmir)/`
- TV display dipindah: `app/tv/[id]/` → `app/dkm/tv/[mosque_id]/`
- `app/route.ts` — Route Handler melayani `public/landing.html` di `/`

### Bug Fix
- **Profile total infaq** — sebelumnya hardcode `0`, sekarang query real dari tabel `infaq_codes` (status=verified)
- **TV iqamah offsets** — sebelumnya ada TODO, sekarang fetch dari tabel `prayer_schedules` dengan fallback default (subuh: +10, dzuhur: +15, ashar: +10, maghrib: +5, isya: +10 menit)
- **Middleware** — ditambah try-catch agar tidak throw `MIDDLEWARE_INVOCATION_FAILED`

### File Baru
- `app/app/(jamaah)/profile/edit/page.tsx` — Form edit nama lengkap & nomor WA
- `public/landing.html` — Landing page lengkap (hero, fitur, perbandingan, FAQ, CTA)
- `public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — PWA icons (emerald + gold)
- `supabase/migrations/003_rpc_functions.sql` — RPC atomic update campaign

### Konfigurasi yang Diubah
- `middleware.ts`: `TAKMIR_ROUTES = ['/dkm']` (dari list panjang ke prefix tunggal)
- `components/takmir/Sidebar.tsx`: semua href diperbarui ke `/dkm/*`
- `components/jamaah/MosqueCard.tsx`, `MosqueMap.tsx`: link masjid ke `/app/mosque/[id]`
- `app/auth/page.tsx`: redirect setelah login ke `/app`

---

## Status Deployment

| Item | Status |
|------|--------|
| Vercel env vars | ✅ Done |
| Domain umatpro.com | ✅ Active (nameserver Vercel) |
| Supabase migrations 001-003 | ✅ Done |
| Storage bucket kas-receipts | ✅ Done |
| Supabase Auth Site URL | ⬜ Set ke `https://umatpro.com` |
| Testing alur lengkap | ⬜ Belum |

### Yang masih perlu dilakukan manual
1. **Supabase Auth URL**: Dashboard → Authentication → URL Configuration → Site URL: `https://umatpro.com`, Redirect URLs: `https://umatpro.com/**`

---

## Fase 2 (Belum Diimplementasi)

- [ ] Manajemen kajian (CRUD jadwal kajian per masjid)
- [ ] CRUD pengumuman via UI (saat ini langsung ke DB)
- [ ] Push notification browser (PWA service worker sudah ada di `public/sw.js`)
- [ ] Export laporan kas ke PDF/Excel
- [ ] QR code infaq untuk cetak/tampil di masjid
- [ ] Halaman publik profil masjid (tanpa login)

---

## Library & Dependency Penting

- `next`: 14.2.3
- `@supabase/supabase-js`: ^2.43.1
- `@supabase/ssr`: untuk server-side auth (middleware)
- `adhan`: perhitungan waktu sholat berdasarkan koordinat GPS
- `lucide-react`: ikon UI
- Tailwind CSS dengan custom color tokens (`gd3`, `em3`, `tx1`, dll) di `tailwind.config.ts`

---

## Env Vars yang Dibutuhkan

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_API_TOKEN=      # untuk broadcast WA (opsional)
WHATSAPP_PHONE_ID=       # untuk broadcast WA (opsional)
```
