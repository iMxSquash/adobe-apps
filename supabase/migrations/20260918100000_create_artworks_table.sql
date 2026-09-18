-- Table `artworks`: works displayed as files in the Photoshop and Illustrator
-- apps (see TODO.md Phase 2). Managed from the /admin backoffice.
create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  app text not null check (app in ('photoshop', 'illustrator')),
  -- File name without extension: the frontend appends .psd / .ai.
  title text not null,
  slug text not null unique,
  image_url text not null,
  layer_name text not null,
  -- Displayed as a comment in the file (Comments panel / canvas pin).
  description text not null,
  width int check (width > 0),
  height int check (height > 0),
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.artworks is 'Photoshop/Illustrator works managed from the adobe-apps /admin backoffice (adobe-apps TODO.md Phase 2).';

create index artworks_app_sort_order_idx on public.artworks (app, sort_order);

alter table public.artworks enable row level security;

create policy "Public can read visible artworks"
  on public.artworks for select
  to anon, authenticated
  using (visible = true);

create policy "Authenticated users can read all artworks"
  on public.artworks for select
  to authenticated
  using (true);

create policy "Authenticated users can insert artworks"
  on public.artworks for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update artworks"
  on public.artworks for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete artworks"
  on public.artworks for delete
  to authenticated
  using (true);
