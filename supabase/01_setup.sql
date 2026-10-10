-- =====================================================================
-- Archai Projects Showcase — consolidated Supabase schema
-- Safe to rerun in Supabase SQL Editor. Does not delete application data or Storage objects.
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- helpers ----------
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- profiles / admin role ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin','viewer')),
  name text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------- categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en text not null, name_ar text not null,
  description_en text, description_ar text,
  icon text, sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- ---------- projects ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order int not null default 0,
  title_en text not null, title_ar text not null,
  summary_en text not null, summary_ar text not null,
  description_en text, description_ar text,
  live_url text check (live_url is null or live_url ~* '^https?://[^\s]+$'),
  cover_image text, cover_thumb text, hero_image text, featured_image text,
  featured boolean not null default false,
  featured_sort_order int not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null, public_url text not null,
  thumb_path text, thumb_url text,
  alt_en text, alt_ar text, sort_order int not null default 0,
  is_cover boolean not null default false,
  is_featured boolean not null default false,
  is_hero boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists one_cover_per_project on public.project_images(project_id) where is_cover;
create unique index if not exists one_featured_per_project on public.project_images(project_id) where is_featured;
create unique index if not exists one_hero_per_project on public.project_images(project_id) where is_hero;

create table if not exists public.project_technologies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  technology text not null check (length(technology) between 1 and 60)
);
create unique index if not exists uq_project_tech on public.project_technologies(project_id, lower(technology));

create table if not exists public.project_industries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  industry text not null check (length(industry) between 1 and 60)
);
create unique index if not exists uq_project_ind on public.project_industries(project_id, lower(industry));

-- ---------- site settings (single row) ----------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  company_name text, logo_url text, site_title text,
  home_title_en text, home_title_ar text,
  home_desc_en text, home_desc_ar text,
  contact jsonb not null default '{}'::jsonb,
  social jsonb not null default '{}'::jsonb,
  footer_text_en text, footer_text_ar text,
  default_seo_image text,
  section_visibility jsonb not null default '{"hero":true,"featured":true,"categories":true}'::jsonb,
  featured_limit int not null default 6,
  projects_per_category int not null default 6,
  updated_at timestamptz not null default now()
);

-- ---------- analytics ----------
create table if not exists public.visitor_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique check (length(session_id) between 16 and 64),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  device_type text not null default 'desktop' check (device_type in ('desktop','mobile','tablet')),
  browser text, os text, referrer text,
  referrer_type text not null default 'direct' check (referrer_type in ('direct','search','referral','other'))
);
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  session_id text not null references public.visitor_sessions(session_id) on delete cascade,
  page text not null,
  project_id uuid references public.projects(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.project_views (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  session_id text not null references public.visitor_sessions(session_id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Compatibility columns for databases created by earlier revisions.
alter table public.profiles add column if not exists role text not null default 'viewer';
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.categories add column if not exists description_en text;
alter table public.categories add column if not exists description_ar text;
alter table public.categories add column if not exists icon text;
alter table public.categories add column if not exists sort_order integer not null default 0;
alter table public.categories add column if not exists active boolean not null default true;
alter table public.categories add column if not exists created_at timestamptz not null default now();
alter table public.categories add column if not exists updated_at timestamptz not null default now();
alter table public.projects add column if not exists category_id uuid references public.categories(id) on delete set null;
alter table public.projects add column if not exists status text not null default 'draft';
alter table public.projects add column if not exists sort_order integer not null default 0;
alter table public.projects add column if not exists title_en text not null default '';
alter table public.projects add column if not exists title_ar text not null default '';
alter table public.projects add column if not exists summary_en text not null default '';
alter table public.projects add column if not exists summary_ar text not null default '';
alter table public.projects add column if not exists description_en text;
alter table public.projects add column if not exists description_ar text;
alter table public.projects add column if not exists live_url text;
alter table public.projects add column if not exists cover_image text;
alter table public.projects add column if not exists cover_thumb text;
alter table public.projects add column if not exists hero_image text;
alter table public.projects add column if not exists featured_image text;
alter table public.projects add column if not exists featured boolean not null default false;
alter table public.projects add column if not exists featured_sort_order integer not null default 0;
alter table public.projects add column if not exists created_at timestamptz not null default now();
alter table public.projects add column if not exists updated_at timestamptz not null default now();
alter table public.project_images add column if not exists thumb_path text;
alter table public.project_images add column if not exists thumb_url text;
alter table public.project_images add column if not exists alt_en text;
alter table public.project_images add column if not exists alt_ar text;
alter table public.project_images add column if not exists sort_order integer not null default 0;
alter table public.project_images add column if not exists is_cover boolean not null default false;
alter table public.project_images add column if not exists is_featured boolean not null default false;
alter table public.project_images add column if not exists is_hero boolean not null default false;
alter table public.site_settings add column if not exists logo_url text;
alter table public.site_settings add column if not exists site_title text;
alter table public.site_settings add column if not exists home_title_en text;
alter table public.site_settings add column if not exists home_title_ar text;
alter table public.site_settings add column if not exists home_desc_en text;
alter table public.site_settings add column if not exists home_desc_ar text;
alter table public.site_settings add column if not exists contact jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists social jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists footer_text_en text;
alter table public.site_settings add column if not exists footer_text_ar text;
alter table public.site_settings add column if not exists default_seo_image text;
alter table public.site_settings add column if not exists section_visibility jsonb not null default '{"hero":true,"featured":true,"categories":true}'::jsonb;
alter table public.site_settings add column if not exists featured_limit integer not null default 6;
alter table public.site_settings add column if not exists projects_per_category integer not null default 6;
alter table public.site_settings add column if not exists updated_at timestamptz not null default now();


-- ---------- indexes (kept minimal: fewer indexes = cheaper writes) ----------
create index if not exists idx_projects_category_id on public.projects(category_id);
create index if not exists idx_projects_status_sort on public.projects(status, sort_order);
create index if not exists idx_projects_featured_sort on public.projects(featured, featured_sort_order) where featured;
create index if not exists idx_project_images_project_sort on public.project_images(project_id, sort_order);
create index if not exists idx_page_views_created_at on public.page_views(created_at);
create index if not exists idx_page_views_session_page_created on public.page_views(session_id, page, created_at);
create index if not exists idx_project_views_created_at on public.project_views(created_at);
create index if not exists idx_project_views_project_created on public.project_views(project_id, created_at);
create index if not exists idx_project_views_session_project_created on public.project_views(session_id, project_id, created_at);

-- ---------- triggers ----------
drop trigger if exists t_cat_upd on public.categories;
create trigger t_cat_upd before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists t_proj_upd on public.projects;
create trigger t_proj_upd before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists t_set_upd on public.site_settings;
create trigger t_set_upd before update on public.site_settings for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.project_technologies enable row level security;
alter table public.project_industries enable row level security;
alter table public.site_settings enable row level security;
alter table public.visitor_sessions enable row level security;
alter table public.page_views enable row level security;
alter table public.project_views enable row level security;

-- Explicit API grants: RLS policies below remain the authorization boundary.
grant select on public.categories, public.projects, public.project_images, public.project_technologies, public.project_industries, public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.categories, public.projects, public.project_images, public.project_technologies, public.project_industries, public.site_settings to authenticated;
grant select on public.visitor_sessions, public.page_views, public.project_views to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Profiles: explicit grants + non-recursive own-row read policy.
drop policy if exists profiles_read on public.profiles;
drop policy if exists profiles_admin_write on public.profiles;
drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_admin_read on public.profiles;
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_admin_read on public.profiles;
create policy profiles_admin_read on public.profiles for select to authenticated using (public.is_admin());
drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.profiles to authenticated;
grant insert, update, delete on public.profiles to authenticated;

-- Safe profile lookup avoids client-side RLS recursion/policy ambiguity.
create or replace function public.get_my_profile()
returns jsonb language sql stable security definer set search_path = public, auth as $$
  select jsonb_build_object('id', p.id, 'role', p.role, 'name', p.name)
  from public.profiles p where p.id = auth.uid() limit 1;
$$;
revoke all on function public.get_my_profile() from public, anon;
grant execute on function public.get_my_profile() to authenticated;

-- public content: read published/active only; admin full CRUD
drop policy if exists cat_public_read on public.categories;
create policy cat_public_read on public.categories for select to anon, authenticated using (active);
drop policy if exists cat_admin on public.categories;
create policy cat_admin on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists proj_public_read on public.projects;
create policy proj_public_read on public.projects for select to anon, authenticated using (
  status = 'published' and (category_id is null or exists (select 1 from public.categories c where c.id = category_id and c.active)));
drop policy if exists proj_admin on public.projects;
create policy proj_admin on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists img_public_read on public.project_images;
create policy img_public_read on public.project_images for select to anon, authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));
drop policy if exists img_admin on public.project_images;
create policy img_admin on public.project_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists tech_public_read on public.project_technologies;
create policy tech_public_read on public.project_technologies for select to anon, authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));
drop policy if exists tech_admin on public.project_technologies;
create policy tech_admin on public.project_technologies for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists ind_public_read on public.project_industries;
create policy ind_public_read on public.project_industries for select to anon, authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));
drop policy if exists ind_admin on public.project_industries;
create policy ind_admin on public.project_industries for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings for select to anon, authenticated using (true);
drop policy if exists settings_admin on public.site_settings;
create policy settings_admin on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- analytics: admin read only. No public INSERT policy: writes go through the RPCs below.
drop policy if exists vs_admin_read on public.visitor_sessions;
create policy vs_admin_read on public.visitor_sessions for select to authenticated using (public.is_admin());
drop policy if exists pv_admin_read on public.page_views;
create policy pv_admin_read on public.page_views for select to authenticated using (public.is_admin());
drop policy if exists prv_admin_read on public.project_views;
create policy prv_admin_read on public.project_views for select to authenticated using (public.is_admin());

-- ---------- tracking RPC (ONE request per page view; validated server-side) ----------
create or replace function public.track_visit(
  p_session text, p_page text, p_device text default 'desktop', p_browser text default null,
  p_os text default null, p_referrer text default null, p_referrer_type text default 'direct',
  p_project uuid default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_project uuid := null;
begin
  if p_session is null or length(p_session) not between 16 and 64 then return; end if;
  if p_page is null or btrim(p_page) = '' then p_page := '/'; end if;
  if p_project is not null and exists (select 1 from public.projects where id = p_project and status = 'published') then
    v_project := p_project;
  end if;
  insert into visitor_sessions(session_id, device_type, browser, os, referrer, referrer_type)
  values (p_session,
    case when p_device in ('desktop','mobile','tablet') then p_device else 'desktop' end,
    left(p_browser,40), left(p_os,40), left(p_referrer,80),
    case when p_referrer_type in ('direct','search','referral','other') then p_referrer_type else 'other' end)
  on conflict (session_id) do update set last_seen_at = now()
    where visitor_sessions.last_seen_at < now() - interval '1 minute';
  if not exists (select 1 from page_views where session_id = p_session and page = left(p_page,60)
                 and created_at > now() - interval '5 seconds') then
    insert into page_views(session_id, page, project_id) values (p_session, left(p_page,60), v_project);
  end if;
  -- project view: published only, same session+project counted once per 30 minutes
  if v_project is not null
     and not exists (select 1 from project_views where session_id = p_session and project_id = v_project
                     and created_at > now() - interval '30 minutes') then
    insert into project_views(project_id, session_id) values (v_project, p_session);
  end if;
end $$;
grant execute on function public.track_visit(text,text,text,text,text,text,text,uuid) to anon, authenticated;

-- ---------- admin analytics RPCs ----------
create or replace function public.analytics_dashboard(p_from timestamptz, p_to timestamptz, p_bucket text default 'day')
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare b text := case when p_bucket in ('day','week','month') then p_bucket else 'day' end;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return jsonb_build_object(
   'totals', jsonb_build_object(
     'unique_sessions', (select count(distinct session_id) from page_views where created_at between p_from and p_to),
     'page_views',      (select count(*) from page_views where created_at between p_from and p_to),
     'project_views',   (select count(*) from project_views where created_at between p_from and p_to),
     'unique_project_visitors', (select count(distinct session_id) from project_views where created_at between p_from and p_to)),
   'visitors_series', (select coalesce(jsonb_agg(to_jsonb(x) order by x.t), '[]') from (
      select date_trunc(b, created_at) t, count(distinct session_id) visitors, count(*) page_views
      from page_views where created_at between p_from and p_to group by 1) x),
   'project_views_series', (select coalesce(jsonb_agg(to_jsonb(x) order by x.t), '[]') from (
      select date_trunc(b, created_at) t, count(*) views, count(distinct session_id) uniq
      from project_views where created_at between p_from and p_to group by 1) x),
   'top_projects', (select coalesce(jsonb_agg(to_jsonb(x) order by x.views desc), '[]') from (
      select p.id, p.title_en, p.title_ar, count(*) views, count(distinct v.session_id) uniq,
        round(100.0 * count(*) / nullif((select count(*) from project_views where created_at between p_from and p_to),0), 1) pct
      from project_views v join projects p on p.id = v.project_id
      where v.created_at between p_from and p_to group by p.id order by views desc limit 10) x),
   'top_categories', (select coalesce(jsonb_agg(to_jsonb(x) order by x.views desc), '[]') from (
      select c.id, c.name_en, c.name_ar, count(*) views
      from project_views v join projects p on p.id = v.project_id join categories c on c.id = p.category_id
      where v.created_at between p_from and p_to group by c.id order by views desc) x),
   'devices', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from (
      select s.device_type, count(distinct s.session_id) sessions
      from page_views pv join visitor_sessions s using (session_id)
      where pv.created_at between p_from and p_to group by 1) x),
   'sources', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from (
      select s.referrer_type, count(distinct s.session_id) sessions
      from page_views pv join visitor_sessions s using (session_id)
      where pv.created_at between p_from and p_to group by 1) x),
   'overview', jsonb_build_object(
     'total_projects', (select count(*) from projects),
     'published_projects', (select count(*) from projects where status = 'published'),
     'featured_projects', (select count(*) from projects where featured))
  );
end $$;

create or replace function public.project_analytics(p_project uuid, p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return jsonb_build_object(
    'views', (select count(*) from project_views where project_id = p_project and created_at between p_from and p_to),
    'unique_visitors', (select count(distinct session_id) from project_views where project_id = p_project and created_at between p_from and p_to),
    'series', (select coalesce(jsonb_agg(to_jsonb(x) order by x.t), '[]') from (
      select date_trunc('day', created_at) t, count(*) views from project_views
      where project_id = p_project and created_at between p_from and p_to group by 1) x));
end $$;

revoke execute on function public.analytics_dashboard(timestamptz,timestamptz,text) from public, anon;
revoke execute on function public.project_analytics(uuid,timestamptz,timestamptz) from public, anon;
grant execute on function public.analytics_dashboard(timestamptz,timestamptz,text) to authenticated;
grant execute on function public.project_analytics(uuid,timestamptz,timestamptz) to authenticated;


-- lightweight counters for the dashboard Overview (no time series, no big scans)
create or replace function public.admin_overview() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return jsonb_build_object(
    'total_projects', (select count(*) from projects),
    'published_projects', (select count(*) from projects where status = 'published'),
    'featured_projects', (select count(*) from projects where featured),
    'sessions', (select count(*) from visitor_sessions),
    'project_views', (select count(*) from project_views));
end $$;
revoke execute on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;

-- data retention: keeps analytics tables small (cascade removes page_views/project_views)
create or replace function public.purge_old_analytics(p_days int default 90) returns void
language sql security definer set search_path = public as $$
  delete from visitor_sessions where last_seen_at < now() - make_interval(days => p_days);
$$;
revoke execute on function public.purge_old_analytics(int) from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    begin
      perform cron.unschedule('purge-analytics');
    exception when others then null;
    end;
    perform cron.schedule('purge-analytics', '0 3 * * *', 'select public.purge_old_analytics(90)');
  else
    raise notice 'pg_cron is not enabled; analytics cleanup can be run manually with select public.purge_old_analytics(90);';
  end if;
exception when others then
  raise notice 'Could not schedule analytics cleanup; run select public.purge_old_analytics(90); manually.';
end $$;

-- per-project totals for the admin projects table (RLS of project_views applies)
create or replace view public.project_view_counts with (security_invoker = true) as
  select project_id, count(*) as views, count(distinct session_id) as unique_visitors
  from public.project_views group by project_id;

-- ---------- storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-media', 'project-media', true, 1572864, array['image/webp'])
on conflict (id) do update set public = true, file_size_limit = 1572864,
  allowed_mime_types = array['image/webp'];

grant select on storage.objects to anon, authenticated;
grant insert, update, delete on storage.objects to authenticated;

drop policy if exists media_public_read on storage.objects;
drop policy if exists media_admin_insert on storage.objects;
drop policy if exists media_admin_update on storage.objects;
drop policy if exists media_admin_delete on storage.objects;
grant select on storage.objects to anon, authenticated;
grant insert, update, delete on storage.objects to authenticated;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read  on storage.objects for select using (bucket_id = 'project-media');
drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'project-media' and public.is_admin());
drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects for update to authenticated using (bucket_id = 'project-media' and public.is_admin());
drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'project-media' and public.is_admin());

-- ---------- initial data (structure only, no projects) ----------
insert into public.site_settings (id, company_name, site_title, home_title_en, home_title_ar, home_desc_en, home_desc_ar)
values (1, 'Archai Integrated Systems', 'Archai — Projects',
  'Explore Our Digital Projects', 'اكتشف مشاريعنا الرقمية',
  'Software, embedded and mobile solutions engineered by Archai.',
  'حلول برمجية ومدمجة وموبايل من هندسة أرشاي.')
on conflict (id) do nothing;

insert into public.categories (slug, name_en, name_ar, sort_order) values
  ('embedded', 'Embedded Projects', 'مشاريع الإمبيدد', 1),
  ('web',      'Web Projects',      'مشاريع الويب',    2),
  ('mobile',   'Mobile Projects',   'مشاريع الموبايل', 3)
on conflict (slug) do nothing;
