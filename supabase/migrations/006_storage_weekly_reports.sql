-- 006_storage_weekly_reports.sql
-- Storage bucket untuk weekly reports

insert into storage.buckets (id, name, public)
values ('weekly-reports', 'weekly-reports', true)
on conflict (id) do nothing;

-- RLS policy: allow authenticated users to upload
create policy "weekly_reports_storage_insert"
  on storage.objects for insert
  with check (bucket_id = 'weekly-reports' and auth.role() = 'authenticated');

create policy "weekly_reports_storage_select"
  on storage.objects for select
  using (bucket_id = 'weekly-reports');
