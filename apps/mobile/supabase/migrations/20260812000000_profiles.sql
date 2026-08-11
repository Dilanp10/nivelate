-- Spec 002 — Auth
-- Tabla profiles + trigger auto-create + RLS + drop tabla temporal de bootstrap.

-- 1) Tabla profiles (extiende auth.users 1:1)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  daily_goal_min int not null default 10 check (daily_goal_min in (5, 10, 15, 20)),
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil de usuario. Fila 1:1 con auth.users, creada por trigger al registrarse.';
comment on column public.profiles.onboarded_at is
  'NULL = onboarding pendiente. NOT NULL = ya lo completó (aunque haya skipeado).';
comment on column public.profiles.daily_goal_min is
  'Meta diaria en minutos. Enum práctico: 5/10/15/20.';

-- 2) Trigger: crear profile automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Trigger: mantener updated_at fresco
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 4) RLS
alter table public.profiles enable row level security;

create policy "user reads own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user updates own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Insert lo hace el trigger con security definer.
-- Delete se propaga por cascade desde auth.users.

-- 5) Cleanup: eliminar la tabla temporal del módulo 001
drop table if exists public._bootstrap_ping;
