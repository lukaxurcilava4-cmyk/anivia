-- ANIVIA Social Feed schema. Run after enabling Supabase Auth.
create table if not exists public.social_profiles (id uuid primary key references auth.users(id) on delete cascade, username text unique not null, avatar_url text, bio text, reputation integer not null default 0, created_at timestamptz not null default now());
create table if not exists public.social_communities (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, description text, member_count integer not null default 0, created_at timestamptz not null default now());
create table if not exists public.social_memberships (community_id uuid references public.social_communities(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, role text not null default 'member', created_at timestamptz not null default now(), primary key (community_id, user_id));
create table if not exists public.social_posts (id uuid primary key default gen_random_uuid(), author_id uuid not null references auth.users(id), community_id uuid references public.social_communities(id), post_type text not null default 'text' check (post_type in ('text','image','gallery','link','poll')), title text not null, body text, media_urls jsonb not null default '[]'::jsonb, tags text[] not null default '{}', view_count integer not null default 0, score numeric not null default 0, hidden_count integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.social_post_votes (post_id uuid references public.social_posts(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, value smallint not null check (value in (-1, 1)), created_at timestamptz not null default now(), primary key (post_id, user_id));
create table if not exists public.social_comments (id uuid primary key default gen_random_uuid(), post_id uuid not null references public.social_posts(id) on delete cascade, author_id uuid not null references auth.users(id), parent_id uuid references public.social_comments(id) on delete cascade, body text not null, score integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.social_saves (post_id uuid references public.social_posts(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, created_at timestamptz not null default now(), primary key (post_id, user_id));
create table if not exists public.social_shares (post_id uuid references public.social_posts(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade, created_at timestamptz not null default now(), created_at_unique timestamptz not null default now());
create table if not exists public.social_reports (id uuid primary key default gen_random_uuid(), post_id uuid references public.social_posts(id) on delete cascade, reporter_id uuid references auth.users(id), reason text not null, created_at timestamptz not null default now());
create table if not exists public.social_ads (id uuid primary key default gen_random_uuid(), slot text not null, label text not null default 'SPONSORED', content jsonb not null default '{}'::jsonb, active boolean not null default true);

alter table public.social_profiles enable row level security;
alter table public.social_communities enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_post_votes enable row level security;
alter table public.social_comments enable row level security;
alter table public.social_saves enable row level security;
alter table public.social_memberships enable row level security;
create policy "public profiles readable" on public.social_profiles for select using (true);
create policy "users manage own profile" on public.social_profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "public feed readable" on public.social_posts for select using (true);
create policy "users create posts" on public.social_posts for insert to authenticated with check (author_id = auth.uid());
create policy "authors update posts" on public.social_posts for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "users manage votes" on public.social_post_votes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "public comments readable" on public.social_comments for select using (true);
create policy "users create comments" on public.social_comments for insert to authenticated with check (author_id = auth.uid());
create policy "users manage saves" on public.social_saves for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage memberships" on public.social_memberships for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.social_posts replica identity full;
alter table public.social_comments replica identity full;
alter table public.social_post_votes replica identity full;
alter publication supabase_realtime add table public.social_posts;
alter publication supabase_realtime add table public.social_comments;
alter publication supabase_realtime add table public.social_post_votes;
