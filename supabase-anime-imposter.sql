-- Anime Imposter multiplayer schema. Run in the Supabase SQL editor after enabling Anonymous Auth.
create extension if not exists pgcrypto;

create table if not exists public.anime_imposter_characters (
  id text primary key,
  name text not null,
  anime text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard'))
);

insert into public.anime_imposter_characters (id, name, anime, difficulty) values
  ('naruto-uzumaki','Naruto Uzumaki','Naruto','easy'), ('sasuke-uchiha','Sasuke Uchiha','Naruto','easy'), ('sakura-haruno','Sakura Haruno','Naruto','medium'), ('kakashi-hatake','Kakashi Hatake','Naruto','easy'), ('itachi-uchiha','Itachi Uchiha','Naruto','medium'), ('gaara','Gaara','Naruto','medium'),
  ('monkey-d-luffy','Monkey D. Luffy','One Piece','easy'), ('roronoa-zoro','Roronoa Zoro','One Piece','easy'), ('nami','Nami','One Piece','easy'), ('sanji','Sanji','One Piece','easy'), ('nico-robin','Nico Robin','One Piece','medium'), ('shanks','Shanks','One Piece','medium'),
  ('ichigo-kurosaki','Ichigo Kurosaki','Bleach','easy'), ('rukia-kuchiki','Rukia Kuchiki','Bleach','medium'), ('sosuke-aizen','Sosuke Aizen','Bleach','medium'), ('renji-abarai','Renji Abarai','Bleach','hard'),
  ('satoru-gojo','Satoru Gojo','Jujutsu Kaisen','easy'), ('yuji-itadori','Yuji Itadori','Jujutsu Kaisen','easy'), ('megumi-fushiguro','Megumi Fushiguro','Jujutsu Kaisen','medium'), ('nobara-kugisaki','Nobara Kugisaki','Jujutsu Kaisen','medium'), ('ryomen-sukuna','Ryomen Sukuna','Jujutsu Kaisen','easy'), ('yuta-okkotsu','Yuta Okkotsu','Jujutsu Kaisen','medium'),
  ('tanjiro-kamado','Tanjiro Kamado','Demon Slayer','easy'), ('nezuko-kamado','Nezuko Kamado','Demon Slayer','easy'), ('zenitsu-agatsuma','Zenitsu Agatsuma','Demon Slayer','medium'), ('inosuke-hashibira','Inosuke Hashibira','Demon Slayer','medium'), ('giyu-tomioka','Giyu Tomioka','Demon Slayer','medium'), ('shinobu-kocho','Shinobu Kocho','Demon Slayer','medium'),
  ('son-goku','Son Goku','Dragon Ball','easy'), ('vegeta','Vegeta','Dragon Ball','easy'), ('piccolo','Piccolo','Dragon Ball','easy'), ('frieza','Frieza','Dragon Ball','medium'), ('bulma','Bulma','Dragon Ball','easy'), ('gohan','Gohan','Dragon Ball','easy'),
  ('eren-yeager','Eren Yeager','Attack on Titan','easy'), ('mikasa-ackerman','Mikasa Ackerman','Attack on Titan','medium'), ('levi-ackerman','Levi Ackerman','Attack on Titan','easy'), ('armin-arlelt','Armin Arlelt','Attack on Titan','medium'), ('hange-zoe','Hange Zoe','Attack on Titan','hard'),
  ('izuku-midoriya','Izuku Midoriya','My Hero Academia','easy'), ('katsuki-bakugo','Katsuki Bakugo','My Hero Academia','easy'), ('all-might','All Might','My Hero Academia','easy'), ('shoto-todoroki','Shoto Todoroki','My Hero Academia','easy'), ('ochaco-uraraka','Ochaco Uraraka','My Hero Academia','medium'),
  ('gon-freecss','Gon Freecss','Hunter x Hunter','easy'), ('killua-zoldyck','Killua Zoldyck','Hunter x Hunter','easy'), ('kurapika','Kurapika','Hunter x Hunter','medium'), ('hisoka-morow','Hisoka Morow','Hunter x Hunter','medium'), ('leorio-paradinight','Leorio Paradinight','Hunter x Hunter','hard'),
  ('saitama','Saitama','One Punch Man','easy'), ('genos','Genos','One Punch Man','easy'), ('tatsumaki','Tatsumaki','One Punch Man','medium'),
  ('denji','Denji','Chainsaw Man','easy'), ('power','Power','Chainsaw Man','easy'), ('makima','Makima','Chainsaw Man','medium'), ('aki-hayakawa','Aki Hayakawa','Chainsaw Man','medium'),
  ('asta','Asta','Black Clover','easy'), ('yuno','Yuno','Black Clover','medium'), ('noelle-silva','Noelle Silva','Black Clover','medium'), ('yami-sukehiro','Yami Sukehiro','Black Clover','medium'),
  ('ken-kaneki','Ken Kaneki','Tokyo Ghoul','medium'), ('touka-kirishima','Touka Kirishima','Tokyo Ghoul','hard'), ('juuzou-suzuya','Juuzou Suzuya','Tokyo Ghoul','hard'),
  ('asuna-yuuki','Asuna Yuuki','Sword Art Online','easy'), ('kirito','Kirito','Sword Art Online','easy'), ('sinon','Sinon','Sword Art Online','medium'),
  ('natsu-dragneel','Natsu Dragneel','Fairy Tail','easy'), ('lucy-heartfilia','Lucy Heartfilia','Fairy Tail','medium'), ('erza-scarlet','Erza Scarlet','Fairy Tail','medium'),
  ('edward-elric','Edward Elric','Fullmetal Alchemist','easy'), ('alphonse-elric','Alphonse Elric','Fullmetal Alchemist','medium'), ('roy-mustang','Roy Mustang','Fullmetal Alchemist','medium'),
  ('jotaro-kujo','Jotaro Kujo','JoJo''s Bizarre Adventure','medium'), ('joseph-joestar','Joseph Joestar','JoJo''s Bizarre Adventure','medium'), ('giorno-giovanna','Giorno Giovanna','JoJo''s Bizarre Adventure','hard'),
  ('thorfinn','Thorfinn','Vinland Saga','medium'), ('askeladd','Askeladd','Vinland Saga','hard'),
  ('sung-jinwoo','Sung Jinwoo','Solo Leveling','easy'), ('cha-hae-in','Cha Hae-In','Solo Leveling','medium'),
  ('yoichi-isagi','Yoichi Isagi','Blue Lock','medium'), ('rin-itoshi','Rin Itoshi','Blue Lock','hard'),
  ('shoyo-hinata','Shoyo Hinata','Haikyu!!','easy'), ('tobio-kageyama','Tobio Kageyama','Haikyu!!','medium'),
  ('anya-forger','Anya Forger','Spy x Family','easy'), ('loid-forger','Loid Forger','Spy x Family','easy'), ('yor-forger','Yor Forger','Spy x Family','easy'),
  ('shigeo-kageyama','Shigeo Kageyama','Mob Psycho 100','medium'), ('reigen-arataka','Reigen Arataka','Mob Psycho 100','easy'),
  ('lelouch-lamperouge','Lelouch Lamperouge','Code Geass','medium'), ('suzaku-kururugi','Suzaku Kururugi','Code Geass','hard'),
  ('momo-ayase','Momo Ayase','Dandadan','medium'), ('ken-takakura','Ken Takakura','Dandadan','medium'),
  ('frieren','Frieren','Frieren: Beyond Journey''s End','easy'), ('fern','Fern','Frieren: Beyond Journey''s End','medium'), ('stark','Stark','Frieren: Beyond Journey''s End','medium')
on conflict (id) do update set name = excluded.name, anime = excluded.anime, difficulty = excluded.difficulty;

create table if not exists public.anime_imposter_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z2-9]{5}$'),
  host_id uuid not null references auth.users(id),
  max_players smallint not null check (max_players in (3, 4)),
  allow_final_guess boolean not null default true,
  phase text not null default 'lobby' check (phase in ('lobby', 'role_reveal', 'clue_phase', 'voting', 'revote', 'vote_results', 'final_guess', 'game_over')),
  state jsonb not null default '{"round":0,"clues":[],"vote_stage":0,"vote_requests":[],"vote_results":[],"turn_order":[],"tied_player_ids":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.anime_imposter_players (
  room_id uuid not null references public.anime_imposter_rooms(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 16),
  seat smallint not null check (seat between 1 and 4),
  ready boolean not null default false,
  last_seen_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  primary key (room_id, player_id),
  unique (room_id, seat)
);
create unique index if not exists anime_imposter_players_room_nickname_unique
  on public.anime_imposter_players (room_id, lower(nickname));

create table if not exists public.anime_imposter_secrets (
  room_id uuid not null references public.anime_imposter_rooms(id) on delete cascade,
  round_number integer not null,
  player_id uuid not null references auth.users(id) on delete cascade,
  player_nickname text,
  role text not null check (role in ('player', 'impostor')),
  character_id text not null references public.anime_imposter_characters(id),
  character_name text not null,
  anime_name text not null,
  primary key (room_id, round_number, player_id)
);

create table if not exists public.anime_imposter_votes (
  room_id uuid not null references public.anime_imposter_rooms(id) on delete cascade,
  round_number integer not null,
  vote_stage integer not null,
  voter_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (room_id, round_number, vote_stage, voter_id)
);

create table if not exists public.anime_imposter_queue (
  player_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 16),
  allow_final_guess boolean not null default true,
  room_id uuid references public.anime_imposter_rooms(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
alter table public.anime_imposter_secrets add column if not exists player_nickname text;
alter table public.anime_imposter_queue add column if not exists last_seen_at timestamptz not null default now();
update public.anime_imposter_secrets s set player_nickname = p.nickname
  from public.anime_imposter_players p
  where s.room_id = p.room_id and s.player_id = p.player_id and s.player_nickname is null;

alter table public.anime_imposter_rooms enable row level security;
alter table public.anime_imposter_players enable row level security;
alter table public.anime_imposter_secrets enable row level security;
alter table public.anime_imposter_votes enable row level security;
alter table public.anime_imposter_queue enable row level security;
alter table public.anime_imposter_characters enable row level security;

create or replace function public.anime_imposter_is_room_member(p_room_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.anime_imposter_players p where p.room_id = p_room_id and p.player_id = auth.uid());
$$;

drop policy if exists "imposter room members can read room" on public.anime_imposter_rooms;
create policy "imposter room members can read room" on public.anime_imposter_rooms
for select to authenticated using (public.anime_imposter_is_room_member(id));
drop policy if exists "imposter room members can read players" on public.anime_imposter_players;
create policy "imposter room members can read players" on public.anime_imposter_players
for select to authenticated using (public.anime_imposter_is_room_member(room_id));
drop policy if exists "imposter players can read own queue" on public.anime_imposter_queue;
create policy "imposter players can read own queue" on public.anime_imposter_queue
for select to authenticated using (player_id = auth.uid());

revoke all on public.anime_imposter_rooms, public.anime_imposter_players, public.anime_imposter_secrets,
  public.anime_imposter_votes, public.anime_imposter_queue, public.anime_imposter_characters from public, anon, authenticated;
grant select on public.anime_imposter_rooms, public.anime_imposter_players, public.anime_imposter_queue to authenticated;
grant usage on schema public to authenticated;
revoke all on function public.anime_imposter_is_room_member(uuid) from public, anon;
grant execute on function public.anime_imposter_is_room_member(uuid) to authenticated;

create or replace function public.anime_imposter_create(p_nickname text, p_max_players integer, p_allow_final_guess boolean default true)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  v_name text := regexp_replace(trim(p_nickname), '\s+', ' ', 'g');
  v_id uuid := auth.uid();
  v_code text;
  v_room public.anime_imposter_rooms%rowtype;
begin
  if v_id is null then raise exception using message = 'SESSION EXPIRED'; end if;
  if coalesce(v_name, '') !~ '^[A-Za-z0-9_ -]{2,16}$' then raise exception using message = 'INVALID NICKNAME'; end if;
  if coalesce(p_max_players, 0) not in (3, 4) then raise exception using message = 'INVALID ROOM CAPACITY'; end if;
  loop
    v_code := '';
    for i in 1..5 loop
      v_code := v_code || substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', get_byte(gen_random_bytes(1), 0) % 32 + 1, 1);
    end loop;
    exit when not exists (select 1 from anime_imposter_rooms where code = v_code);
  end loop;
  insert into anime_imposter_rooms (code, host_id, max_players, allow_final_guess)
    values (v_code, v_id, p_max_players, coalesce(p_allow_final_guess, true)) returning * into v_room;
  insert into anime_imposter_players (room_id, player_id, nickname, seat) values (v_room.id, v_id, v_name, 1);
  return jsonb_build_object('room_id', v_room.id, 'code', v_code);
end;
$$;

create or replace function public.anime_imposter_join(p_code text, p_nickname text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid := auth.uid();
  v_name text := regexp_replace(trim(p_nickname), '\s+', ' ', 'g');
  v_room public.anime_imposter_rooms%rowtype;
  v_seat integer;
begin
  if v_id is null then raise exception using message = 'SESSION EXPIRED'; end if;
  if upper(trim(p_code)) !~ '^[A-Z2-9]{5}$' then raise exception using message = 'INVALID ROOM CODE'; end if;
  if coalesce(v_name, '') !~ '^[A-Za-z0-9_ -]{2,16}$' then raise exception using message = 'INVALID NICKNAME'; end if;
  select * into v_room from anime_imposter_rooms where code = upper(trim(p_code)) for update;
  if not found then raise exception using message = 'ROOM NOT FOUND'; end if;
  if v_room.phase <> 'lobby' then raise exception using message = 'GAME ALREADY STARTED'; end if;
  if exists (select 1 from anime_imposter_players where room_id = v_room.id and player_id = v_id) then return v_room.id; end if;
  if exists (select 1 from anime_imposter_players where room_id = v_room.id and lower(nickname) = lower(v_name)) then raise exception using message = 'NICKNAME ALREADY USED'; end if;
  select available.seat into v_seat
    from generate_series(1, v_room.max_players) as available(seat)
    where not exists (select 1 from anime_imposter_players p where p.room_id = v_room.id and p.seat = available.seat)
    order by available.seat limit 1;
  if v_seat is null or v_seat > v_room.max_players then raise exception using message = 'ROOM FULL'; end if;
  insert into anime_imposter_players (room_id, player_id, nickname, seat) values (v_room.id, v_id, v_name, v_seat);
  return v_room.id;
end;
$$;

create or replace function public.anime_imposter_matchmake(p_nickname text, p_allow_final_guess boolean default true)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid := auth.uid();
  v_name text := regexp_replace(trim(p_nickname), '\s+', ' ', 'g');
  v_existing uuid;
  v_ids uuid[];
  v_names text[];
  v_count integer;
  v_oldest timestamptz;
  v_room public.anime_imposter_rooms%rowtype;
  v_code text;
begin
  if v_id is null then raise exception using message = 'SESSION EXPIRED'; end if;
  if coalesce(v_name, '') !~ '^[A-Za-z0-9_ -]{2,16}$' then raise exception using message = 'INVALID NICKNAME'; end if;
  perform pg_advisory_xact_lock(hashtext('anime-imposter-matchmaking'));
  select room_id into v_existing from anime_imposter_queue where player_id = v_id;
  if v_existing is not null then return v_existing; end if;
  delete from anime_imposter_queue where room_id is null and last_seen_at < now() - interval '45 seconds';
  insert into anime_imposter_queue (player_id, nickname, allow_final_guess)
    values (v_id, v_name, coalesce(p_allow_final_guess, true))
    on conflict (player_id) do update set nickname = excluded.nickname, allow_final_guess = excluded.allow_final_guess, last_seen_at = now();
  select array_agg(q.player_id order by q.joined_at), array_agg(q.nickname order by q.joined_at), count(*), min(q.joined_at)
    into v_ids, v_names, v_count, v_oldest
    from (
      select player_id, nickname, joined_at from (
        select distinct on (lower(nickname)) player_id, nickname, joined_at
        from anime_imposter_queue where room_id is null and last_seen_at > now() - interval '45 seconds'
        order by lower(nickname), joined_at
      ) unique_names order by joined_at limit 4
    ) q;
  if v_count < 4 and (v_count < 3 or v_oldest > now() - interval '12 seconds') then return null; end if;
  loop
    v_code := '';
    for i in 1..5 loop
      v_code := v_code || substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', get_byte(gen_random_bytes(1), 0) % 32 + 1, 1);
    end loop;
    exit when not exists (select 1 from anime_imposter_rooms where code = v_code);
  end loop;
  insert into anime_imposter_rooms (code, host_id, max_players, allow_final_guess)
    values (v_code, v_ids[1], v_count, coalesce((select allow_final_guess from anime_imposter_queue where player_id = v_ids[1]), true))
    returning * into v_room;
  insert into anime_imposter_players (room_id, player_id, nickname, seat)
    select v_room.id, pair.player_id, pair.nickname, pair.ordinality::smallint
    from unnest(v_ids, v_names) with ordinality as pair(player_id, nickname, ordinality);
  update anime_imposter_queue set room_id = v_room.id where player_id = any(v_ids);
  return v_room.id;
end;
$$;

create or replace function public.anime_imposter_queue_count()
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  v_room uuid;
  v_count integer;
begin
  if auth.uid() is null then raise exception using message = 'SESSION EXPIRED'; end if;
  select room_id into v_room from anime_imposter_queue where player_id = auth.uid();
  if v_room is not null then
    select count(*) into v_count from anime_imposter_players where room_id = v_room;
  else
    select count(*) into v_count from (
      select distinct on (lower(nickname)) player_id
      from anime_imposter_queue where room_id is null and last_seen_at > now() - interval '45 seconds'
      order by lower(nickname), joined_at
    ) unique_names;
  end if;
  return jsonb_build_object('players_found', coalesce(v_count, 0));
end;
$$;

create or replace function public.anime_imposter_cancel_match()
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room uuid;
begin
  if auth.uid() is null then raise exception using message = 'SESSION EXPIRED'; end if;
  perform pg_advisory_xact_lock(hashtext('anime-imposter-matchmaking'));
  select room_id into v_room from anime_imposter_queue where player_id = auth.uid();
  if v_room is not null then raise exception using message = 'MATCH ALREADY FOUND'; end if;
  delete from anime_imposter_queue where player_id = auth.uid() and room_id is null;
end;
$$;

create or replace function public.anime_imposter_finalize_votes(p_room_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_state jsonb;
  v_round integer;
  v_stage integer;
  v_max_votes integer;
  v_tied uuid[];
  v_results jsonb;
  v_stage_results jsonb;
  v_target uuid;
begin
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found or v_room.phase not in ('voting', 'revote') then return; end if;
  if (select count(*) from anime_imposter_votes where room_id = p_room_id and round_number = (v_room.state->>'round')::integer and vote_stage = (v_room.state->>'vote_stage')::integer)
      < (select count(*) from anime_imposter_players where room_id = p_room_id) then return; end if;
  v_state := v_room.state;
  v_round := (v_state->>'round')::integer;
  v_stage := coalesce((v_state->>'vote_stage')::integer, 0);
  select max(vote_count) into v_max_votes from (
    select count(*) as vote_count from anime_imposter_votes where room_id = p_room_id and round_number = v_round and vote_stage = v_stage group by target_id
  ) scores;
  select array_agg(target_id) into v_tied from (
    select target_id from anime_imposter_votes where room_id = p_room_id and round_number = v_round and vote_stage = v_stage
    group by target_id having count(*) = v_max_votes
  ) leaders;
  select jsonb_agg(jsonb_build_object('voter', vp.nickname, 'target', tp.nickname) order by vp.seat) into v_stage_results
    from anime_imposter_votes v
    join anime_imposter_players vp on vp.room_id = v.room_id and vp.player_id = v.voter_id
    join anime_imposter_players tp on tp.room_id = v.room_id and tp.player_id = v.target_id
    where v.room_id = p_room_id and v.round_number = v_round and v.vote_stage = v_stage;
  v_results := coalesce(v_state->'vote_results', '[]'::jsonb) || coalesce(v_stage_results, '[]'::jsonb);
  v_target := case when cardinality(v_tied) = 1 then v_tied[1] else null end;
  update anime_imposter_rooms set phase = 'vote_results', state = v_state || jsonb_build_object(
    'vote_results', v_results, 'tied_player_ids', coalesce(to_jsonb(v_tied), '[]'::jsonb),
    'pending_vote', jsonb_build_object('target_id', v_target, 'is_tie', cardinality(v_tied) > 1)
  ) where id = p_room_id;
end;
$$;

create or replace function public.anime_imposter_tick(p_room_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_count integer;
  v_next_index integer;
  v_order uuid[];
  v_next uuid;
  v_state jsonb;
  v_current uuid;
  v_order_changed boolean;
begin
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found or not exists (select 1 from anime_imposter_players where room_id = p_room_id and player_id = auth.uid()) then
    raise exception using message = 'ROOM NOT FOUND';
  end if;
  update anime_imposter_players set last_seen_at = now()
    where room_id = p_room_id and player_id = auth.uid() and last_seen_at < now() - interval '20 seconds';
  delete from anime_imposter_players where room_id = p_room_id and player_id <> auth.uid() and last_seen_at < now() - interval '75 seconds';
  delete from anime_imposter_votes where room_id = p_room_id
    and (voter_id not in (select player_id from anime_imposter_players where room_id = p_room_id)
      or target_id not in (select player_id from anime_imposter_players where room_id = p_room_id));
  select count(*) into v_count from anime_imposter_players where room_id = p_room_id;
  select * into v_room from anime_imposter_rooms where id = p_room_id;
  if v_room.host_id not in (select player_id from anime_imposter_players where room_id = p_room_id) then
    update anime_imposter_rooms set host_id = (select player_id from anime_imposter_players where room_id = p_room_id order by seat limit 1) where id = p_room_id returning * into v_room;
  end if;
  v_state := v_room.state;
  if v_count < 3 and v_room.phase not in ('lobby', 'game_over') then
    update anime_imposter_rooms set phase = 'game_over',
      state = v_state || jsonb_build_object('winner', 'none', 'result_message', 'ROUND ENDED // NOT ENOUGH PLAYERS REMAINED')
      where id = p_room_id;
    return;
  end if;
  if v_room.phase not in ('lobby', 'game_over') and not exists (
    select 1 from anime_imposter_secrets s join anime_imposter_players p on p.player_id = s.player_id and p.room_id = s.room_id
    where s.room_id = p_room_id and s.round_number = (v_state->>'round')::integer and s.role = 'impostor'
  ) then
    update anime_imposter_rooms set phase = 'game_over',
      state = v_state || jsonb_build_object('winner', 'players', 'result_message', 'IMPOSTOR LEFT THE ROOM // PLAYERS WIN')
      where id = p_room_id;
    return;
  end if;
  if v_room.phase = 'role_reveal' and not exists (select 1 from anime_imposter_players where room_id = p_room_id and not ready) then
    select array_agg(order_entry.player_id order by order_entry.ordinality) into v_order
      from (
        select value::uuid as player_id, ordinality
        from jsonb_array_elements_text(v_state->'turn_order') with ordinality as order_item(value, ordinality)
      ) order_entry
      where exists (select 1 from anime_imposter_players p where p.room_id = p_room_id and p.player_id = order_entry.player_id);
    v_state := v_state || jsonb_build_object('turn_order', to_jsonb(v_order));
    update anime_imposter_rooms set phase = 'clue_phase', state = v_state || jsonb_build_object(
      'current_turn', v_order[1], 'turn_index', 0, 'turn_started_at', now(),
      'turn_ends_at', now() + interval '20 seconds', 'game_started_at', now(),
      'game_ends_at', now() + interval '5 minutes'
    ) where id = p_room_id;
    return;
  end if;
  if v_room.phase in ('voting', 'revote') then
    perform anime_imposter_finalize_votes(p_room_id);
    return;
  end if;
  if v_room.phase = 'clue_phase' then
    if (v_state->>'game_ends_at')::timestamptz <= now() then
      update anime_imposter_rooms set phase = 'voting', state = v_state || jsonb_build_object('vote_stage', 0, 'tied_player_ids', '[]'::jsonb) where id = p_room_id;
    else
      v_current := (v_state->>'current_turn')::uuid;
      select array_agg(order_entry.player_id order by order_entry.ordinality) into v_order
        from (
          select value::uuid as player_id, ordinality
          from jsonb_array_elements_text(v_state->'turn_order') with ordinality as order_item(value, ordinality)
        ) order_entry
        where exists (select 1 from anime_imposter_players p where p.room_id = p_room_id and p.player_id = order_entry.player_id);
      v_order_changed := cardinality(v_order) <> jsonb_array_length(v_state->'turn_order');
      if v_order_changed and (v_current is null or not (v_current = any(v_order))) then
        v_current := v_order[1];
        v_state := v_state || jsonb_build_object('turn_order', to_jsonb(v_order), 'turn_index', 0,
          'current_turn', v_current, 'turn_started_at', now(),
          'turn_ends_at', least(now() + interval '20 seconds', (v_state->>'game_ends_at')::timestamptz));
        update anime_imposter_rooms set state = v_state where id = p_room_id;
      elsif v_order_changed then
        v_next_index := array_position(v_order, v_current) - 1;
        v_state := v_state || jsonb_build_object('turn_order', to_jsonb(v_order), 'turn_index', v_next_index);
        update anime_imposter_rooms set state = v_state where id = p_room_id;
      end if;
      if (v_state->>'turn_ends_at')::timestamptz <= now() then
        v_next_index := coalesce((v_state->>'turn_index')::integer, 0) + 1;
        v_next := v_order[((v_next_index % cardinality(v_order)) + 1)];
        update anime_imposter_rooms set state = v_state || jsonb_build_object(
          'turn_index', v_next_index % cardinality(v_order),
          'current_turn', v_next,
          'turn_started_at', now(),
          'turn_ends_at', least(now() + interval '20 seconds', (v_state->>'game_ends_at')::timestamptz)
        ) where id = p_room_id;
      end if;
    end if;
  end if;
end;
$$;

create or replace function public.anime_imposter_state(p_room_id uuid)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_me uuid := auth.uid();
  v_round integer;
  v_stage integer;
  v_votes integer;
  v_vote uuid;
  v_secret anime_imposter_secrets%rowtype;
  v_solution anime_imposter_secrets%rowtype;
  v_impostor_name text;
  v_players jsonb;
begin
  if v_me is null then raise exception using message = 'SESSION EXPIRED'; end if;
  perform anime_imposter_tick(p_room_id);
  select * into v_room from anime_imposter_rooms where id = p_room_id;
  if not found then raise exception using message = 'ROOM NOT FOUND'; end if;
  v_round := coalesce((v_room.state->>'round')::integer, 0);
  v_stage := coalesce((v_room.state->>'vote_stage')::integer, 0);
  select jsonb_agg(jsonb_build_object(
    'id', p.player_id, 'nickname', p.nickname, 'seat', p.seat, 'ready', p.ready,
    'connected', p.last_seen_at > now() - interval '75 seconds', 'is_host', p.player_id = v_room.host_id
  ) order by p.seat) into v_players from anime_imposter_players p where p.room_id = p_room_id;
  select count(*) into v_votes from anime_imposter_votes where room_id = p_room_id and round_number = v_round and vote_stage = v_stage;
  select target_id into v_vote from anime_imposter_votes where room_id = p_room_id and round_number = v_round and vote_stage = v_stage and voter_id = v_me;
  if v_room.phase <> 'lobby' then
    select * into v_secret from anime_imposter_secrets where room_id = p_room_id and round_number = v_round and player_id = v_me;
  end if;
  if v_room.phase = 'game_over' then
    select * into v_solution from anime_imposter_secrets where room_id = p_room_id and round_number = v_round limit 1;
    select player_nickname into v_impostor_name from anime_imposter_secrets where room_id = p_room_id and round_number = v_round and role = 'impostor';
  end if;
  delete from anime_imposter_queue where player_id = v_me and room_id = p_room_id;
  return jsonb_build_object(
    'room', jsonb_build_object('id', v_room.id, 'code', v_room.code, 'host_id', v_room.host_id, 'max_players', v_room.max_players, 'allow_final_guess', v_room.allow_final_guess, 'phase', v_room.phase),
    'players', coalesce(v_players, '[]'::jsonb),
    'state', v_room.state || jsonb_build_object('phase', v_room.phase, 'votes_cast', v_votes, 'vote_total', (select count(*) from anime_imposter_players where room_id = p_room_id), 'vote_request_count', jsonb_array_length(coalesce(v_room.state->'vote_requests', '[]'::jsonb))),
    'my_role', v_secret.role,
    'my_character', case when v_secret.role = 'player' then jsonb_build_object('name', v_secret.character_name, 'anime', v_secret.anime_name) else null end,
    'revealed_character', case when v_room.phase = 'game_over' then jsonb_build_object('name', v_solution.character_name, 'anime', v_solution.anime_name) else null end,
    'impostor_name', case when v_room.phase = 'game_over' then v_impostor_name else null end,
    'my_vote', v_vote,
    'server_now', now()
  );
end;
$$;

create or replace function public.anime_imposter_start(p_room_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_ids uuid[];
  v_impostor uuid;
  v_character anime_imposter_characters%rowtype;
  v_round integer;
begin
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found then raise exception using message = 'ROOM NOT FOUND'; end if;
  if v_room.host_id <> auth.uid() then raise exception using message = 'ONLY THE HOST CAN START'; end if;
  if v_room.phase <> 'lobby' then raise exception using message = 'GAME ALREADY STARTED'; end if;
  if (select count(*) from anime_imposter_players where room_id = p_room_id) < 3 then raise exception using message = 'NOT ENOUGH PLAYERS'; end if;
  select array_agg(player_id order by random()) into v_ids from anime_imposter_players where room_id = p_room_id;
  v_impostor := v_ids[1];
  select * into v_character from anime_imposter_characters c
    where not exists (
      select 1 from (
        select character_id from (
          select distinct on (round_number) round_number, character_id
          from anime_imposter_secrets where room_id = p_room_id order by round_number desc
        ) recent_rounds order by round_number desc limit 3
      ) recent where recent.character_id = c.id
    )
    order by random() limit 1;
  if not found then select * into v_character from anime_imposter_characters order by random() limit 1; end if;
  v_round := coalesce((v_room.state->>'round')::integer, 0) + 1;
  delete from anime_imposter_votes where room_id = p_room_id;
  insert into anime_imposter_secrets (room_id, round_number, player_id, player_nickname, role, character_id, character_name, anime_name)
    select p_room_id, v_round, player_id, nickname, case when player_id = v_impostor then 'impostor' else 'player' end,
      v_character.id, v_character.name, v_character.anime from anime_imposter_players where room_id = p_room_id;
  update anime_imposter_players set ready = false where room_id = p_room_id;
  update anime_imposter_rooms set phase = 'role_reveal', state = jsonb_build_object(
    'round', v_round, 'clues', '[]'::jsonb, 'turn_order', to_jsonb(v_ids), 'turn_index', 0,
    'current_turn', null, 'turn_started_at', null, 'turn_ends_at', null, 'game_started_at', null,
    'game_ends_at', null, 'vote_stage', 0, 'vote_requests', '[]'::jsonb, 'vote_results', '[]'::jsonb,
    'tied_player_ids', '[]'::jsonb, 'winner', null, 'result_message', null
  ) where id = p_room_id;
end;
$$;

create or replace function public.anime_imposter_ready(p_room_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_state jsonb;
begin
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found or not exists (select 1 from anime_imposter_players where room_id = p_room_id and player_id = auth.uid()) then raise exception using message = 'ROOM NOT FOUND'; end if;
  if v_room.phase <> 'role_reveal' then raise exception using message = 'ACTION NOT AVAILABLE'; end if;
  update anime_imposter_players set ready = true, last_seen_at = now() where room_id = p_room_id and player_id = auth.uid();
  if not exists (select 1 from anime_imposter_players where room_id = p_room_id and not ready) then
    v_state := v_room.state;
    update anime_imposter_rooms set phase = 'clue_phase', state = v_state || jsonb_build_object(
      'current_turn', (v_state->'turn_order'->>0)::uuid, 'turn_index', 0,
      'turn_started_at', now(), 'turn_ends_at', now() + interval '20 seconds',
      'game_started_at', now(), 'game_ends_at', now() + interval '5 minutes'
    ) where id = p_room_id;
  end if;
end;
$$;

create or replace function public.anime_imposter_submit_clue(p_room_id uuid, p_word text)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_state jsonb;
  v_word text := trim(p_word);
  v_order uuid[];
  v_next_index integer;
begin
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found or not exists (select 1 from anime_imposter_players where room_id = p_room_id and player_id = auth.uid()) then raise exception using message = 'ROOM NOT FOUND'; end if;
  v_state := v_room.state;
  if v_room.phase <> 'clue_phase' then raise exception using message = 'CLUE PHASE HAS ENDED'; end if;
  if v_state->>'current_turn' <> auth.uid()::text then raise exception using message = 'WAIT FOR YOUR TURN'; end if;
  if (v_state->>'turn_ends_at')::timestamptz <= now() or (v_state->>'game_ends_at')::timestamptz <= now() then raise exception using message = 'YOUR TURN HAS EXPIRED'; end if;
  if coalesce(v_word, '') !~ '^[[:alnum:]]{1,24}$' then raise exception using message = 'ENTER ONE WORD (1–24 LETTERS OR NUMBERS)'; end if;
  v_state := jsonb_set(v_state, '{clues}', coalesce(v_state->'clues', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
    'player_id', auth.uid(), 'nickname', (select nickname from anime_imposter_players where room_id = p_room_id and player_id = auth.uid()),
    'word', v_word, 'created_at', now()
  )));
  v_order := array(select jsonb_array_elements_text(v_state->'turn_order')::uuid);
  v_next_index := (coalesce((v_state->>'turn_index')::integer, 0) + 1) % cardinality(v_order);
  v_state := v_state || jsonb_build_object('turn_index', v_next_index, 'current_turn', v_order[v_next_index + 1],
    'turn_started_at', now(), 'turn_ends_at', least(now() + interval '20 seconds', (v_state->>'game_ends_at')::timestamptz));
  update anime_imposter_rooms set state = v_state where id = p_room_id;
end;
$$;

create or replace function public.anime_imposter_request_vote(p_room_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_state jsonb;
  v_requests jsonb;
  v_total integer;
begin
  perform anime_imposter_tick(p_room_id);
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found or not exists (select 1 from anime_imposter_players where room_id = p_room_id and player_id = auth.uid()) then raise exception using message = 'ROOM NOT FOUND'; end if;
  if v_room.phase <> 'clue_phase' then raise exception using message = 'VOTE REQUEST IS CLOSED'; end if;
  v_state := v_room.state;
  v_requests := coalesce(v_state->'vote_requests', '[]'::jsonb);
  if v_requests @> jsonb_build_array(auth.uid()::text) then raise exception using message = 'VOTE ALREADY REQUESTED'; end if;
  v_requests := v_requests || jsonb_build_array(auth.uid()::text);
  select count(*) into v_total from anime_imposter_players where room_id = p_room_id;
  v_state := jsonb_set(v_state, '{vote_requests}', v_requests);
  if jsonb_array_length(v_requests) >= floor(v_total / 2.0)::integer + 1 then
    update anime_imposter_rooms set phase = 'voting', state = v_state || jsonb_build_object('vote_stage', 0, 'tied_player_ids', '[]'::jsonb) where id = p_room_id;
  else update anime_imposter_rooms set state = v_state where id = p_room_id;
  end if;
end;
$$;

create or replace function public.anime_imposter_vote(p_room_id uuid, p_target uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_state jsonb;
  v_round integer;
  v_stage integer;
  v_total integer;
  v_cast integer;
begin
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found or not exists (select 1 from anime_imposter_players where room_id = p_room_id and player_id = auth.uid()) then raise exception using message = 'ROOM NOT FOUND'; end if;
  if v_room.phase not in ('voting', 'revote') then raise exception using message = 'VOTING IS NOT OPEN'; end if;
  if not exists (select 1 from anime_imposter_players where room_id = p_room_id and player_id = p_target) then raise exception using message = 'INVALID VOTE'; end if;
  v_state := v_room.state;
  if v_room.phase = 'revote' and not (coalesce(v_state->'tied_player_ids', '[]'::jsonb) @> jsonb_build_array(p_target::text)) then raise exception using message = 'CHOOSE ONE OF THE TIED PLAYERS'; end if;
  v_round := (v_state->>'round')::integer;
  v_stage := coalesce((v_state->>'vote_stage')::integer, 0);
  if exists (select 1 from anime_imposter_votes where room_id = p_room_id and round_number = v_round and vote_stage = v_stage and voter_id = auth.uid()) then
    raise exception using message = 'VOTE ALREADY LOCKED';
  end if;
  insert into anime_imposter_votes (room_id, round_number, vote_stage, voter_id, target_id)
    values (p_room_id, v_round, v_stage, auth.uid(), p_target);
  select count(*) into v_total from anime_imposter_players where room_id = p_room_id;
  select count(*) into v_cast from anime_imposter_votes where room_id = p_room_id and round_number = v_round and vote_stage = v_stage;
  if v_cast < v_total then return; end if;
  perform anime_imposter_finalize_votes(p_room_id);
end;
$$;

create or replace function public.anime_imposter_resolve_votes(p_room_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_state jsonb;
  v_round integer;
  v_tied uuid[];
  v_target uuid;
  v_impostor uuid;
begin
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found or not exists (select 1 from anime_imposter_players where room_id = p_room_id and player_id = auth.uid()) then raise exception using message = 'ROOM NOT FOUND'; end if;
  if v_room.phase <> 'vote_results' then return; end if;
  v_state := v_room.state;
  v_round := (v_state->>'round')::integer;
  select array_agg(value::text::uuid) into v_tied from jsonb_array_elements_text(v_state->'tied_player_ids');
  if coalesce((v_state->'pending_vote'->>'is_tie')::boolean, false) then
    if (v_state->>'vote_stage')::integer >= 1 then
      if v_room.allow_final_guess then
        update anime_imposter_rooms set phase = 'final_guess', state = v_state || jsonb_build_object(
          'tied_player_ids', '[]'::jsonb, 'winner', null,
          'result_message', 'REVOTE TIED // IMPOSTOR SURVIVES // FINAL CHANCE'
        ) where id = p_room_id;
      else
        update anime_imposter_rooms set phase = 'game_over', state = v_state || jsonb_build_object(
          'tied_player_ids', '[]'::jsonb, 'winner', 'impostor',
          'result_message', 'REVOTE TIED // IMPOSTOR SURVIVES'
        ) where id = p_room_id;
      end if;
      return;
    end if;
    update anime_imposter_rooms set phase = 'revote', state = v_state || jsonb_build_object(
      'vote_stage', (v_state->>'vote_stage')::integer + 1, 'tied_player_ids', to_jsonb(v_tied), 'pending_vote', null
    ) where id = p_room_id;
    return;
  end if;
  v_target := (v_state->'pending_vote'->>'target_id')::uuid;
  select player_id into v_impostor from anime_imposter_secrets where room_id = p_room_id and round_number = v_round and role = 'impostor';
  if v_target = v_impostor then
    update anime_imposter_rooms set phase = 'game_over', state = v_state || jsonb_build_object(
      'tied_player_ids', '[]'::jsonb, 'winner', 'players', 'result_message', 'IMPOSTOR CAUGHT // PLAYERS WIN'
    ) where id = p_room_id;
  elsif v_room.allow_final_guess then
    update anime_imposter_rooms set phase = 'final_guess', state = v_state || jsonb_build_object(
      'tied_player_ids', '[]'::jsonb, 'winner', null, 'result_message', 'IMPOSTOR ESCAPED THE VOTE // FINAL CHANCE'
    ) where id = p_room_id;
  else
    update anime_imposter_rooms set phase = 'game_over', state = v_state || jsonb_build_object(
      'tied_player_ids', '[]'::jsonb, 'winner', 'impostor', 'result_message', 'IMPOSTOR ESCAPED // IMPOSTOR WINS'
    ) where id = p_room_id;
  end if;
end;
$$;

create or replace function public.anime_imposter_guess(p_room_id uuid, p_guess text)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_round integer;
  v_secret anime_imposter_secrets%rowtype;
begin
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found or v_room.phase <> 'final_guess' then raise exception using message = 'FINAL GUESS IS NOT OPEN'; end if;
  v_round := (v_room.state->>'round')::integer;
  select * into v_secret from anime_imposter_secrets where room_id = p_room_id and round_number = v_round and player_id = auth.uid() and role = 'impostor';
  if not found then raise exception using message = 'ONLY THE IMPOSTOR CAN GUESS'; end if;
  if coalesce(length(trim(p_guess)), 0) not between 1 and 80 then raise exception using message = 'ENTER A CHARACTER NAME'; end if;
  if lower(trim(p_guess)) = lower(v_secret.character_name) then
    update anime_imposter_rooms set phase = 'game_over', state = state || jsonb_build_object('winner', 'impostor', 'result_message', 'CORRECT GUESS // IMPOSTOR WINS') where id = p_room_id;
  else
    update anime_imposter_rooms set phase = 'game_over', state = state || jsonb_build_object('winner', 'players', 'result_message', 'WRONG GUESS // PLAYERS WIN') where id = p_room_id;
  end if;
end;
$$;

create or replace function public.anime_imposter_again(p_room_id uuid, p_action text default 'play')
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
begin
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found or not exists (select 1 from anime_imposter_players where room_id = p_room_id and player_id = auth.uid()) then raise exception using message = 'ROOM NOT FOUND'; end if;
  if p_action = 'lobby' then
    if v_room.host_id <> auth.uid() then raise exception using message = 'ONLY THE HOST CAN RETURN TO LOBBY'; end if;
    if v_room.phase <> 'game_over' then raise exception using message = 'ACTION NOT AVAILABLE'; end if;
    delete from anime_imposter_votes where room_id = p_room_id;
    update anime_imposter_players set ready = false where room_id = p_room_id;
    update anime_imposter_rooms set phase = 'lobby', state = jsonb_build_object(
      'round', coalesce((v_room.state->>'round')::integer, 0), 'clues', '[]'::jsonb,
      'vote_stage', 0, 'vote_requests', '[]'::jsonb, 'vote_results', '[]'::jsonb,
      'turn_order', '[]'::jsonb, 'tied_player_ids', '[]'::jsonb
    ) where id = p_room_id;
  elsif p_action = 'play' then
    if v_room.host_id <> auth.uid() then raise exception using message = 'ONLY THE HOST CAN START'; end if;
    if v_room.phase <> 'game_over' then raise exception using message = 'ACTION NOT AVAILABLE'; end if;
    delete from anime_imposter_votes where room_id = p_room_id;
    update anime_imposter_players set ready = false where room_id = p_room_id;
    update anime_imposter_rooms set phase = 'lobby', state = jsonb_build_object(
      'round', coalesce((v_room.state->>'round')::integer, 0), 'clues', '[]'::jsonb,
      'vote_stage', 0, 'vote_requests', '[]'::jsonb, 'vote_results', '[]'::jsonb,
      'turn_order', '[]'::jsonb, 'tied_player_ids', '[]'::jsonb
    ) where id = p_room_id;
    perform anime_imposter_start(p_room_id);
  else raise exception using message = 'ACTION NOT AVAILABLE';
  end if;
end;
$$;

create or replace function public.anime_imposter_leave(p_room_id uuid, p_target uuid default null)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_room anime_imposter_rooms%rowtype;
  v_leaving uuid := coalesce(p_target, auth.uid());
  v_left integer;
  v_round integer;
begin
  select * into v_room from anime_imposter_rooms where id = p_room_id for update;
  if not found then return; end if;
  if p_target is not null and (v_room.host_id <> auth.uid() or p_target = auth.uid()) then raise exception using message = 'ONLY THE HOST CAN KICK A PLAYER'; end if;
  if not exists (select 1 from anime_imposter_players where room_id = p_room_id and player_id = auth.uid()) then raise exception using message = 'ROOM NOT FOUND'; end if;
  delete from anime_imposter_players where room_id = p_room_id and player_id = v_leaving;
  delete from anime_imposter_queue where player_id = v_leaving;
  delete from anime_imposter_votes where room_id = p_room_id and (voter_id = v_leaving or target_id = v_leaving);
  select count(*) into v_left from anime_imposter_players where room_id = p_room_id;
  if v_left = 0 then delete from anime_imposter_rooms where id = p_room_id; return; end if;
  if v_room.host_id = v_leaving then
    update anime_imposter_rooms set host_id = (select player_id from anime_imposter_players where room_id = p_room_id order by seat limit 1) where id = p_room_id;
  end if;
  if v_left < 3 and v_room.phase not in ('lobby', 'game_over') then
    update anime_imposter_rooms set phase = 'game_over', state = state || jsonb_build_object('winner', 'none', 'result_message', 'ROUND ENDED // NOT ENOUGH PLAYERS REMAINED') where id = p_room_id;
  elsif v_room.phase not in ('lobby', 'game_over') then
    v_round := coalesce((v_room.state->>'round')::integer, 0);
    if exists (select 1 from anime_imposter_secrets where room_id = p_room_id and round_number = v_round and player_id = v_leaving and role = 'impostor') then
      update anime_imposter_rooms set phase = 'game_over', state = state || jsonb_build_object('winner', 'players', 'result_message', 'IMPOSTOR LEFT THE ROOM // PLAYERS WIN') where id = p_room_id;
    end if;
  end if;
end;
$$;

create or replace function public.anime_imposter_close(p_room_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from anime_imposter_rooms where id = p_room_id and host_id = auth.uid()) then raise exception using message = 'ONLY THE HOST CAN CLOSE THE ROOM'; end if;
  delete from anime_imposter_rooms where id = p_room_id;
end;
$$;

revoke all on function public.anime_imposter_create(text, integer, boolean) from public, anon;
revoke all on function public.anime_imposter_join(text, text) from public, anon;
revoke all on function public.anime_imposter_matchmake(text, boolean) from public, anon;
revoke all on function public.anime_imposter_cancel_match() from public, anon;
revoke all on function public.anime_imposter_queue_count() from public, anon;
revoke all on function public.anime_imposter_finalize_votes(uuid) from public, anon, authenticated;
revoke all on function public.anime_imposter_tick(uuid) from public, anon;
revoke all on function public.anime_imposter_state(uuid) from public, anon;
revoke all on function public.anime_imposter_start(uuid) from public, anon;
revoke all on function public.anime_imposter_ready(uuid) from public, anon;
revoke all on function public.anime_imposter_submit_clue(uuid, text) from public, anon;
revoke all on function public.anime_imposter_request_vote(uuid) from public, anon;
revoke all on function public.anime_imposter_vote(uuid, uuid) from public, anon;
revoke all on function public.anime_imposter_resolve_votes(uuid) from public, anon;
revoke all on function public.anime_imposter_guess(uuid, text) from public, anon;
revoke all on function public.anime_imposter_again(uuid, text) from public, anon;
revoke all on function public.anime_imposter_leave(uuid, uuid) from public, anon;
revoke all on function public.anime_imposter_close(uuid) from public, anon;
grant execute on function public.anime_imposter_create(text, integer, boolean) to authenticated;
grant execute on function public.anime_imposter_join(text, text) to authenticated;
grant execute on function public.anime_imposter_matchmake(text, boolean) to authenticated;
grant execute on function public.anime_imposter_cancel_match() to authenticated;
grant execute on function public.anime_imposter_queue_count() to authenticated;
grant execute on function public.anime_imposter_state(uuid) to authenticated;
grant execute on function public.anime_imposter_start(uuid) to authenticated;
grant execute on function public.anime_imposter_ready(uuid) to authenticated;
grant execute on function public.anime_imposter_submit_clue(uuid, text) to authenticated;
grant execute on function public.anime_imposter_request_vote(uuid) to authenticated;
grant execute on function public.anime_imposter_vote(uuid, uuid) to authenticated;
grant execute on function public.anime_imposter_resolve_votes(uuid) to authenticated;
grant execute on function public.anime_imposter_guess(uuid, text) to authenticated;
grant execute on function public.anime_imposter_again(uuid, text) to authenticated;
grant execute on function public.anime_imposter_leave(uuid, uuid) to authenticated;
grant execute on function public.anime_imposter_close(uuid) to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'anime_imposter_rooms') then
    alter publication supabase_realtime add table public.anime_imposter_rooms;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'anime_imposter_players') then
    alter publication supabase_realtime add table public.anime_imposter_players;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'anime_imposter_queue') then
    alter publication supabase_realtime add table public.anime_imposter_queue;
  end if;
end;
$$;
