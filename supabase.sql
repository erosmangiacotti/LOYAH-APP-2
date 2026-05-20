
-- Esegui in Supabase SQL Editor
create table profiles (id uuid primary key references auth.users, name text);
create table entries (id bigint generated always as identity primary key, user_id uuid references auth.users, title text, description text, tags text[], score int, advice text, pattern text, created_at timestamp with time zone default now());
alter table profiles enable row level security;
alter table entries enable row level security;
create policy "users own profiles" on profiles for all using (auth.uid()=id);
create policy "users own entries" on entries for all using (auth.uid()=user_id);
