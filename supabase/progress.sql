-- Korean Cafe Online: postęp nauki (XP, ziarna, streak, ćwiczenia rozmów).
-- Jak użyć: Supabase → SQL Editor → New query → wklej cały plik → Run. Można uruchomić ponownie.
-- Bez tej tabeli strona nadal działa: postęp zapisuje się wtedy tylko w przeglądarce.

create table if not exists public.progress (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb check (pg_column_size(data) < 20000),
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- Każdy widzi i zmienia tylko swój własny wiersz.
drop policy if exists "czytam swoj postep" on public.progress;
create policy "czytam swoj postep" on public.progress for select to authenticated using (user_id = auth.uid());

drop policy if exists "dodaje swoj postep" on public.progress;
create policy "dodaje swoj postep" on public.progress for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "zmieniam swoj postep" on public.progress;
create policy "zmieniam swoj postep" on public.progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
