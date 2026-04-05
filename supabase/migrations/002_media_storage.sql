-- Bucket médias + image hero paramétrable
-- Exécuter après 001_schema.sql

alter table public.site_settings
  add column if not exists hero_image_url text;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media_select_public" on storage.objects;
create policy "media_select_public"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "media_insert_admin" on storage.objects;
create policy "media_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_update_admin" on storage.objects;
create policy "media_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_delete_admin" on storage.objects;
create policy "media_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());
