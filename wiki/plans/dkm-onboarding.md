---
type: plan
date: 2026-05-08
tags: [dkm, onboarding, auth, improvement]
status: in-progress
---

# Plan: DKM Onboarding Improvement

## Tujuan
Pisahkan login Jamaah vs DKM di `/auth`, dan buat dedicated onboarding flow untuk user DKM baru yang belum punya masjid.

## Perubahan

### 1. `/auth` — Tab Login Dual Role
- Tambahkan tab switcher: **Jamaah** | **DKM**
- Jamaah (default) → redirect `/app` setelah login
- DKM → redirect `/dkm` setelah login (middleware akan handle onboarding redirect jika belum punya mosque)
- Simpan pilihan ke `localStorage`

### 2. `/dkm/onboarding` — Dedicated Onboarding Page (BARU)
- Pindahkan form register masjid dari `/dkm` ke halaman khusus
- Styling konsisten dengan design system (Glass, GoldButton, ArabesqueBg)
- Step: Data Masjid → Rekening (opsional) → Submit → Redirect `/dkm`
- Validasi: nama masjid wajib, alamat wajib

### 3. `/dkm/(takmir)/page.tsx` — Hapus RegisterMosqueForm
- Dashboard selalu menampilkan stats (tidak perlu cek `!stats` untuk form register)
- User tanpa mosque sudah di-redirect ke `/dkm/onboarding` oleh middleware

### 4. `proxy.ts` — Update Middleware Logic
- `/dkm` + login + punya mosque → lanjut
- `/dkm` + login + **belum punya mosque** → redirect `/dkm/onboarding`
- `/dkm/onboarding` + tanpa login → redirect `/auth`
- `/dkm/onboarding` + sudah punya mosque → redirect `/dkm`

### 5. Test Update
- `__tests__/middleware.test.ts`: tambah test case redirect `/dkm/onboarding`

## Checklist
- [ ] 1. Buat `/dkm/onboarding/page.tsx`
- [ ] 2. Update `/auth/page.tsx` — tab switcher
- [ ] 3. Update `/dkm/(takmir)/page.tsx` — hapus RegisterMosqueForm
- [ ] 4. Update `proxy.ts` — onboarding redirect logic
- [ ] 5. Update `__tests__/middleware.test.ts`
- [ ] 6. Jalankan test — semua harus pass
- [ ] 7. Update wiki & log

## File yang Diubah
| File | Aksi |
|------|------|
| `app/dkm/onboarding/page.tsx` | Baru |
| `app/auth/page.tsx` | Edit |
| `app/dkm/(takmir)/page.tsx` | Edit |
| `proxy.ts` | Edit |
| `__tests__/middleware.test.ts` | Edit |
