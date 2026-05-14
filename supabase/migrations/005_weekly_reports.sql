-- 005_weekly_reports.sql
-- Tabel laporan keuangan mingguan (Jumat–Kamis)

create table if not exists weekly_reports (
  id uuid primary key default gen_random_uuid(),
  mosque_id uuid references mosques(id) on delete cascade not null,
  period_start date not null, -- Jumat
  period_end date not null,   -- Kamis
  status text default 'generated', -- 'generated' | 'approved'
  generated_by uuid references auth.users(id),
  generated_at timestamptz default now(),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  pdf_url text,               -- URL PDF original (generated)
  signed_pdf_url text,        -- URL PDF yang sudah di-scan ttd basah
  total_income bigint default 0,
  total_expense bigint default 0,
  opening_balance bigint default 0,
  closing_balance bigint default 0,
  notes text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_weekly_reports_mosque on weekly_reports(mosque_id);
create index if not exists idx_weekly_reports_period on weekly_reports(period_start, period_end);
create index if not exists idx_weekly_reports_status on weekly_reports(status);

-- RLS: Enable
alter table weekly_reports enable row level security;

create policy "weekly_reports_select_mosque"
  on weekly_reports for select
  using (exists (
    select 1 from mosque_roles
    where mosque_roles.mosque_id = weekly_reports.mosque_id
      and mosque_roles.user_id = auth.uid()
  ));

create policy "weekly_reports_insert_mosque"
  on weekly_reports for insert
  with check (exists (
    select 1 from mosque_roles
    where mosque_roles.mosque_id = weekly_reports.mosque_id
      and mosque_roles.user_id = auth.uid()
      and mosque_roles.role in ('bendahara', 'admin')
  ));

create policy "weekly_reports_update_mosque"
  on weekly_reports for update
  using (exists (
    select 1 from mosque_roles
    where mosque_roles.mosque_id = weekly_reports.mosque_id
      and mosque_roles.user_id = auth.uid()
      and mosque_roles.role in ('bendahara', 'admin', 'dewan')
  ));
