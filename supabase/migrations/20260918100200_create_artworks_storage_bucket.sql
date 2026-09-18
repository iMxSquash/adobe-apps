-- Storage bucket `artworks`: public read, authenticated write. SVG is
-- deliberately excluded (stored XSS) and uploads are capped at 10 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artworks',
  'artworks',
  true,
  10485760,
  array['image/png', 'image/webp', 'image/jpeg', 'image/avif']
)
on conflict (id) do nothing;

create policy "Public can read artworks"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'artworks');

create policy "Authenticated users can upload artworks"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'artworks');

create policy "Authenticated users can update artworks"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'artworks')
  with check (bucket_id = 'artworks');

create policy "Authenticated users can delete artworks"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'artworks');
