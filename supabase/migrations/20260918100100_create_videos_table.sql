-- Table `videos`: YouTube videos shown in the Premiere Pro app, where the
-- YouTube embed replaces the program monitor (see TODO.md Phase 2).
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  -- Sequence name displayed in Premiere.
  title text not null,
  slug text not null unique,
  -- Last line of defense: the app also validates the ID on insertion.
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  description text,
  -- 'mm:ss', typed manually in the backoffice (oEmbed does not expose it).
  duration text check (duration ~ '^[0-9]{1,3}:[0-5][0-9]$'),
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.videos is 'Premiere Pro YouTube videos managed from the adobe-apps /admin backoffice (adobe-apps TODO.md Phase 2).';

create index videos_sort_order_idx on public.videos (sort_order);

alter table public.videos enable row level security;

create policy "Public can read visible videos"
  on public.videos for select
  to anon, authenticated
  using (visible = true);

create policy "Authenticated users can read all videos"
  on public.videos for select
  to authenticated
  using (true);

create policy "Authenticated users can insert videos"
  on public.videos for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update videos"
  on public.videos for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete videos"
  on public.videos for delete
  to authenticated
  using (true);
