-- ANIVIA Friends System: server-authorized relationship state.
create table if not exists public.social_friend_requests (
  id uuid primary key default gen_random_uuid(), sender_id uuid not null references auth.users(id) on delete cascade, receiver_id uuid not null references auth.users(id) on delete cascade, status text not null default 'PENDING' check (status in ('PENDING','ACCEPTED','DECLINED','CANCELLED')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check (sender_id <> receiver_id)
);
create unique index if not exists one_pending_friend_request on public.social_friend_requests (least(sender_id, receiver_id), greatest(sender_id, receiver_id)) where status = 'PENDING';
create table if not exists public.social_friendships (user_id uuid not null references auth.users(id) on delete cascade, friend_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), primary key (user_id, friend_id), check (user_id <> friend_id));
create table if not exists public.social_blocks (blocker_id uuid not null references auth.users(id) on delete cascade, blocked_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), primary key (blocker_id, blocked_id), check (blocker_id <> blocked_id));
create table if not exists public.social_friend_notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, actor_id uuid references auth.users(id) on delete set null, kind text not null, request_id uuid references public.social_friend_requests(id) on delete cascade, read_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.social_privacy (user_id uuid primary key references auth.users(id) on delete cascade, friend_list_visibility text not null default 'FRIENDS_ONLY' check (friend_list_visibility in ('PUBLIC','FRIENDS_ONLY','PRIVATE')));

alter table public.social_friend_requests enable row level security;
alter table public.social_friendships enable row level security;
alter table public.social_blocks enable row level security;
alter table public.social_friend_notifications enable row level security;
alter table public.social_privacy enable row level security;
create policy "participants read requests" on public.social_friend_requests for select to authenticated using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "sender creates requests" on public.social_friend_requests for insert to authenticated with check (sender_id = auth.uid() and not exists (select 1 from public.social_blocks b where (b.blocker_id = auth.uid() and b.blocked_id = receiver_id) or (b.blocker_id = receiver_id and b.blocked_id = auth.uid())));
create policy "participants cannot directly mutate request state" on public.social_friend_requests for update to authenticated using (false);
create policy "friends readable to participants" on public.social_friendships for select to authenticated using (user_id = auth.uid() or friend_id = auth.uid());
create policy "blocks owner only" on public.social_blocks for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
create policy "own notifications readable" on public.social_friend_notifications for select to authenticated using (user_id = auth.uid());
create policy "own privacy" on public.social_privacy for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.accept_friend_request(p_request_id uuid) returns void language plpgsql security definer set search_path = public as $$
declare request_row public.social_friend_requests%rowtype;
begin
  select * into request_row from public.social_friend_requests where id = p_request_id and receiver_id = auth.uid() and status = 'PENDING' for update;
  if request_row.id is null then raise exception 'Friend request not found or unauthorized'; end if;
  if exists (select 1 from public.social_blocks b where (b.blocker_id = auth.uid() and b.blocked_id = request_row.sender_id) or (b.blocker_id = request_row.sender_id and b.blocked_id = auth.uid())) then raise exception 'Blocked relationship'; end if;
  update public.social_friend_requests set status = 'ACCEPTED', updated_at = now() where id = request_row.id;
  insert into public.social_friendships (user_id, friend_id) values (request_row.sender_id, request_row.receiver_id), (request_row.receiver_id, request_row.sender_id) on conflict do nothing;
  insert into public.social_friend_notifications (user_id, actor_id, kind, request_id) values (request_row.sender_id, auth.uid(), 'FRIEND_REQUEST_ACCEPTED', request_row.id);
end;
$$;
create or replace function public.decline_friend_request(p_request_id uuid) returns void language plpgsql security definer set search_path = public as $$ begin update public.social_friend_requests set status = 'DECLINED', updated_at = now() where id = p_request_id and receiver_id = auth.uid() and status = 'PENDING'; if not found then raise exception 'Friend request not found or unauthorized'; end if; end; $$;
create or replace function public.cancel_friend_request(p_request_id uuid) returns void language plpgsql security definer set search_path = public as $$ begin update public.social_friend_requests set status = 'CANCELLED', updated_at = now() where id = p_request_id and sender_id = auth.uid() and status = 'PENDING'; if not found then raise exception 'Friend request not found or unauthorized'; end if; end; $$;
create or replace function public.remove_friend(p_friend_id uuid) returns void language plpgsql security definer set search_path = public as $$ begin delete from public.social_friendships where (user_id = auth.uid() and friend_id = p_friend_id) or (user_id = p_friend_id and friend_id = auth.uid()); end; $$;
create or replace function public.block_user(p_blocked_id uuid) returns void language plpgsql security definer set search_path = public as $$ begin delete from public.social_friendships where (user_id = auth.uid() and friend_id = p_blocked_id) or (user_id = p_blocked_id and friend_id = auth.uid()); update public.social_friend_requests set status = 'CANCELLED', updated_at = now() where status = 'PENDING' and ((sender_id = auth.uid() and receiver_id = p_blocked_id) or (sender_id = p_blocked_id and receiver_id = auth.uid())); insert into public.social_blocks (blocker_id, blocked_id) values (auth.uid(), p_blocked_id) on conflict do nothing; end; $$;

alter table public.social_friend_requests replica identity full;
alter table public.social_friendships replica identity full;
alter table public.social_friend_notifications replica identity full;
alter publication supabase_realtime add table public.social_friend_requests;
alter publication supabase_realtime add table public.social_friendships;
alter publication supabase_realtime add table public.social_friend_notifications;
