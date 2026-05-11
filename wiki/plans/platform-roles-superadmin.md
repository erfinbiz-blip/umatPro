# Plan: Platform Roles + Superadmin

**Goal:**
1. Superadmin (1 user, dibuat di awal via seed) — bisa manage semua masjid, verifikasi masjid
2. DKM tetap langsung aktif (tidak ada perubahan flow)
3. Jamaah tetap langsung aktif (tidak ada perubahan flow)

---

## Task Checklist

### 1. Database Migration — `supabase/migrations/004_platform_roles.sql`
- [x] Create table `platform_roles` (user_id, role, created_at)
- [x] RLS: enable, superadmin full access, user read own
- [x] Seed: insert superadmin user + role (via RPC atau manual)

### 2. Types Update — `lib/supabase/types.ts`
- [x] Add `platform_roles` table type
- [x] Add `PlatformRole` convenience type

### 3. Auth Helper — `lib/auth/platform.ts`
- [x] `getPlatformRole(supabase)` → return 'superadmin' | null
- [x] `requireSuperadmin(supabase)` → throw/redirect if not superadmin

### 4. Superadmin Dashboard — `app/superadmin/page.tsx`
- [x] List semua masjid (nama, tier, is_verified, created_at)
- [x] Toggle verifikasi masjid (update `is_verified`)
- [x] Filter/search masjid
- [x] Protected: redirect ke `/auth` kalau bukan superadmin

### 5. Superadmin Layout — `app/superadmin/layout.tsx`
- [x] Sidebar/nav khusus superadmin
- [x] Check platform role di layout level

### 6. Proxy Update — `proxy.ts`
- [x] Add `/superadmin` route protection (must be authenticated + superadmin)
- [x] Redirect non-superadmin ke `/app`

### 7. Seed Script — `supabase/seed_superadmin.sql`
- [x] Insert user ke `auth.users` (manual UUID, email superadmin)
- [x] Insert profile ke `profiles`
- [x] Insert platform_roles superadmin
- [x] Dokumentasi: cara jalankan di Supabase SQL Editor

### 8. Testing
- [x] Unit test: `getPlatformRole` returns correct role
- [x] Unit test: `requireSuperadmin` blocks non-superadmin
- [x] Integration test: superadmin API can verify mosque
- [x] Integration test: non-superadmin cannot access superadmin routes

### 9. Update PRD & Wiki
- [x] Update `PRD.md` — tambah superadmin section
- [x] Update `wiki/log.md`

---

## Schema Detail

### `platform_roles`
```sql
create table if not exists platform_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('superadmin')),
  created_at timestamptz default now(),
  unique(user_id, role)
);
```

### RLS Policies
```sql
alter table platform_roles enable row level security;

-- Superadmin can manage all platform roles
CREATE POLICY "Superadmin manage platform roles"
  ON platform_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM platform_roles pr2
      WHERE pr2.user_id = auth.uid()
      AND pr2.role = 'superadmin'
    )
  );

-- Users can see their own platform role
CREATE POLICY "User sees own platform role"
  ON platform_roles FOR SELECT
  USING (user_id = auth.uid());
```

### Seed Superadmin
```sql
-- Ganti dengan email superadmin yang diinginkan
-- Jalankan di Supabase SQL Editor (service role)
DO $$
DECLARE
  superadmin_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  superadmin_email text := 'superadmin@umatpro.com';
BEGIN
  -- Insert ke auth.users (jika belum ada)
  INSERT INTO auth.users (id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (
    superadmin_id,
    superadmin_email,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin"}'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (superadmin_id, 'Super Admin')
  ON CONFLICT (id) DO NOTHING;

  -- Insert platform role
  INSERT INTO public.platform_roles (user_id, role)
  VALUES (superadmin_id, 'superadmin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/004_platform_roles.sql` | Create |
| `lib/supabase/types.ts` | Modify — add platform_roles |
| `lib/auth/platform.ts` | Create |
| `app/superadmin/page.tsx` | Create |
| `app/superadmin/layout.tsx` | Create |
| `proxy.ts` | Modify — add /superadmin protection |
| `supabase/seed_superadmin.sql` | Create |
| `__tests__/lib/auth/platform.test.ts` | Create |
| `__tests__/app/superadmin/page.test.tsx` | Create |

---

## Completion Status
**Completed**: 2026-05-11
**Branch**: `feature/platform-roles-superadmin` (merged to `main`)
**Tests**: 16 test files, 105 tests all passing
**Commit**: `361e04f feat: implement platform roles + superadmin dashboard`

---

## Notes
- Superadmin hanya 1 user, tidak ada UI untuk create superadmin baru
- Superadmin tidak punya masjid (tidak ada entry di `mosque_roles`)
- Superadmin bisa verifikasi masjid (update `is_verified` di tabel `mosques`)
- Superadmin tidak mengganggu flow DKM/Jamaah yang sudah ada
