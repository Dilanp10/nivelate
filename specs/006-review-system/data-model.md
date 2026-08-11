# Data Model — 006 Review System

## Tabla `srs_cards`

```sql
create table public.srs_cards (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  ease_factor numeric(4,2) not null default 2.5 check (ease_factor between 1.3 and 2.5),
  interval_days int not null default 0 check (interval_days >= 0),
  repetitions int not null default 0 check (repetitions >= 0),
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  primary key (user_id, exercise_id)
);
create index srs_cards_user_due_idx on public.srs_cards (user_id, due_at);
```

## RLS

```sql
alter table public.srs_cards enable row level security;

create policy "read own srs cards"
  on public.srs_cards for select to authenticated
  using ((select auth.uid()) = user_id);

-- Sin INSERT/UPDATE desde cliente: los RPC (complete_lesson y review_card)
-- son la única forma de escribir.
```

## Cambio en el RPC de 003 — `complete_lesson`

Se agrega al final (antes del `return next`): siembra automática de cards.

```sql
insert into public.srs_cards (user_id, exercise_id, due_at)
select v_user, e.id, now() + interval '1 day'
from public.exercises e
where e.lesson_id = p_lesson_id
on conflict (user_id, exercise_id) do nothing;
```

Se aplica como una nueva migración (`20260815000000_srs.sql`) que además crea la tabla y el RPC nuevo — todo junto porque el patch al `complete_lesson` es cambiar el cuerpo.

## RPC `review_card`

```sql
create or replace function public.review_card(
  p_exercise_id uuid,
  p_correct boolean
)
returns table (interval_days int, due_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_ease numeric;
  v_interval int;
  v_reps int;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;

  select ease_factor, srs_cards.interval_days, repetitions
    into v_ease, v_interval, v_reps
  from public.srs_cards
  where user_id = v_user and exercise_id = p_exercise_id
  for update;

  if not found then
    raise exception 'card no encontrada';
  end if;

  if p_correct then
    v_interval := greatest(1, round(greatest(v_interval, 1) * v_ease)::int);
    v_reps := v_reps + 1;
  else
    v_interval := 1;
    v_reps := 0;
    v_ease := greatest(1.3, v_ease - 0.20);
  end if;

  update public.srs_cards set
    ease_factor = v_ease,
    interval_days = v_interval,
    repetitions = v_reps,
    due_at = now() + (v_interval || ' days')::interval,
    last_reviewed_at = now()
  where user_id = v_user and exercise_id = p_exercise_id
  returning srs_cards.interval_days, srs_cards.due_at
    into interval_days, due_at;

  return next;
end;
$$;

revoke execute on function public.review_card(uuid, boolean) from public;
revoke execute on function public.review_card(uuid, boolean) from anon;
grant execute on function public.review_card(uuid, boolean) to authenticated;
```

## Migración

`apps/mobile/supabase/migrations/20260815000000_srs.sql`:
1. Crea `srs_cards` + índice + RLS.
2. Crea el RPC `review_card`.
3. Reemplaza `complete_lesson` para agregar la siembra de cards (mismo cuerpo + `insert on conflict do nothing` al final).

## Tipos de dominio

```ts
// packages/shared/src/srs/types.ts
import type { Database } from '../database.types';
export type SrsCard = Database['public']['Tables']['srs_cards']['Row'];

export type ReviewResult = { interval_days: number; due_at: string };
```
