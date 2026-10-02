-- ANIVIA CINEMA: creator uploads, paid tickets, private film storage, reports, payouts.
-- Run AFTER supabase-stak.sql, in the Supabase SQL editor. Anonymous/email auth must be enabled.
-- Money only moves through the SECURITY DEFINER functions below.

create table if not exists public.cinema_settings (
  id boolean primary key default true check (id),
  fee_percent integer not null default 10 check (fee_percent between 0 and 100),
  payout_min bigint not null default 5000,
  require_real_account boolean not null default false -- set true before launch so anonymous users cannot publish or get paid
);
insert into public.cinema_settings (id) values (true) on conflict (id) do nothing;

create table if not exists public.cinema_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.cinema_films (
  id uuid primary key,
  owner uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  description text not null check (char_length(description) between 1 and 500),
  creator_name text not null check (char_length(creator_name) between 1 and 30),
  genres text[] not null check (cardinality(genres) between 1 and 3),
  price integer not null check (price between 10 and 5000),
  poster_path text not null,
  trailer_path text not null,
  video_path text not null,
  duration_s integer not null check (duration_s >= 30),
  status text not null default 'live' check (status in ('live', 'flagged', 'removed', 'blocked')),
  removed_at timestamptz,
  agreement_version text not null,
  signed_name text not null,
  signed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists cinema_films_owner_idx on public.cinema_films (owner, created_at desc);
create index if not exists cinema_films_status_idx on public.cinema_films (status, created_at desc);

create table if not exists public.cinema_tickets (
  user_id uuid not null references auth.users(id) on delete cascade,
  film_id uuid not null references public.cinema_films(id) on delete cascade,
  price_paid integer not null,
  creator_share integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, film_id)
);

create table if not exists public.cinema_creators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  lifetime bigint not null default 0
);

create table if not exists public.cinema_payouts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null check (amount > 0),
  contact text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.cinema_reports (
  film_id uuid not null references public.cinema_films(id) on delete cascade,
  reporter uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('nsfw', 'hate', 'bully', 'copyright', 'spam', 'other')),
  created_at timestamptz not null default now(),
  primary key (film_id, reporter)
);

-- STAK ledger gets a ticket kind.
alter table public.stak_transactions drop constraint if exists stak_transactions_kind_check;
alter table public.stak_transactions add constraint stak_transactions_kind_check
  check (kind in ('purchase_pack', 'spend_item', 'grant', 'refund', 'spend_ticket'));

alter table public.cinema_settings enable row level security;
alter table public.cinema_admins enable row level security;
alter table public.cinema_films enable row level security;
alter table public.cinema_tickets enable row level security;
alter table public.cinema_creators enable row level security;
alter table public.cinema_payouts enable row level security;
alter table public.cinema_reports enable row level security;

drop policy if exists "cinema films read" on public.cinema_films;
create policy "cinema films read" on public.cinema_films for select to anon, authenticated using (status = 'live' or owner = auth.uid());
drop policy if exists "cinema tickets own read" on public.cinema_tickets;
create policy "cinema tickets own read" on public.cinema_tickets for select to authenticated using (user_id = auth.uid());
drop policy if exists "cinema creators own read" on public.cinema_creators;
create policy "cinema creators own read" on public.cinema_creators for select to authenticated using (user_id = auth.uid());
drop policy if exists "cinema payouts own read" on public.cinema_payouts;
create policy "cinema payouts own read" on public.cinema_payouts for select to authenticated using (user_id = auth.uid());

revoke all on public.cinema_settings, public.cinema_admins, public.cinema_films, public.cinema_tickets,
  public.cinema_creators, public.cinema_payouts, public.cinema_reports from anon, authenticated;
grant select on public.cinema_films to anon, authenticated;
grant select on public.cinema_tickets, public.cinema_creators, public.cinema_payouts to authenticated;

-- Storage: trailers and posters are public, full films are private (ticket holders and the owner only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('cinema-public', 'cinema-public', true, 62914560, array['image/jpeg', 'video/mp4', 'video/webm']),
  ('cinema-films', 'cinema-films', false, 262144000, array['video/mp4', 'video/webm'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cinema upload own" on storage.objects;
create policy "cinema upload own" on storage.objects for insert to authenticated
  with check (bucket_id in ('cinema-public', 'cinema-films') and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cinema delete own" on storage.objects;
create policy "cinema delete own" on storage.objects for delete to authenticated
  using (bucket_id in ('cinema-public', 'cinema-films') and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cinema films read" on storage.objects;
create policy "cinema films read" on storage.objects for select to authenticated
  using (
    bucket_id = 'cinema-films' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1
        from public.cinema_films f
        join public.cinema_tickets t on t.film_id = f.id
        where t.user_id = auth.uid()
          and f.video_path = storage.objects.name
          and (f.status = 'live' or (f.status = 'removed' and f.removed_at > now() - interval '30 days'))
      )
    )
  );

-- Server-side copy of the content filter.
create or replace function public.cinema_text_ok(p text)
returns boolean
language sql
immutable
as $$
  select coalesce(p, '') !~* '\y(porn|pron|porno|nsfw|hentai|nude|nudes|rule34|onlyfans|erotic|blowjob|handjob|milf|nigger|nigga|faggot|retard|retarded|tranny|kike|chink|kys|kill yourself)\y';
$$;

-- Publish a film after the client uploaded its three files into <uid>/<film id>/.
create or replace function public.cinema_publish(
  p_id uuid, p_title text, p_desc text, p_creator text, p_genres text[], p_price integer,
  p_poster text, p_trailer text, p_video text, p_duration integer,
  p_signed_name text, p_accepted boolean, p_version text
)
returns jsonb
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  uid uuid := auth.uid();
  s public.cinema_settings%rowtype;
  prefix text;
  tsize bigint;
begin
  if uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select * into s from public.cinema_settings where id;
  if s.require_real_account and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then raise exception 'ACCOUNT_REQUIRED'; end if;
  if not coalesce(p_accepted, false) then raise exception 'TERMS_NOT_ACCEPTED'; end if;
  if char_length(trim(p_signed_name)) < 5 or array_length(string_to_array(trim(p_signed_name), ' '), 1) < 2 then raise exception 'SIGNATURE_REQUIRED'; end if;
  if not (public.cinema_text_ok(p_title) and public.cinema_text_ok(p_desc) and public.cinema_text_ok(p_creator)) then raise exception 'CONTENT_NOT_ALLOWED'; end if;
  if p_price is null or p_price < 10 or p_price > 5000 then raise exception 'BAD_PRICE'; end if;
  if p_duration is null or p_duration < 30 then raise exception 'FILM_TOO_SHORT'; end if;
  if (select count(*) from public.cinema_films where owner = uid and created_at > now() - interval '1 day') >= 10 then raise exception 'UPLOAD_LIMIT'; end if;

  prefix := uid::text || '/' || p_id::text || '/';
  if left(p_poster, length(prefix)) <> prefix or left(p_trailer, length(prefix)) <> prefix or left(p_video, length(prefix)) <> prefix then raise exception 'BAD_PATH'; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'cinema-public' and name = p_poster) then raise exception 'FILE_MISSING'; end if;
  select (metadata ->> 'size')::bigint into tsize from storage.objects where bucket_id = 'cinema-public' and name = p_trailer;
  if tsize is null then raise exception 'FILE_MISSING'; end if;
  if tsize > 62914560 then raise exception 'TRAILER_TOO_BIG'; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'cinema-films' and name = p_video) then raise exception 'FILE_MISSING'; end if;

  insert into public.cinema_films (id, owner, title, description, creator_name, genres, price, poster_path, trailer_path, video_path, duration_s, agreement_version, signed_name)
  values (p_id, uid, trim(p_title), trim(p_desc), trim(p_creator), p_genres, p_price, p_poster, p_trailer, p_video, p_duration, p_version, trim(p_signed_name));
  return jsonb_build_object('id', p_id);
end;
$$;

-- Buy a ticket: STAK leaves the viewer, 90% (fee_percent aside) goes to the creator's earnings.
create or replace function public.cinema_buy_ticket(p_film_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  f public.cinema_films%rowtype;
  s public.cinema_settings%rowtype;
  bal bigint;
  share integer;
begin
  if uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select * into f from public.cinema_films where id = p_film_id and status = 'live';
  if not found then raise exception 'FILM_NOT_FOUND'; end if;
  if f.owner = uid then raise exception 'OWN_FILM'; end if;
  if exists (select 1 from public.cinema_tickets where user_id = uid and film_id = f.id) then raise exception 'ALREADY_OWNED'; end if;
  select * into s from public.cinema_settings where id;

  insert into public.stak_wallets (user_id) values (uid) on conflict (user_id) do nothing;
  select balance into bal from public.stak_wallets where user_id = uid for update;
  if bal < f.price then raise exception 'NOT_ENOUGH_STAK'; end if;
  update public.stak_wallets set balance = balance - f.price, updated_at = now() where user_id = uid returning balance into bal;
  insert into public.stak_transactions (user_id, kind, amount, balance_after, ref) values (uid, 'spend_ticket', -f.price, bal, 'film:' || f.id);

  share := floor(f.price * (100 - s.fee_percent) / 100.0)::integer;
  insert into public.cinema_tickets (user_id, film_id, price_paid, creator_share) values (uid, f.id, f.price, share);
  insert into public.cinema_creators (user_id, balance, lifetime) values (f.owner, share, share)
  on conflict (user_id) do update set balance = public.cinema_creators.balance + share, lifetime = public.cinema_creators.lifetime + share;
  return jsonb_build_object('balance', bal);
end;
$$;

-- Creator dashboard numbers.
create or replace function public.cinema_studio_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  c public.cinema_creators%rowtype;
  s public.cinema_settings%rowtype;
begin
  if uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select * into c from public.cinema_creators where user_id = uid;
  select * into s from public.cinema_settings where id;
  return jsonb_build_object(
    'balance', coalesce(c.balance, 0),
    'lifetime', coalesce(c.lifetime, 0),
    'payout_min', s.payout_min,
    'fee_percent', s.fee_percent,
    'films', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', f.id, 'title', f.title, 'price', f.price, 'poster_path', f.poster_path, 'status', f.status,
        'sold', (select count(*) from public.cinema_tickets t where t.film_id = f.id),
        'earned', (select coalesce(sum(t.creator_share), 0) from public.cinema_tickets t where t.film_id = f.id)
      ) order by f.created_at desc)
      from public.cinema_films f where f.owner = uid and f.status <> 'removed'
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.cinema_delete_film(p_film_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cinema_films set status = 'removed', removed_at = now()
  where id = p_film_id and owner = auth.uid() and status in ('live', 'flagged');
  return found;
end;
$$;

-- Viewers report a film. Three different reporters hide it until an admin reviews it.
create or replace function public.cinema_report(p_film_id uuid, p_reason text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n integer;
begin
  if uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if p_reason not in ('nsfw', 'hate', 'bully', 'copyright', 'spam', 'other') then raise exception 'BAD_REASON'; end if;
  if exists (select 1 from public.cinema_films where id = p_film_id and owner = uid) then raise exception 'OWN_FILM'; end if;
  insert into public.cinema_reports (film_id, reporter, reason) values (p_film_id, uid, p_reason) on conflict do nothing;
  select count(*) into n from public.cinema_reports where film_id = p_film_id;
  if n >= 3 then update public.cinema_films set status = 'flagged' where id = p_film_id and status = 'live'; end if;
  return true;
end;
$$;

-- Payout request (paid manually by you until Stripe Connect is added).
create or replace function public.cinema_request_payout(p_amount bigint, p_contact text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  s public.cinema_settings%rowtype;
  left_over bigint;
begin
  if uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select * into s from public.cinema_settings where id;
  if s.require_real_account and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then raise exception 'ACCOUNT_REQUIRED'; end if;
  if char_length(trim(coalesce(p_contact, ''))) < 5 then raise exception 'CONTACT_REQUIRED'; end if;
  if p_amount is null or p_amount < s.payout_min then raise exception 'BELOW_MINIMUM'; end if;
  update public.cinema_creators set balance = balance - p_amount where user_id = uid and balance >= p_amount returning balance into left_over;
  if not found then raise exception 'NOT_ENOUGH_EARNINGS'; end if;
  insert into public.cinema_payouts (user_id, amount, contact) values (uid, p_amount, trim(p_contact));
  return jsonb_build_object('balance', left_over);
end;
$$;

-- Admin tools. Add yourself with: insert into public.cinema_admins (user_id) values ('<your auth user id>');
create or replace function public.cinema_admin_queue()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.cinema_admins where user_id = auth.uid()) then raise exception 'FORBIDDEN'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', f.id, 'title', f.title, 'creator', f.creator_name, 'status', f.status,
      'reports', (select jsonb_agg(r.reason) from public.cinema_reports r where r.film_id = f.id)
    ) order by f.created_at desc)
    from public.cinema_films f
    where f.status = 'flagged' or exists (select 1 from public.cinema_reports r where r.film_id = f.id)
  ), '[]'::jsonb);
end;
$$;

create or replace function public.cinema_admin_review(p_film_id uuid, p_action text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.cinema_admins where user_id = auth.uid()) then raise exception 'FORBIDDEN'; end if;
  if p_action = 'restore' then
    update public.cinema_films set status = 'live' where id = p_film_id;
    delete from public.cinema_reports where film_id = p_film_id;
  elsif p_action = 'block' then
    update public.cinema_films set status = 'blocked' where id = p_film_id;
  else
    raise exception 'BAD_ACTION';
  end if;
  return true;
end;
$$;

revoke all on function public.cinema_publish(uuid, text, text, text, text[], integer, text, text, text, integer, text, boolean, text) from public;
revoke all on function public.cinema_buy_ticket(uuid), public.cinema_studio_stats(), public.cinema_delete_film(uuid),
  public.cinema_report(uuid, text), public.cinema_request_payout(bigint, text),
  public.cinema_admin_queue(), public.cinema_admin_review(uuid, text) from public;
grant execute on function public.cinema_publish(uuid, text, text, text, text[], integer, text, text, text, integer, text, boolean, text) to authenticated;
grant execute on function public.cinema_buy_ticket(uuid) to authenticated;
grant execute on function public.cinema_studio_stats() to authenticated;
grant execute on function public.cinema_delete_film(uuid) to authenticated;
grant execute on function public.cinema_report(uuid, text) to authenticated;
grant execute on function public.cinema_request_payout(bigint, text) to authenticated;
grant execute on function public.cinema_admin_queue() to authenticated;
grant execute on function public.cinema_admin_review(uuid, text) to authenticated;

-- Admin payouts
create or replace function public.cinema_admin_payouts()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.cinema_admins where user_id = auth.uid()) then raise exception 'FORBIDDEN'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', p.id, 'user_id', p.user_id, 'amount', p.amount, 'contact', p.contact, 'created_at', p.created_at) order by p.created_at)
    from public.cinema_payouts p where p.status = 'pending'
  ), '[]'::jsonb);
end;
$$;

create or replace function public.cinema_admin_payout_set(p_id bigint, p_status text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare r public.cinema_payouts%rowtype;
begin
  if not exists (select 1 from public.cinema_admins where user_id = auth.uid()) then raise exception 'FORBIDDEN'; end if;
  if p_status not in ('paid', 'rejected') then raise exception 'BAD_ACTION'; end if;
  update public.cinema_payouts set status = p_status where id = p_id and status = 'pending' returning * into r;
  if not found then raise exception 'NOT_FOUND'; end if;
  if p_status = 'rejected' then
    update public.cinema_creators set balance = balance + r.amount where user_id = r.user_id;
  end if;
  return true;
end;
$$;

revoke all on function public.cinema_admin_payouts(), public.cinema_admin_payout_set(bigint, text) from public;
grant execute on function public.cinema_admin_payouts() to authenticated;
grant execute on function public.cinema_admin_payout_set(bigint, text) to authenticated;