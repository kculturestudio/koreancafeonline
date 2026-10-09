-- Korean Cafe Online: etap 1 (role, Korean Café, Fandom Chat, odpowiedzi, edycja i usuwanie wiadomości).
-- Jak użyć: Supabase → SQL Editor → New query → wklej cały plik → Run.
-- Najpierw musi być uruchomiony schema.sql (etap z czatem). Ten plik można uruchomić ponownie bez szkody.
-- Na końcu pliku jest komentarz, jak nadać sobie rolę administratora.

-- =========================================================
-- 1. Profile i role (member, moderator, admin)
-- =========================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Gość' check (char_length(display_name) between 1 and 30),
  role         text not null default 'member' check (role in ('member', 'moderator', 'admin')),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "zalogowani widza profile" on public.profiles;
create policy "zalogowani widza profile" on public.profiles
  for select to authenticated using (true);

-- Każdy może zmienić tylko własną nazwę wyświetlaną. Roli zmienić się nie da (ochrona kolumn poniżej).
drop policy if exists "wlasna nazwa" on public.profiles;
create policy "wlasna nazwa" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated, anon;
grant update (display_name) on public.profiles to authenticated;

-- Profil powstaje automatycznie przy rejestracji (nazwa z formularza).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'name', '')), 30), ''), 'Gość')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profile dla osób, które zarejestrowały się wcześniej.
insert into public.profiles (id, display_name)
select u.id, coalesce(nullif(left(btrim(coalesce(u.raw_user_meta_data ->> 'name', '')), 30), ''), 'Gość')
from auth.users u
on conflict (id) do nothing;

create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'member')
$$;
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.my_role() in ('moderator', 'admin')
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.my_role() = 'admin'
$$;

-- =========================================================
-- 2. Społeczności: stoliki Korean Café (kind = 'table') i Fandom Chat (kind = 'fandom')
-- =========================================================
create table if not exists public.communities (
  id          bigint generated always as identity primary key,
  kind        text   not null check (kind in ('table', 'fandom')),
  slug        text   not null check (slug ~ '^[a-z0-9_-]{1,40}$'),
  name        text   not null check (char_length(name) between 2 and 60),
  description text   not null default '' check (char_length(description) <= 400),
  topic       text   not null default '' check (char_length(topic) <= 80),
  level       text   not null default '' check (char_length(level) <= 20),
  guidelines  text   not null default '' check (char_length(guidelines) <= 800),
  capacity    int    check (capacity is null or capacity between 2 and 50),  -- tylko stoliki
  status      text   not null default 'active' check (status in ('active', 'inactive')),
  featured    boolean not null default false,
  sort        int    not null default 100,
  created_by  uuid   references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (kind, slug)
);

alter table public.communities enable row level security;

drop policy if exists "zalogowani widza spolecznosci" on public.communities;
create policy "zalogowani widza spolecznosci" on public.communities
  for select to authenticated using (status = 'active' or public.is_staff());

drop policy if exists "admin dodaje spolecznosci" on public.communities;
create policy "admin dodaje spolecznosci" on public.communities
  for insert to authenticated with check (public.is_admin());
drop policy if exists "admin zmienia spolecznosci" on public.communities;
create policy "admin zmienia spolecznosci" on public.communities
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin usuwa spolecznosci" on public.communities;
create policy "admin usuwa spolecznosci" on public.communities
  for delete to authenticated using (public.is_admin());

create table if not exists public.community_members (
  community_id bigint not null references public.communities (id) on delete cascade,
  user_id      uuid   not null references public.profiles (id) on delete cascade,
  role         text   not null default 'member' check (role in ('member', 'moderator')),
  joined_at    timestamptz not null default now(),
  primary key (community_id, user_id)
);
create index if not exists community_members_user_idx on public.community_members (user_id);

alter table public.community_members enable row level security;

drop policy if exists "zalogowani widza czlonkow" on public.community_members;
create policy "zalogowani widza czlonkow" on public.community_members
  for select to authenticated using (true);

-- Dołączanie tylko przez funkcję join_community (sprawdza limit miejsc); wyjście można zrobić samemu.
drop policy if exists "wyjscie ze spolecznosci" on public.community_members;
create policy "wyjscie ze spolecznosci" on public.community_members
  for delete to authenticated using (user_id = auth.uid() or public.is_staff());

create or replace function public.join_community(p_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.communities;
  n int;
begin
  if auth.uid() is null then
    raise exception 'zaloguj sie' using errcode = 'P0003';
  end if;
  select * into c from public.communities where id = p_id for update;
  if not found or c.status <> 'active' then
    raise exception 'nieaktywne' using errcode = 'P0004';
  end if;
  if exists (select 1 from public.community_members where community_id = p_id and user_id = auth.uid()) then
    return;
  end if;
  if c.capacity is not null then
    select count(*) into n from public.community_members where community_id = p_id;
    if n >= c.capacity then
      raise exception 'pelny' using errcode = 'P0002';
    end if;
  end if;
  insert into public.community_members (community_id, user_id) values (p_id, auth.uid());
end;
$$;

-- Prawdziwe liczby: członkowie i ostatnia aktywność (same liczby, bez treści wiadomości).
create or replace function public.community_stats()
returns table (community_id bigint, members int, last_message_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select c.id,
         (select count(*)::int from public.community_members m where m.community_id = c.id),
         (select max(msg.created_at) from public.messages msg where msg.channel = c.kind || ':' || c.slug)
  from public.communities c
  where c.status = 'active' and auth.uid() is not null
$$;

-- =========================================================
-- 3. Wiadomości: dostęp tylko dla członków, odpowiedzi, edycja, usuwanie
-- =========================================================
alter table public.messages drop constraint if exists messages_channel_check;
alter table public.messages add constraint messages_channel_check
  check (channel ~ '^(chat|room|table|fandom):[a-z0-9_-]{1,40}$');

alter table public.messages add column if not exists reply_to   bigint references public.messages (id) on delete set null;
alter table public.messages add column if not exists edited_at  timestamptz;
alter table public.messages add column if not exists deleted_at timestamptz;

-- Usunięta wiadomość ma pusty tekst (treść znika z bazy).
alter table public.messages drop constraint if exists messages_text_check;
alter table public.messages drop constraint if exists messages_text_len;
alter table public.messages add constraint messages_text_len
  check ((deleted_at is not null and char_length(text) = 0) or char_length(text) between 1 and 500);

-- Kto może czytać/pisać w kanale. chat: i room: jak dotąd (każda zalogowana osoba).
-- table: i fandom: tylko członkowie danej społeczności (pisać tylko, gdy jest aktywna).
create or replace function public.can_access_channel(ch text, for_write boolean default false)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when ch like 'chat:%' or ch like 'room:%' then true
    else exists (
      select 1
      from public.communities c
      join public.community_members m on m.community_id = c.id
      where c.kind = split_part(ch, ':', 1)
        and c.slug = split_part(ch, ':', 2)
        and m.user_id = auth.uid()
        and (not for_write or c.status = 'active')
    )
  end
$$;

drop policy if exists "zalogowani czytaja wiadomosci" on public.messages;
drop policy if exists "czytaja wiadomosci z dostepem" on public.messages;
create policy "czytaja wiadomosci z dostepem" on public.messages
  for select to authenticated using (public.can_access_channel(channel));

drop policy if exists "zalogowani pisza jako oni sami" on public.messages;
drop policy if exists "pisza jako oni sami z dostepem" on public.messages;
create policy "pisza jako oni sami z dostepem" on public.messages
  for insert to authenticated
  with check (user_id = auth.uid() and deleted_at is null and can_access_channel(channel, true));

-- Odpowiedź musi dotyczyć wiadomości z tego samego kanału.
create or replace function public.messages_check_reply()
returns trigger
language plpgsql
as $$
begin
  if new.reply_to is not null and not exists (
    select 1 from public.messages m where m.id = new.reply_to and m.channel = new.channel
  ) then
    raise exception 'zla odpowiedz' using errcode = 'P0005';
  end if;
  return new;
end;
$$;
drop trigger if exists messages_check_reply on public.messages;
create trigger messages_check_reply
  before insert on public.messages
  for each row execute function public.messages_check_reply();

-- Edycja: tylko własnej, nieusuniętej wiadomości. Zapisuje znacznik "edytowano".
create or replace function public.edit_message(p_id bigint, p_text text)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.messages;
  t text := btrim(coalesce(p_text, ''));
begin
  if char_length(t) not between 1 and 500 then
    raise exception 'zly tekst' using errcode = 'P0006';
  end if;
  select * into m from public.messages where id = p_id for update;
  if not found or m.user_id <> auth.uid() or m.deleted_at is not null
     or not public.can_access_channel(m.channel, true) then
    raise exception 'brak uprawnien' using errcode = 'P0007';
  end if;
  update public.messages set text = t, edited_at = now() where id = p_id returning * into m;
  return m;
end;
$$;

-- Usuwanie: własnej wiadomości albo (moderator/admin) dowolnej. Wiadomość zostaje jako "usunięta".
create or replace function public.delete_message(p_id bigint)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.messages;
begin
  select * into m from public.messages where id = p_id for update;
  if not found or m.deleted_at is not null
     or (m.user_id <> auth.uid() and not public.is_staff()) then
    raise exception 'brak uprawnien' using errcode = 'P0007';
  end if;
  update public.messages set text = '', deleted_at = now() where id = p_id returning * into m;
  return m;
end;
$$;

-- Zmiany (edycja, usunięcie) też mają dochodzić na żywo.
alter table public.messages replica identity full;

grant execute on function public.join_community(bigint)       to authenticated;
grant execute on function public.community_stats()            to authenticated;
grant execute on function public.edit_message(bigint, text)   to authenticated;
grant execute on function public.delete_message(bigint)       to authenticated;
grant execute on function public.my_role()                    to authenticated;

-- =========================================================
-- 4. Startowe stoliki i fandomy (administrator może je później zmieniać)
-- =========================================================
insert into public.communities (kind, slug, name, description, topic, level, guidelines, capacity, featured, sort) values
  ('table', 'anyeong-cafe',  '안녕 Café',    'Spokojny stolik dla osób, które dopiero zaczynają mówić po koreańsku.', 'Rozmowy dla początkujących', 'A1–A2', 'Pisz po koreańsku, polski jest mile widziany w nawiasie. Poprawiamy się nawzajem życzliwie.', 8, true, 10),
  ('table', 'seoul-lounge',  'Seoul Lounge', 'Codzienny koreański i życie w Seulu: jedzenie, kawiarnie, plany na weekend.', 'Koreański na co dzień i lifestyle', 'A2–B1', 'Bez hejtu, bez spamu. Pytania o Koreę są zawsze mile widziane.', 8, true, 20),
  ('table', 'kpop-corner',   'K-Pop Corner', 'Idole, nowe wydania, koncerty i muzyczne rekomendacje.', 'K-pop, idole i muzyka', 'A2–B2', 'Szanujemy wszystkie fandomy. Bez spoilerów bez ostrzeżenia.', 10, true, 30),
  ('table', 'hangul-table',  '한글 테이블',  'Ćwiczymy słownictwo i gramatykę, zadajemy pytania i sprawdzamy zdania.', 'Słownictwo i gramatyka', 'A1–B1', 'Jedno pytanie na wiadomość. Odpowiadamy z przykładem zdania.', 8, true, 40),
  ('table', 'culture-club',  'Culture Club', 'Tradycje, filmy, jedzenie i społeczeństwo Korei.', 'Kultura Korei', 'B1–C1', 'Rozmawiamy z ciekawością i szacunkiem, także gdy się nie zgadzamy.', 10, true, 50)
on conflict (kind, slug) do nothing;

insert into public.communities (kind, slug, name, description, topic, guidelines, featured, sort) values
  ('fandom', 'army',      'ARMY',      'Społeczność fanów BTS: muzyka, nowości, wspólne słuchanie i wspomnienia z koncertów.', 'BTS',        'Szanujemy innych fanów i wszystkie fandomy. Bez hejtu, bez plotek o życiu prywatnym artystów, bez spamu.', true, 10),
  ('fandom', 'stay',      'STAY',      'Społeczność fanów Stray Kids: piosenki, występy, rekomendacje i rozmowy o ulubionych momentach.', 'Stray Kids', 'Szanujemy innych fanów i wszystkie fandomy. Bez hejtu, bez plotek o życiu prywatnym artystów, bez spamu.', true, 20),
  ('fandom', 'multistan', 'MULTISTAN', 'Dla osób, które lubią wiele grup naraz: dziel się odkryciami i polecaj muzykę.', 'Wiele grup', 'Szanujemy wszystkie fandomy, nikt nie musi wybierać „tej jedynej” grupy. Bez hejtu i spamu.', true, 30)
on conflict (kind, slug) do nothing;

-- =========================================================
-- 5. Jak zostać administratorem (zrób to RAZ, po utworzeniu konta w aplikacji)
-- =========================================================
-- Zamień adres e-mail na ten, którym logujesz się w aplikacji, odkomentuj i uruchom:
--
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'TWOJ@EMAIL.PL');
