-- UmatPro v1.0 — RPC Functions
-- Run AFTER 002_rls_policies.sql

-- ================================================================
-- INCREMENT CAMPAIGN RAISED AMOUNT (atomic, race-condition safe)
-- ================================================================
create or replace function increment_campaign_raised(
  p_campaign_id uuid,
  p_amount bigint
)
returns void
language plpgsql
security definer
as $$
begin
  update campaigns
  set raised_amount = raised_amount + p_amount
  where id = p_campaign_id;
end;
$$;

-- Grant execute to authenticated users (RLS on campaigns still applies)
grant execute on function increment_campaign_raised(uuid, bigint) to authenticated;
