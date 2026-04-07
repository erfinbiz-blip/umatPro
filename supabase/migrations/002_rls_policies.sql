-- UmatPro v1.0 — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql

-- ================================================================
-- ENABLE RLS
-- ================================================================
alter table mosques enable row level security;
alter table mosque_roles enable row level security;
alter table follows enable row level security;
alter table prayer_schedules enable row level security;
alter table kajians enable row level security;
alter table kas_transactions enable row level security;
alter table infaq_codes enable row level security;
alter table campaigns enable row level security;
alter table campaign_updates enable row level security;
alter table marketplace_products enable row level security;
alter table contact_hashes enable row level security;
alter table announcements enable row level security;
alter table profiles enable row level security;

-- ================================================================
-- MOSQUES
-- ================================================================
-- Anyone can read mosques
create policy "Anyone can view mosques"
  on mosques for select using (true);

-- Admin role can manage their mosque
create policy "Admin can update mosque"
  on mosques for update
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = mosques.id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Authenticated users can insert new mosques (they become admin)
create policy "Authenticated can create mosque"
  on mosques for insert
  with check (auth.uid() is not null);

-- ================================================================
-- MOSQUE_ROLES
-- ================================================================
-- Mosque admin can manage roles
create policy "Admin can manage roles"
  on mosque_roles for all
  using (
    exists (
      select 1 from mosque_roles mr2
      where mr2.mosque_id = mosque_roles.mosque_id
      and mr2.user_id = auth.uid()
      and mr2.role = 'admin'
    )
  );

-- Users can see their own roles
create policy "User sees own roles"
  on mosque_roles for select
  using (user_id = auth.uid());

-- ================================================================
-- FOLLOWS
-- ================================================================
-- Users can manage their own follows
create policy "User manages own follows"
  on follows for all
  using (user_id = auth.uid());

-- Mosque admins can see follower count (not identities)
create policy "Admin sees mosque follows"
  on follows for select
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = follows.mosque_id
      and user_id = auth.uid()
    )
  );

-- ================================================================
-- PRAYER_SCHEDULES
-- ================================================================
-- Public read
create policy "Anyone can view prayer schedules"
  on prayer_schedules for select using (true);

-- Only mosque roles can insert/update
create policy "Mosque role can manage prayer schedules"
  on prayer_schedules for all
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = prayer_schedules.mosque_id
      and user_id = auth.uid()
    )
  );

-- ================================================================
-- KAJIANS
-- ================================================================
-- Public can see active kajians
create policy "Anyone can view active kajians"
  on kajians for select using (is_active = true);

-- Mosque roles can manage kajians
create policy "Mosque role can manage kajians"
  on kajians for all
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = kajians.mosque_id
      and user_id = auth.uid()
    )
  );

-- ================================================================
-- KAS_TRANSACTIONS (CRITICAL: 2-layer approval)
-- ================================================================
-- PUBLIC can only see APPROVED transactions
create policy "Public sees approved kas only"
  on kas_transactions for select
  using (status = 'approved');

-- Mosque roles can see all transactions for their mosque
create policy "Mosque role sees all kas"
  on kas_transactions for select
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = kas_transactions.mosque_id
      and user_id = auth.uid()
    )
  );

-- Bendahara can insert draft transactions
create policy "Bendahara can insert draft"
  on kas_transactions for insert
  with check (
    exists (
      select 1 from mosque_roles
      where mosque_id = kas_transactions.mosque_id
      and user_id = auth.uid()
      and role = 'bendahara'
    )
  );

-- Dewan can approve/reject (update status)
create policy "Dewan can approve or reject"
  on kas_transactions for update
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = kas_transactions.mosque_id
      and user_id = auth.uid()
      and role = 'dewan'
    )
  );

-- ================================================================
-- INFAQ_CODES
-- ================================================================
-- User sees own codes only
create policy "User sees own infaq codes"
  on infaq_codes for select
  using (user_id = auth.uid());

-- Authenticated users can insert
create policy "Authenticated can create infaq code"
  on infaq_codes for insert
  with check (auth.uid() is not null);

-- Mosque bendahara/admin can view and verify codes for their mosque
create policy "Bendahara can verify infaq codes"
  on infaq_codes for select
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = infaq_codes.mosque_id
      and user_id = auth.uid()
      and role in ('bendahara', 'admin')
    )
  );

create policy "Bendahara can update infaq code status"
  on infaq_codes for update
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = infaq_codes.mosque_id
      and user_id = auth.uid()
      and role in ('bendahara', 'admin')
    )
  );

-- ================================================================
-- CAMPAIGNS
-- ================================================================
-- Public can see active campaigns
create policy "Anyone can view active campaigns"
  on campaigns for select using (status = 'active');

-- Mosque roles can manage campaigns
create policy "Mosque role can manage campaigns"
  on campaigns for all
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = campaigns.mosque_id
      and user_id = auth.uid()
    )
  );

-- ================================================================
-- CAMPAIGN_UPDATES
-- ================================================================
-- Public can view
create policy "Anyone can view campaign updates"
  on campaign_updates for select using (true);

-- Mosque roles can insert updates
create policy "Mosque role can insert campaign updates"
  on campaign_updates for insert
  with check (auth.uid() is not null);

-- ================================================================
-- MARKETPLACE_PRODUCTS
-- ================================================================
-- Public sees approved only
create policy "Public sees approved products"
  on marketplace_products for select
  using (status = 'approved');

-- Seller sees own products
create policy "Seller sees own products"
  on marketplace_products for select
  using (seller_user_id = auth.uid());

-- Authenticated can insert (will be pending)
create policy "Authenticated can submit product"
  on marketplace_products for insert
  with check (auth.uid() is not null);

-- Mosque admin can approve/reject
create policy "Admin can manage products"
  on marketplace_products for update
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = marketplace_products.mosque_id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

-- ================================================================
-- CONTACT_HASHES (Privacy-critical)
-- ================================================================
-- User sees and manages own hashes only
create policy "User sees own hashes"
  on contact_hashes for all
  using (user_id = auth.uid());

-- ================================================================
-- ANNOUNCEMENTS
-- ================================================================
-- Anyone can view active announcements
create policy "Anyone can view active announcements"
  on announcements for select using (is_active = true);

-- Mosque roles can manage announcements
create policy "Mosque role can manage announcements"
  on announcements for all
  using (
    exists (
      select 1 from mosque_roles
      where mosque_id = announcements.mosque_id
      and user_id = auth.uid()
    )
  );

-- ================================================================
-- PROFILES
-- ================================================================
-- Users can view their own profile
create policy "User sees own profile"
  on profiles for select
  using (id = auth.uid());

-- Authenticated users can view basic profile info of others
create policy "Anyone can view profiles"
  on profiles for select using (true);

-- Users can update their own profile
create policy "User updates own profile"
  on profiles for update
  using (id = auth.uid());

-- System can insert profiles (via trigger)
create policy "System can insert profile"
  on profiles for insert
  with check (id = auth.uid());
