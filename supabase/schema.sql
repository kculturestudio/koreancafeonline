-- Korean Cafe Online: baza wiadomości czatu.
-- Jak użyć: Supabase → SQL Editor → New query → wklej cały plik → Run.
-- Można uruchomić ponownie bez szkody (nic się nie dubluje).

create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  channel    text        not null check (channel ~ '^(chat|room):[a-z0-9_-]{1,40}$'),
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  author     text        not null check (char_length(author) between 1 and 30),
  text       text        not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists messages_channel_created_idx on public.messages (channel, created_at desc);
create index if not exists messages_user_created_idx    on public.messages (user_id, created_at desc);

-- Reguły dostępu (Row Level Security): bez nich każdy z kluczem publicznym mógłby wszystko.
alter table public.messages enable row level security;

drop policy if exists "zalogowani czytaja wiadomosci" on public.messages;
create policy "zalogowani czytaja wiadomosci"
  on public.messages for select
  to authenticated
  using (true);

-- Pisać można tylko jako ty sam.
drop policy if exists "zalogowani pisza jako oni sami" on public.messages;
create policy "zalogowani pisza jako oni sami"
  on public.messages for insert
  to authenticated
  with check (user_id = auth.uid());

-- Ochrona przed zalewaniem czatu: jedna wiadomość na osobę na sekundę.
create or replace function public.messages_rate_limit()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from public.messages m
    where m.user_id = new.user_id
      and m.created_at > now() - interval '1 second'
  ) then
    raise exception 'za szybko: poczekaj sekunde' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function public.messages_rate_limit();

-- Brak polityk update i delete = nikt nie może edytować ani kasować wiadomości przez stronę.
-- Moderację (usuwanie) robisz na razie ręcznie w Supabase → Table Editor.

-- Wiadomości na żywo (Realtime): włącz publikowanie zmian tej tabeli.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
