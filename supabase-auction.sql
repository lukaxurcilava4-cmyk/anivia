-- ANIVIA Anime Draft
-- Enable Anonymous Auth in Supabase Authentication settings before using the game.
create extension if not exists pgcrypto;

create table if not exists public.auction_rooms (
  id uuid primary key,
  code text unique not null check (code ~ '^[A-Z2-9]{6}$'),
  host_id uuid not null references auth.users(id),
  status text not null default 'waiting' check (status in ('waiting', 'ready', 'starting', 'in_game', 'finished')),
  anime_id text,
  state jsonb not null default '{"round":0,"characters":[],"current":null,"bid":0,"leader":null,"passed":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auction_players (
  room_id uuid not null references public.auction_rooms(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 16),
  slot smallint not null check (slot in (1, 2)),
  ready boolean not null default false,
  connected_at timestamptz not null default now(),
  primary key (room_id, player_id),
  unique (room_id, slot)
);

create table if not exists public.auction_queue (
  player_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  room_id uuid references public.auction_rooms(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.auction_rooms enable row level security;
alter table public.auction_players enable row level security;
alter table public.auction_queue enable row level security;

create policy "players can read their rooms" on public.auction_rooms for select to authenticated
using (exists (select 1 from public.auction_players p where p.room_id = id and p.player_id = auth.uid()) or host_id = auth.uid());
create policy "hosts can create rooms" on public.auction_rooms for insert to authenticated with check (host_id = auth.uid());
create policy "room members can update room state" on public.auction_rooms for update to authenticated
using (exists (select 1 from public.auction_players p where p.room_id = id and p.player_id = auth.uid()) or host_id = auth.uid())
with check (exists (select 1 from public.auction_players p where p.room_id = id and p.player_id = auth.uid()) or host_id = auth.uid());

create policy "players can read room players" on public.auction_players for select to authenticated
using (exists (select 1 from public.auction_players own where own.room_id = room_id and own.player_id = auth.uid()));
create policy "players can join open rooms" on public.auction_players for insert to authenticated with check (player_id = auth.uid());
create policy "players can update their readiness" on public.auction_players for update to authenticated using (player_id = auth.uid()) with check (player_id = auth.uid());
create policy "players can manage their matchmaking entry" on public.auction_queue for all to authenticated using (player_id = auth.uid()) with check (player_id = auth.uid());

create or replace function public.auction_find_match(p_name text)
returns table (room_id uuid, room_code text)
language plpgsql security definer set search_path = public
as $$
declare waiting_player public.auction_queue%rowtype;
declare new_room uuid := gen_random_uuid();
declare new_code text := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
begin
  select * into waiting_player from public.auction_queue
    where room_id is null and player_id <> auth.uid()
    order by created_at asc limit 1 for update skip locked;
  if waiting_player.player_id is null then
    insert into public.auction_queue (player_id, name) values (auth.uid(), left(p_name, 16))
      on conflict (player_id) do update set name = excluded.name, created_at = now(), room_id = null;
    return;
  end if;
  insert into public.auction_rooms (id, code, host_id, status) values (new_room, new_code, waiting_player.player_id, 'waiting');
  insert into public.auction_players (room_id, player_id, name, slot) values (new_room, waiting_player.player_id, waiting_player.name, 1), (new_room, auth.uid(), left(p_name, 16), 2);
  update public.auction_queue set room_id = new_room where player_id in (waiting_player.player_id, auth.uid());
  return query select new_room, new_code;
end;
$$;

create or replace function public.touch_auction_room() returns trigger language plpgsql security invoker as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists auction_rooms_touch on public.auction_rooms;
create trigger auction_rooms_touch before update on public.auction_rooms for each row execute function public.touch_auction_room();

alter table public.auction_rooms replica identity full;
alter table public.auction_players replica identity full;
alter table public.auction_queue replica identity full;
-- Run once in the Supabase SQL editor if the publication does not include these tables:
alter publication supabase_realtime add table public.auction_rooms;
alter publication supabase_realtime add table public.auction_players;
