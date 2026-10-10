-- =====================================================================
-- Archai Media System — Project Images v2
-- Adds role-based image slots, ordering, and helper functions
-- Safe to rerun. Does not delete existing project_images.
-- =====================================================================

-- ---------- Add role + sort columns if missing ----------
alter table public.project_images
  add column if not exists role text;

alter table public.project_images
  add column if not exists sort_order integer not null default 0;

alter table public.project_images
  add column if not exists caption_en text;

alter table public.project_images
  add column if not exists caption_ar text;

alter table public.project_images
  add column if not exists width integer;

alter table public.project_images
  add column if not exists height integer;

alter table public.project_images
  add column if not exists bytes integer;

-- Constrain role values to known slots
do $$ begin
  alter table public.project_images
    add constraint project_images_role_check
    check (role is null or role in ('cover','hero','featured','gallery'));
exception when duplicate_object then null;
end $$;

-- ---------- Indexes ----------
create index if not exists idx_project_images_role
  on public.project_images(project_id, role);

create index if not exists idx_project_images_sort
  on public.project_images(project_id, sort_order);

-- ---------- Enforce single cover/hero/featured per project ----------
create unique index if not exists uniq_cover_per_project
  on public.project_images(project_id)
  where role = 'cover';

create unique index if not exists uniq_hero_per_project
  on public.project_images(project_id)
  where role = 'hero';

create unique index if not exists uniq_featured_per_project
  on public.project_images(project_id)
  where role = 'featured';

-- ---------- Helper: reorder images atomically ----------
create or replace function public.reorder_project_images(
  p_project_id uuid,
  p_ordered_ids uuid[]
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_idx int := 0;
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  foreach v_id in array p_ordered_ids loop
    update public.project_images
      set sort_order = v_idx
      where id = v_id and project_id = p_project_id;
    v_idx := v_idx + 1;
  end loop;
end $$;

revoke all on function public.reorder_project_images(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_project_images(uuid, uuid[]) to authenticated;

-- ---------- Helper: assign role to an image (auto-clears previous) ----------
create or replace function public.assign_image_role(
  p_image_id uuid,
  p_role text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_project uuid;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_role not in ('cover','hero','featured','gallery') then
    raise exception 'invalid role' using errcode = '22023';
  end if;

  select project_id into v_project from public.project_images where id = p_image_id;
  if v_project is null then
    raise exception 'image not found' using errcode = '02000';
  end if;

  -- Clear other rows that held this single-slot role
  if p_role in ('cover','hero','featured') then
    update public.project_images
      set role = 'gallery'
      where project_id = v_project
        and role = p_role
        and id <> p_image_id;
  end if;

  update public.project_images
    set role = p_role
    where id = p_image_id;
end $$;

revoke all on function public.assign_image_role(uuid, text) from public, anon;
grant execute on function public.assign_image_role(uuid, text) to authenticated;

-- ---------- Sync legacy flags from role (for backwards compatibility) ----------
create or replace function public.sync_image_flags()
returns trigger language plpgsql as $$
begin
  new.is_cover := (new.role = 'cover');
  new.is_hero := (new.role = 'hero');
  new.is_featured := (new.role = 'featured');
  return new;
end $$;

drop trigger if exists t_sync_image_flags on public.project_images;
create trigger t_sync_image_flags
  before insert or update on public.project_images
  for each row execute function public.sync_image_flags();

-- ---------- Backfill roles from existing flags ----------
update public.project_images
  set role = 'cover'
  where role is null and is_cover is true;

update public.project_images
  set role = 'hero'
  where role is null and is_hero is true;

update public.project_images
  set role = 'featured'
  where role is null and is_featured is true;

update public.project_images
  set role = 'gallery'
  where role is null;

-- ---------- Storage bucket (larger limit for high-res) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  true,
  5242880,
  array['image/webp','image/jpeg','image/png','image/avif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/webp','image/jpeg','image/png','image/avif'];