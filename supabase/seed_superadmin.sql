-- UmatPro — Seed Superadmin User
-- Jalankan di Supabase SQL Editor dengan service role key
-- 
-- INSTRUKSI:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Paste query ini
-- 3. Ganti email superadmin jika diperlukan
-- 4. Jalankan (Run)

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
