-- ANIVIA STAK economy: wallets, ledger, catalog, inventory, atomic purchases.
-- Run this in the Supabase SQL editor. Enable Anonymous Auth (or email auth) first.
-- Balances can only change through the SECURITY DEFINER functions below.

create table if not exists public.stak_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.stak_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('purchase_pack', 'spend_item', 'grant', 'refund')),
  amount bigint not null,
  balance_after bigint not null,
  ref text,
  created_at timestamptz not null default now()
);
create index if not exists stak_transactions_user_idx on public.stak_transactions (user_id, created_at desc);

create table if not exists public.stak_orders (
  session_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  pack_id text not null,
  stak bigint not null,
  amount_cents integer not null,
  currency text not null default 'usd',
  created_at timestamptz not null default now()
);

create table if not exists public.stak_items (
  id text primary key,
  kind text not null check (kind in ('frame', 'badge', 'nickname', 'background')),
  name text not null,
  description text not null default '',
  price bigint not null check (price > 0),
  rarity text not null default 'common',
  active boolean not null default true
);

create table if not exists public.stak_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.stak_items(id),
  equipped boolean not null default false,
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.stak_wallets enable row level security;
alter table public.stak_transactions enable row level security;
alter table public.stak_orders enable row level security;
alter table public.stak_items enable row level security;
alter table public.stak_inventory enable row level security;

drop policy if exists "stak wallets own read" on public.stak_wallets;
create policy "stak wallets own read" on public.stak_wallets for select to authenticated using (user_id = auth.uid());
drop policy if exists "stak transactions own read" on public.stak_transactions;
create policy "stak transactions own read" on public.stak_transactions for select to authenticated using (user_id = auth.uid());
drop policy if exists "stak orders own read" on public.stak_orders;
create policy "stak orders own read" on public.stak_orders for select to authenticated using (user_id = auth.uid());
drop policy if exists "stak items public read" on public.stak_items;
create policy "stak items public read" on public.stak_items for select to anon, authenticated using (active);
drop policy if exists "stak inventory own read" on public.stak_inventory;
create policy "stak inventory own read" on public.stak_inventory for select to authenticated using (user_id = auth.uid());

revoke all on public.stak_wallets, public.stak_transactions, public.stak_orders, public.stak_items, public.stak_inventory from anon, authenticated;
grant select on public.stak_wallets, public.stak_transactions, public.stak_orders, public.stak_inventory to authenticated;
grant select on public.stak_items to anon, authenticated;

insert into public.stak_items (id, kind, name, description, price, rarity) values
  ('frame-neon',      'frame',      'NEON SIGNAL',   'Bright neon city-signal avatar border.',       250,  'common'),
  ('frame-sakura',    'frame',      'SAKURA GLOW',   'Soft pink petal glow around your avatar.',      400,  'rare'),
  ('frame-glitch',    'frame',      'GLITCH PIXEL',  'Animated glitch border with retro pixels.',     500,  'rare'),
  ('frame-gold',      'frame',      'CYBER GOLD',    'Solid gold arcade champion border.',            800,  'epic'),
  ('frame-flame',     'frame',      'FLAME AURA',    'Burning aura for true legends.',                1200, 'legendary'),
  ('badge-early',     'badge',      'EARLY PLAYER',  'Show you were here at the start.',              150,  'common'),
  ('badge-otaku',     'badge',      'OTAKU',         'For fans who never skip an opening.',           200,  'common'),
  ('badge-draft',     'badge',      'DRAFT KING',    'Rule the Anime Draft arena.',                   300,  'rare'),
  ('badge-hunter',    'badge',      'IMPOSTER HUNTER','Sniff out every Anime Imposter.',              300,  'rare'),
  ('badge-vip',       'badge',      'VIP',           'Golden VIP badge next to your name.',           1000, 'legendary'),
  ('nick-hacker',     'nickname',   'HACKER TAG',    'Glowing retro frame around your nickname.',     600,  'rare'),
  ('nick-neon',       'nickname',   'NEON TUBE',     'Pink neon tube nickname glow.',                 450,  'rare'),
  ('bg-cyber',        'background', 'CYBER CITY',    'Living neon city profile background.',          400,  'rare'),
  ('bg-grid',         'background', 'RETRO GRID',    'Black and purple synthwave grid background.',   350,  'common')
on conflict (id) do update set kind = excluded.kind, name = excluded.name, description = excluded.description, price = excluded.price, rarity = excluded.rarity;

-- Current state for the signed-in user (creates the wallet on first call).
create or replace function public.stak_get_state()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  bal bigint;
begin
  if uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  insert into public.stak_wallets (user_id) values (uid) on conflict (user_id) do nothing;
  select balance into bal from public.stak_wallets where user_id = uid;
  return jsonb_build_object(
    'balance', bal,
    'inventory', coalesce((select jsonb_agg(jsonb_build_object('item_id', item_id, 'equipped', equipped)) from public.stak_inventory where user_id = uid), '[]'::jsonb),
    'items', coalesce((select jsonb_agg(to_jsonb(i) - 'active' order by i.kind, i.price) from public.stak_items i where i.active), '[]'::jsonb)
  );
end;
$$;

-- Atomically spend STAK on an item.
create or replace function public.stak_purchase_item(p_item_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  itm public.stak_items%rowtype;
  bal bigint;
begin
  if uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select * into itm from public.stak_items where id = p_item_id and active;
  if not found then raise exception 'ITEM_NOT_FOUND'; end if;
  insert into public.stak_wallets (user_id) values (uid) on conflict (user_id) do nothing;
  select balance into bal from public.stak_wallets where user_id = uid for update;
  if exists (select 1 from public.stak_inventory where user_id = uid and item_id = itm.id) then raise exception 'ALREADY_OWNED'; end if;
  if bal < itm.price then raise exception 'NOT_ENOUGH_STAK'; end if;
  bal := bal - itm.price;
  update public.stak_wallets set balance = bal, updated_at = now() where user_id = uid;
  insert into public.stak_inventory (user_id, item_id) values (uid, itm.id);
  insert into public.stak_transactions (user_id, kind, amount, balance_after, ref) values (uid, 'spend_item', -itm.price, bal, itm.id);
  return public.stak_get_state();
end;
$$;

-- Equip or unequip an owned item. One frame / nickname style / background; up to 3 badges.
create or replace function public.stak_set_equipped(p_item_id text, p_equipped boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  k text;
begin
  if uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select i.kind into k from public.stak_inventory inv join public.stak_items i on i.id = inv.item_id where inv.user_id = uid and inv.item_id = p_item_id;
  if k is null then raise exception 'NOT_OWNED'; end if;
  if coalesce(p_equipped, false) then
    if k = 'badge' then
      if (select count(*) from public.stak_inventory inv join public.stak_items i on i.id = inv.item_id where inv.user_id = uid and inv.equipped and i.kind = 'badge' and inv.item_id <> p_item_id) >= 3 then
        raise exception 'BADGE_LIMIT';
      end if;
    else
      update public.stak_inventory inv set equipped = false from public.stak_items i where i.id = inv.item_id and inv.user_id = uid and i.kind = k;
    end if;
    update public.stak_inventory set equipped = true where user_id = uid and item_id = p_item_id;
  else
    update public.stak_inventory set equipped = false where user_id = uid and item_id = p_item_id;
  end if;
  return public.stak_get_state();
end;
$$;

-- Called ONLY by the Stripe webhook (service role). Idempotent per checkout session.
create or replace function public.stak_credit_from_payment(p_session_id text, p_user_id uuid, p_pack_id text, p_stak bigint, p_amount_cents integer, p_currency text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  bal bigint;
  inserted integer;
begin
  if p_stak <= 0 then raise exception 'BAD_AMOUNT'; end if;
  insert into public.stak_orders (session_id, user_id, pack_id, stak, amount_cents, currency)
  values (p_session_id, p_user_id, p_pack_id, p_stak, p_amount_cents, coalesce(p_currency, 'usd'))
  on conflict (session_id) do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return false; end if;
  insert into public.stak_wallets (user_id) values (p_user_id) on conflict (user_id) do nothing;
  update public.stak_wallets set balance = balance + p_stak, updated_at = now() where user_id = p_user_id returning balance into bal;
  insert into public.stak_transactions (user_id, kind, amount, balance_after, ref) values (p_user_id, 'purchase_pack', p_stak, bal, p_session_id);
  return true;
end;
$$;

revoke all on function public.stak_get_state() from public, anon;
revoke all on function public.stak_purchase_item(text) from public, anon;
revoke all on function public.stak_set_equipped(text, boolean) from public, anon;
revoke all on function public.stak_credit_from_payment(text, uuid, text, bigint, integer, text) from public, anon, authenticated;
grant execute on function public.stak_get_state() to authenticated;
grant execute on function public.stak_purchase_item(text) to authenticated;
grant execute on function public.stak_set_equipped(text, boolean) to authenticated;
grant execute on function public.stak_credit_from_payment(text, uuid, text, bigint, integer, text) to service_role;
