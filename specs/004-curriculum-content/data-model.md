# Data Model — 004 Curriculum & Content

Todo el contenido es de **lectura pública** para usuarios autenticados y se escribe solo desde el loader (service_role). Sigue las convenciones de seguridad de [[AGENTS.md]] (search_path, RLS con `(select auth.uid())` donde aplique).

## Enum de tipos de ejercicio

```sql
create type public.exercise_type as enum (
  'multiple_choice',
  'fill_in_blank',
  'matching',
  'word_order',
  'listening',
  'translation',
  'dialogue'
);
```

## Tabla `units`

```sql
create table public.units (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  sort_order int not null check (sort_order >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index units_sort_order_idx on public.units (sort_order);
```

## Tabla `lessons`

```sql
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  slug text not null,
  title text not null,
  sort_order int not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, slug),
  unique (unit_id, sort_order)
);
create index lessons_unit_order_idx on public.lessons (unit_id, sort_order);
```

## Tabla `exercises`

```sql
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  exercise_key text not null,             -- clave estable de autoría, ej. "u1l1-e3"
  type public.exercise_type not null,
  payload jsonb not null,
  sort_order int not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, exercise_key),
  unique (lesson_id, sort_order)
);
create index exercises_lesson_order_idx on public.exercises (lesson_id, sort_order);
```

## Tabla `grammar_topics`

```sql
create table public.grammar_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,                    -- ej. "Present perfect con for/since"
  explanation_es text not null,           -- explicación en español
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Tabla puente `lesson_grammar_topics`

```sql
create table public.lesson_grammar_topics (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  grammar_topic_id uuid not null references public.grammar_topics(id) on delete cascade,
  primary key (lesson_id, grammar_topic_id)
);
```

## Tabla `vocab_items`

Banco de vocabulario reutilizable. En 004 se crea la tabla; la usan a fondo 006 (SRS) y las unidades de vocabulario.

```sql
create table public.vocab_items (
  id uuid primary key default gen_random_uuid(),
  term_en text not null,
  term_es text not null,
  example_en text,
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  created_at timestamptz not null default now(),
  unique (term_en, term_es)
);
```

## Triggers updated_at

Reutiliza `public.set_updated_at()` (creada en 002, `security invoker`, `search_path=''`). Se agregan triggers `before update` en `units`, `lessons`, `exercises`, `grammar_topics`.

## RLS — lectura pública de lo publicado

```sql
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.grammar_topics enable row level security;
alter table public.lesson_grammar_topics enable row level security;
alter table public.vocab_items enable row level security;

-- units: se leen las publicadas
create policy "read published units"
  on public.units for select to authenticated
  using (is_published = true);

-- lessons: se leen si su unit está publicada
create policy "read lessons of published units"
  on public.lessons for select to authenticated
  using (exists (
    select 1 from public.units u
    where u.id = lessons.unit_id and u.is_published = true
  ));

-- exercises: idem vía lesson → unit
create policy "read exercises of published units"
  on public.exercises for select to authenticated
  using (exists (
    select 1 from public.lessons l
    join public.units u on u.id = l.unit_id
    where l.id = exercises.lesson_id and u.is_published = true
  ));

-- grammar_topics, lesson_grammar_topics, vocab_items: lectura libre para autenticados
create policy "read grammar topics"
  on public.grammar_topics for select to authenticated using (true);
create policy "read lesson grammar topics"
  on public.lesson_grammar_topics for select to authenticated using (true);
create policy "read vocab items"
  on public.vocab_items for select to authenticated using (true);
```

No hay políticas de INSERT/UPDATE/DELETE: la escritura la hace el loader con service_role, que se salta RLS. Ningún rol de cliente puede escribir contenido.

## Tipos de dominio (packages/shared)

```ts
// packages/shared/src/content/types.ts
import type { Database } from '../database.types';

export type Unit = Database['public']['Tables']['units']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type ExerciseRow = Database['public']['Tables']['exercises']['Row'];
export type GrammarTopic = Database['public']['Tables']['grammar_topics']['Row'];

export const EXERCISE_TYPES = [
  'multiple_choice', 'fill_in_blank', 'matching',
  'word_order', 'listening', 'translation', 'dialogue',
] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];
```

Los tipos de `payload` por cada `ExerciseType` viven en `exercise-types.ts` (ver [contracts/exercise-payloads.md](./contracts/exercise-payloads.md)).

## Migración

`apps/mobile/supabase/migrations/20260813000000_content_schema.sql` con todo lo anterior.
Tras aplicar: correr advisors (security + performance) y regenerar tipos.
