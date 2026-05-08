---
type: plan
date: 2026-05-09
tags: [phase-a, campaigns, kampanye, donations, dkm, jamaah]
status: in-progress
---

# Plan: Phase A — Kampanye Donasi

## Tujuan
Lengkapi fitur kampanye donasi: DKM bisa kelola campaign, Jamaah bisa lihat & donasi.

## Flow

### DKM Management (`/dkm/kampanye`)
- **List** — semua campaign (active/completed/draft) dengan stats
- **Create** — form: judul, deskripsi, target nominal, deadline, foto
- **Edit** — update detail campaign
- **Toggle status** — aktifkan/pause/selesai
- **Post updates** — tambah update progress (teks + foto opsional)
- **View donors** — lihat siapa yang donasi ke campaign ini

### Jamaah Discovery
- **Home** (`/app`) — section "Kampanye Donasi" (top 3 dari masjid yang di-follow)
- **Dedicated page** (`/app/kampanye`) — list semua campaign aktif dari masjid yang di-follow + nearby

### Donation Flow
- Jamaah klik campaign → detail page dengan progress + riwayat update + tombol "Donasi Sekarang"
- Tombol redirect ke `/app/infaq` dengan campaign **pre-selected**
- Gunakan existing infaq system: `infaq_codes` dengan `campaign_id`
- Setelah verifikasi DKM → `increment_campaign_raised` RPC otomatis update progress

## Database
- Tabel `campaigns` sudah ada (001_initial_schema.sql)
- Tabel `campaign_updates` sudah ada
- RLS policies sudah ada (002_rls_policies.sql)
- RPC `increment_campaign_raised` sudah ada (003_rpc_functions.sql)

## Checklist

### Tests (TDD)
- [ ] `__tests__/campaigns/dkm-management.test.ts` — CRUD campaign, toggle status, post update
- [ ] `__tests__/campaigns/jamaah-discovery.test.ts` — list campaigns, calculate progress
- [ ] `__tests__/campaigns/donation-flow.test.ts` — pre-select campaign, increment raised

### DKM Implementation
- [ ] `/dkm/kampanye/page.tsx` — halaman kelola campaign
- [ ] `components/takmir/CampaignForm.tsx` — form create/edit
- [ ] `components/takmir/CampaignList.tsx` — list dengan status badge
- [ ] `components/takmir/CampaignUpdateForm.tsx` — form post update
- [ ] `components/takmir/CampaignDonors.tsx` — list donors
- [ ] Update `components/takmir/Sidebar.tsx` — tambah menu "Kampanye Donasi"

### Jamaah Implementation
- [ ] `/app/kampanye/page.tsx` — list campaign aktif
- [ ] Update `/app/(jamaah)/page.tsx` — section featured campaigns
- [ ] Update `/app/(jamaah)/infaq/page.tsx` — support pre-select campaign
- [ ] Update `components/jamaah/InfaqFlow.tsx` — terima campaign prop

### API & Types
- [ ] Update `lib/supabase/types.ts` — tambah CampaignUpdate type
- [ ] Update `wiki/sources/openapi.yaml` — dokumentasi endpoints

### Integration
- [ ] Run full test suite
- [ ] Update wiki/log.md

## File yang Diubah
| File | Aksi |
|------|------|
| `app/dkm/kampanye/page.tsx` | Baru |
| `app/app/kampanye/page.tsx` | Baru |
| `app/app/(jamaah)/page.tsx` | Edit — tambah section kampanye |
| `app/app/(jamaah)/infaq/page.tsx` | Edit — support pre-select campaign |
| `components/takmir/CampaignForm.tsx` | Baru |
| `components/takmir/CampaignList.tsx` | Baru |
| `components/takmir/CampaignUpdateForm.tsx` | Baru |
| `components/takmir/CampaignDonors.tsx` | Baru |
| `components/takmir/Sidebar.tsx` | Edit — tambah menu |
| `components/jamaah/InfaqFlow.tsx` | Edit — terima campaign prop |
| `lib/supabase/types.ts` | Edit — tambah types |
| `wiki/sources/openapi.yaml` | Edit — dokumentasi |
| `__tests__/campaigns/*.test.ts` | Baru (3 files) |
