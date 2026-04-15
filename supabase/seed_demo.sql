-- ================================================================
-- UmatPro — Demo Data Seed
-- ================================================================
-- Jalankan di Supabase SQL Editor (Dashboard → SQL Editor)
-- CATATAN: Script ini TIDAK membuat auth users — gunakan endpoint
-- POST /api/seed-demo untuk membuat user + data sekaligus.
--
-- Script ini hanya untuk referensi struktur data demo.
-- Ganti UUID placeholder dengan UUID user asli dari Supabase Auth.
-- ================================================================

-- Ganti dua baris di bawah dengan UUID dari Supabase Auth → Users
-- setelah membuat user demo.dkm@umatpro.com dan demo.jamaah@umatpro.com
\set DKM_USER_ID    '''00000000-0000-0000-0000-000000000001'''
\set JAMAAH_USER_ID '''00000000-0000-0000-0000-000000000002'''
\set MOSQUE_ID      '''aaaaaaaa-0001-0001-0001-000000000001'''

-- ================================================================
-- 1. PROFILES
-- ================================================================
insert into public.profiles (id, full_name, phone) values
  (:DKM_USER_ID,    'Admin Demo Masjid',   '628112345678'),
  (:JAMAAH_USER_ID, 'Ahmad Demo Jamaah',   '628198765432')
on conflict (id) do update set
  full_name = excluded.full_name,
  phone     = excluded.phone;

-- ================================================================
-- 2. MOSQUE
-- ================================================================
insert into public.mosques (
  id, name, address, lat, lng, description,
  bank_name, bank_account, bank_holder, is_verified, tier
) values (
  :MOSQUE_ID,
  'Masjid Al-Ikhlas Demo',
  'Jl. Masjid Raya No. 1, Menteng, Jakarta Pusat, DKI Jakarta 10310',
  -6.1944, 106.8346,
  'Masjid Al-Ikhlas adalah masjid percontohan digital yang menggunakan UmatPro untuk manajemen kas, infaq, dan komunikasi jamaah secara transparan dan modern.',
  'BSI (Bank Syariah Indonesia)',
  '7123456789',
  'DKM Masjid Al-Ikhlas',
  true,
  'premium'
) on conflict (id) do nothing;

-- ================================================================
-- 3. MOSQUE ROLES (DKM user = admin + bendahara + dewan)
-- ================================================================
insert into public.mosque_roles (mosque_id, user_id, role) values
  (:MOSQUE_ID, :DKM_USER_ID, 'admin'),
  (:MOSQUE_ID, :DKM_USER_ID, 'bendahara'),
  (:MOSQUE_ID, :DKM_USER_ID, 'dewan')
on conflict (mosque_id, user_id, role) do nothing;

-- ================================================================
-- 4. FOLLOWS (Jamaah follows mosque)
-- ================================================================
insert into public.follows (user_id, mosque_id, notify_kajian, notify_event)
values (:JAMAAH_USER_ID, :MOSQUE_ID, true, true)
on conflict (user_id, mosque_id) do nothing;

-- ================================================================
-- 5. KAJIANS (Weekly programs)
-- ================================================================
insert into public.kajians (mosque_id, title, ustadz, day_of_week, time_start, topic, is_recurring, is_active)
select :MOSQUE_ID, t.title, t.ustadz, t.dow, t.time_start::time, t.topic, true, true
from (values
  ('Kajian Tafsir Al-Quran',    'Ust. Dr. Abdullah Syafi''i',   0, '07:00', 'Tafsir Surah Al-Baqarah — Adab & Akhlak dalam Islam'),
  ('Kajian Fiqih Muamalah',     'Ust. H. Ridwan Kamil Fauzi',   3, '19:30', 'Hukum Transaksi Digital dan Keuangan Syariah'),
  ('Kuliah Shubuh',             'Ust. Muhammad Arifin',         1, '05:15', 'Keutamaan Shalat Berjamaah di Masjid'),
  ('Kajian Muslimah',           'Ustzh. Fatimah Az-Zahra',      5, '09:00', 'Keluarga Sakinah: Membangun Generasi Qurani'),
  ('Tahsin Al-Quran Remaja',    'Ust. Hasan Basri, S.Pd',       6, '16:00', 'Perbaikan Makhraj dan Tajwid untuk Remaja')
) as t(title, ustadz, dow, time_start, topic)
where not exists (
  select 1 from public.kajians k where k.mosque_id = :MOSQUE_ID
);

-- ================================================================
-- 6. KAS TRANSACTIONS
-- ================================================================
insert into public.kas_transactions
  (mosque_id, type, amount, description, status, created_by, approved_by, approved_at)
select :MOSQUE_ID, t.type, t.amount, t.description, t.status, :DKM_USER_ID,
  case when t.status = 'approved' then :DKM_USER_ID else null end,
  case when t.status = 'approved' then now() - (t.days_ago || ' days')::interval else null end
from (values
  ('in',  5000000,  'Infaq Jumat — 7 Jan 2025',              'approved', 10),
  ('in',  3500000,  'Infaq Jumat — 14 Jan 2025',             'approved', 8),
  ('in',  7250000,  'Donasi Infaq Digital — Jan 2025',       'approved', 6),
  ('in', 10000000,  'Wakaf Renovasi Mihrab — Anonim',        'approved', 4),
  ('in',  4200000,  'Infaq Jumat — 28 Jan 2025',             'approved', 2),
  ('out', 1500000,  'Listrik & Air — Januari 2025',          'approved', 2),
  ('out', 2000000,  'Honor Imam & Muadzin — Jan 2025',       'approved', 2),
  ('out',  800000,  'Alat Kebersihan Masjid',                'approved', 1),
  ('in',  6100000,  'Infaq Jumat — Feb 2025',                'draft',    0),
  ('out', 3500000,  'Cat & Renovasi Pagar Masjid',           'draft',    0)
) as t(type, amount, description, status, days_ago)
where not exists (
  select 1 from public.kas_transactions k where k.mosque_id = :MOSQUE_ID
);

-- ================================================================
-- 7. ANNOUNCEMENTS
-- ================================================================
insert into public.announcements (mosque_id, content, category, is_active, created_by)
select :MOSQUE_ID, t.content, t.category, true, :DKM_USER_ID
from (values
  ('event', '🕌 Kajian Akbar "Ramadhan Penuh Berkah" — Ahad, 16 Februari 2025 pukul 08.00 WIB. Bersama Ust. Dr. Abdullah Syafi''i. Terbuka untuk umum. Mari ajak keluarga!'),
  ('info',  '💰 Alhamdulillah! Program renovasi mihrab berhasil terkumpul Rp 10.000.000 dari donatur anonim. Jazakumullahu khairan. Pembangunan dimulai Februari 2025.'),
  ('urgent','🚨 PENTING: Shalat Jumat pekan ini dipindahkan ke Aula karena renovasi mihrab. Harap datang lebih awal. Khutbah tetap pukul 12.00 WIB.'),
  ('donasi','❤️ Donasi Renovasi Mihrab masih dibuka. Target Rp 25.000.000. Terkumpul Rp 10.000.000. Berinfaq melalui rekening BSI 7123456789 a.n. DKM Al-Ikhlas.')
) as t(category, content)
where not exists (
  select 1 from public.announcements a where a.mosque_id = :MOSQUE_ID
);

-- ================================================================
-- 8. CAMPAIGNS
-- ================================================================
insert into public.campaigns
  (mosque_id, title, description, target_amount, raised_amount, deadline, status)
select :MOSQUE_ID, t.title, t.description, t.target, t.raised, t.deadline::date, 'active'
from (values
  (
    'Renovasi Mihrab Masjid Al-Ikhlas',
    'Program renovasi mihrab dan area imam masjid agar lebih representatif. Termasuk marmer baru, kaligrafi, dan pencahayaan LED.',
    25000000, 10000000, '2025-03-31'
  ),
  (
    'Pengadaan AC Ruang Utama',
    'Pemasangan 4 unit AC split 2 PK untuk kenyamanan jamaah saat beribadah di musim panas.',
    16000000, 4500000, '2025-04-30'
  )
) as t(title, description, target, raised, deadline)
where not exists (
  select 1 from public.campaigns c where c.mosque_id = :MOSQUE_ID
);

-- ================================================================
-- 9. INFAQ CODES (pending + verified for demo)
-- ================================================================
insert into public.infaq_codes
  (mosque_id, user_id, nominal, unique_code, total_transfer, status, verified_by, verified_at, expires_at)
select :MOSQUE_ID, :JAMAAH_USER_ID, t.nominal, t.code, t.total, t.status,
  case when t.status = 'verified' then :DKM_USER_ID else null end,
  case when t.status = 'verified' then now() - interval '2 hours' else null end,
  now() + (t.expires_hours || ' hours')::interval
from (values
  (100000, 237, 100237, 'pending',  12),
  (500000, 412, 500412, 'pending',  20),
  ( 50000,  91,  50091, 'verified', 22)
) as t(nominal, code, total, status, expires_hours)
where not exists (
  select 1 from public.infaq_codes i where i.mosque_id = :MOSQUE_ID
);

-- ================================================================
-- 10. PRAYER SCHEDULES (today + 7 days)
-- ================================================================
insert into public.prayer_schedules
  (mosque_id, date, subuh, syuruq, dzuhur, ashar, maghrib, isya,
   iqamah_subuh_offset, iqamah_dzuhur_offset, iqamah_ashar_offset,
   iqamah_maghrib_offset, iqamah_isya_offset)
select
  :MOSQUE_ID,
  (current_date + s.i)::date,
  '04:25'::time, '05:45'::time, '11:55'::time,
  '15:10'::time, '17:55'::time, '19:05'::time,
  10, 15, 10, 5, 10
from generate_series(0, 6) as s(i)
on conflict (mosque_id, date) do nothing;

-- ================================================================
-- DONE — Check results
-- ================================================================
select
  (select count(*) from public.mosques      where id = :MOSQUE_ID) as mosques,
  (select count(*) from public.mosque_roles where mosque_id = :MOSQUE_ID) as roles,
  (select count(*) from public.kajians      where mosque_id = :MOSQUE_ID) as kajians,
  (select count(*) from public.kas_transactions where mosque_id = :MOSQUE_ID) as kas,
  (select count(*) from public.announcements    where mosque_id = :MOSQUE_ID) as announcements,
  (select count(*) from public.campaigns        where mosque_id = :MOSQUE_ID) as campaigns,
  (select count(*) from public.infaq_codes      where mosque_id = :MOSQUE_ID) as infaq_codes,
  (select count(*) from public.prayer_schedules where mosque_id = :MOSQUE_ID) as prayer_schedules,
  (select count(*) from public.follows          where mosque_id = :MOSQUE_ID) as follows;
