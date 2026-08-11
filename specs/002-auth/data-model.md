# Data Model — 002 Auth

## Tablas gestionadas por Supabase

- `auth.users` — la crea y mantiene Supabase Auth. No la tocamos directamente. Campos relevantes:
  - `id uuid primary key`
  - `email text`
  - `encrypted_password text` (no accesible)
  - `email_confirmed_at timestamptz`
  - `raw_user_meta_data jsonb`
  - `created_at`, `updated_at`, etc.

## Tabla `public.profiles`

Extiende `auth.users` con datos de aplicación. Fila 1:1 con `auth.users`.

```sql
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  daily_goal_min int not null default 10 check (daily_goal_min in (5, 10, 15, 20)),
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de usuario — extiende auth.users. Se crea automáticamente vía trigger al registrarse.';
comment on column public.profiles.onboarded_at is 'NULL = no completó onboarding. NOT NULL = ya lo hizo (aunque haya skipeado).';
comment on column public.profiles.daily_goal_min is 'Meta diaria en minutos. Enum práctico: 5/10/15/20.';
```

### Trigger — crear profile al signup

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$;

-- Obligatorio: sin esto, PostgREST expone la función como RPC en
-- /rest/v1/rpc/handle_new_user, invocable por anon y authenticated.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Trigger — updated_at

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
```

### Reglas de seguridad para funciones (aplica a todos los módulos)

El security advisor de Supabase marca tres cosas que hay que respetar en cada función nueva:

1. **Siempre `set search_path = ''`** y referenciar todo con schema explícito (`public.profiles`, no `profiles`). Sin esto, un rol puede anteponer un schema propio y secuestrar la resolución de nombres.
2. **`security invoker` por default.** Usar `security definer` solo cuando de verdad hace falta (como acá, que hay que escribir en `public.profiles` desde un trigger sobre `auth.users`).
3. **Si es `security definer`, revocar `EXECUTE`** de `public`, `anon` y `authenticated`. PostgREST expone automáticamente las funciones de `public` como endpoints RPC.

Revocar `EXECUTE` no rompe los triggers: corren con los permisos del owner de la tabla, no del rol que dispara la operación.

### RLS

```sql
alter table public.profiles enable row level security;

-- Cada usuario ve solo su propio profile
create policy "user reads own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Cada usuario puede actualizar solo su propio profile
create policy "user updates own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Insert lo hace el trigger con security definer. No permitimos insert desde cliente.
-- Delete: solo cascade desde auth.users (si el user se borra).
```

**Nota sobre `(select auth.uid())`:** el paréntesis con `select` no es cosmético. Escrito como `auth.uid() = user_id`, Postgres re-evalúa la función **por cada fila escaneada**. Envuelta en `(select ...)`, la trata como constante y la evalúa una vez por query. Acá da igual (una fila por usuario), pero es el patrón a seguir en las tablas de progreso y SRS de los módulos 003 y 006, que van a tener muchas filas por usuario.

## Migración

Ubicación: `apps/mobile/supabase/migrations/20260812000000_profiles.sql`.

Contenido: todo lo de arriba en un solo archivo, más un `drop table public._bootstrap_ping;` al final para limpiar la tabla temporal del módulo 001.

## Tipos TypeScript

Tras aplicar la migración, regenerar con:

```bash
pnpm supabase:types
```

Se espera que `packages/shared/src/database.types.ts` incluya:

```ts
public: {
  Tables: {
    profiles: {
      Row: {
        user_id: string
        display_name: string | null
        daily_goal_min: number
        onboarded_at: string | null
        created_at: string
        updated_at: string
      }
      Insert: { /* similar */ }
      Update: { /* similar */ }
      Relationships: [
        { foreignKeyName: 'profiles_user_id_fkey', columns: ['user_id'], referencedRelation: 'users', referencedColumns: ['id'] }
      ]
    }
  }
}
```

## Tipos de dominio (packages/shared)

```ts
// packages/shared/src/auth/types.ts
import type { Database } from '../database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20] as const;
export type DailyGoal = (typeof DAILY_GOAL_OPTIONS)[number];
```
