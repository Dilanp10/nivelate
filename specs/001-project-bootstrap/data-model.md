# Data Model — 001 Project Bootstrap

El bootstrap no define contenido del producto. Solo una tabla de smoke test para verificar que la conexión funciona.

## Tabla `_bootstrap_ping`

Tabla efímera, se **elimina** cuando 002 (auth) esté mergeado.

```sql
create table public._bootstrap_ping (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  note text
);

-- Insertar una fila de smoke
insert into public._bootstrap_ping (note) values ('bootstrap ok');

-- RLS: lectura pública para poder testear sin auth
alter table public._bootstrap_ping enable row level security;

create policy "public read ping"
  on public._bootstrap_ping
  for select
  to anon
  using (true);
```

## Tipos TypeScript

Después de crear la tabla, regenerar tipos con:

```bash
pnpm supabase:types
```

Que corre:

```bash
supabase gen types typescript --project-id <ref> > packages/shared/src/database.types.ts
```

## Tipos compartidos ya incluidos en `packages/shared`

```ts
// packages/shared/src/cefr.ts
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const APP_CEFR_RANGE: readonly CEFRLevel[] = ['A2', 'B1'] as const;
```

## Migraciones

Ubicación: `apps/mobile/supabase/migrations/`.

Convención de nombre: `YYYYMMDDHHmmss_descripcion.sql`.

Primera migración: `20260811000000_bootstrap_ping.sql`.
