-- UmatPro — Platform Roles (Superadmin)
-- Creates platform-wide role system for superadmin access

-- ================================================================
-- CREATE TABLE
-- ================================================================
create table if not exists platform_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('superadmin')),
  created_at timestamptz default now(),
  unique(user_id, role)
);

-- ================================================================
-- ENABLE RLS
-- ================================================================
alter table platform_roles enable row level security;

-- ================================================================
-- RLS POLICIES
-- ================================================================

-- Superadmin can manage all platform roles
create policy "Superadmin manage platform roles"
  on platform_roles for all
  using (
    exists (
      select 1 from platform_roles pr2
      where pr2.user_id = auth.uid()
      and pr2.role = 'superadmin'
    )
  );

-- Users can see their own platform role
create policy "User sees own platform role"
  on platform_roles for select
  using (user_id = auth.uid());
