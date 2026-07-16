-- Run this once in Supabase: SQL Editor → New query → paste → Run

create table entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  value numeric not null,
  created_at timestamptz not null default now()
);

-- Allow anyone with the site link to read and add entries.
-- (No update/delete policy = nobody can edit or wipe the board from the app.)
alter table entries enable row level security;

create policy "public read" on entries
  for select using (true);

create policy "public insert" on entries
  for insert with check (true);
