-- Editorial assets are intentionally public by URL, including draft uploads.
-- The editor warns against uploading private data. Writes require an admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('newsletter-media', 'newsletter-media', true, 26214400, array[
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp4',
  'audio/ogg', 'audio/wav', 'application/pdf'
]);

create policy newsletter_media_admin_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'newsletter-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

create policy newsletter_media_admin_select on storage.objects
for select to authenticated
using (
  bucket_id = 'newsletter-media'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

-- No UPDATE policy: files are immutable and never overwritten in old emails.
create policy newsletter_media_admin_delete_own on storage.objects
for delete to authenticated
using (
  bucket_id = 'newsletter-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);
