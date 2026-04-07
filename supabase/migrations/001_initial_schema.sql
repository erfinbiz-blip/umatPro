-- UmatPro v1.0 — Initial Schema
-- Run in Supabase SQL Editor

-- ================================================================
-- TABLES
-- ================================================================

-- 1. mosques
create table if not exists mosques (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat float8,
  lng float8,
  description text,
  bank_name text,
  bank_account text,
  bank_holder text,
  is_verified boolean default false,
  tier text default 'free', -- 'free' | 'premium'
  photo_url text,
  created_at timestamptz default now()
);

-- 2. mosque_roles (multi-role per mosque)
create table if not exists mosque_roles (
  id uuid primary key default gen_random_uuid(),
  mosque_id uuid references mosques(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null, -- 'bendahara' | 'dewan' | 'admin'
  created_at timestamptz default now(),
  unique(mosque_id, user_id, role)
);

-- 3. follows
create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  mosque_id uuid references mosques(id) on delete cascade,
  notify_kajian boolean default true,
  notify_event boolean default true,
  notify_donasi boolean default true,
  notify_darurat boolean default true,
  created_at timestamptz default now(),
  unique(user_id, mosque_id)
);

-- 4. prayer_schedules
create table if not exists prayer_schedules (
  id uuid primary key default gen_random_uuid(),
  mosque_id uuid references mosques(id) on delete cascade,
  date date not null,
  subuh time,
  syuruq time,
  dzuhur time,
  ashar time,
  maghrib time,
  isya time,
  iqamah_subuh_offset int default 10,
  iqamah_dzuhur_offset int default 15,
  iqamah_ashar_offset int default 10,
  iqamah_maghrib_offset int default 5,
  iqamah_isya_offset int default 10,
  unique(mosque_id, date)
);

-- 5. kajians
create table if not exists kajians (
  id uuid primary key default gen_random_uuid(),
  mosque_id uuid references mosques(id) on delete cascade,
  title text not null,
  ustadz text,
  day_of_week int, -- 0=Sun 6=Sat
  time_start time,
  topic text,
  is_recurring boolean default true,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 6. kas_transactions (CORE: 2-layer approval)
-- CRITICAL: No transaction can be public without Dewan approval
create table if not exists kas_transactions (
  id uuid primary key default gen_random_uuid(),
  mosque_id uuid references mosques(id) on delete cascade,
  type text not null, -- 'in' | 'out'
  amount bigint not null, -- in IDR
  description text not null,
  receipt_url text, -- photo of nota/bukti
  status text default 'draft', -- 'draft' | 'approved' | 'rejected'
  created_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now()
);

-- 7. infaq_codes (manual transfer unique code system)
create table if not exists infaq_codes (
  id uuid primary key default gen_random_uuid(),
  mosque_id uuid references mosques(id) on delete cascade,
  user_id uuid references auth.users(id),
  nominal bigint not null,
  unique_code int not null, -- 001-999
  total_transfer bigint not null, -- nominal + unique_code
  campaign_id uuid,
  status text default 'pending', -- 'pending' | 'verified' | 'rejected' | 'expired'
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  expires_at timestamptz default (now() + interval '24 hours'),
  created_at timestamptz default now()
);

-- 8. campaigns (donation campaigns)
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  mosque_id uuid references mosques(id) on delete cascade,
  title text not null,
  description text,
  target_amount bigint,
  raised_amount bigint default 0,
  photo_url text,
  deadline date,
  status text default 'active', -- 'active' | 'completed' | 'cancelled'
  created_at timestamptz default now()
);

-- 9. campaign_updates
create table if not exists campaign_updates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  content text,
  photo_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 10. marketplace_products (Pasar Masjid - Phase 2)
create table if not exists marketplace_products (
  id uuid primary key default gen_random_uuid(),
  mosque_id uuid references mosques(id) on delete cascade,
  seller_user_id uuid references auth.users(id),
  name text not null,
  description text,
  price bigint,
  photo_url text,
  wa_number text,
  status text default 'pending', -- 'pending' | 'approved' | 'rejected'
  approved_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 11. contact_hashes (Social Check - privacy compliant)
create table if not exists contact_hashes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  phone_hash text not null, -- SHA-256 one-way, never raw phone
  created_at timestamptz default now(),
  unique(user_id, phone_hash)
);

-- 12. announcements (TV display + broadcast)
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  mosque_id uuid references mosques(id) on delete cascade,
  content text not null,
  category text default 'info', -- 'info' | 'event' | 'urgent' | 'donasi'
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 13. profiles (extended user data)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- ================================================================
-- INDEXES
-- ================================================================
create index if not exists idx_mosque_roles_user on mosque_roles(user_id);
create index if not exists idx_mosque_roles_mosque on mosque_roles(mosque_id);
create index if not exists idx_follows_user on follows(user_id);
create index if not exists idx_follows_mosque on follows(mosque_id);
create index if not exists idx_kas_mosque on kas_transactions(mosque_id);
create index if not exists idx_kas_status on kas_transactions(status);
create index if not exists idx_infaq_mosque on infaq_codes(mosque_id);
create index if not exists idx_infaq_user on infaq_codes(user_id);
create index if not exists idx_infaq_status on infaq_codes(status);
create index if not exists idx_campaigns_mosque on campaigns(mosque_id);
create index if not exists idx_announcements_mosque on announcements(mosque_id);
create index if not exists idx_prayer_mosque_date on prayer_schedules(mosque_id, date);

-- ================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ================================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
