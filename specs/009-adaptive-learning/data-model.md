# Data Model — 009 Aprendizaje adaptativo

## Tablas nuevas

### `teaching_cards`
Cards de explicación/teoría que se muestran al comienzo de una lección.

```sql
create table public.teaching_cards (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  key text not null,
  title_es text not null,
  body_es text not null,
  sort_order int not null,
  created_at timestamptz not null default now(),
  unique (lesson_id, key)
);

create index teaching_cards_lesson_idx on public.teaching_cards (lesson_id, sort_order);
```

### `teaching_examples`
Ejemplos concretos (frase en inglés + traducción) que pertenecen a una teaching card. El campo `goal` permite la adaptación por `learning_goal`.

```sql
create table public.teaching_examples (
  id uuid primary key default gen_random_uuid(),
  teaching_card_id uuid not null references public.teaching_cards(id) on delete cascade,
  en text not null,
  es text not null,
  goal text null check (goal in ('travel', 'work', 'study', 'entertainment', 'general')),
  sort_order int not null,
  created_at timestamptz not null default now()
);

create index teaching_examples_card_idx on public.teaching_examples (teaching_card_id, sort_order);
```

### `pronunciation_highlights`
Frases clave de una lección con su respelling en español. Se muestran en la pantalla final.

```sql
create table public.pronunciation_highlights (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  en text not null,
  respelling_es text not null,
  sort_order int not null,
  created_at timestamptz not null default now()
);

create index pronunciation_highlights_lesson_idx on public.pronunciation_highlights (lesson_id, sort_order);
```

## Cambio en tabla existente

### `exercises` — nueva columna `goal`
```sql
alter table public.exercises
  add column goal text null
  check (goal in ('travel', 'work', 'study', 'entertainment', 'general'));
```

Nullable = agnóstico al goal (fallback como `general` en el filter).

## RLS

Las 3 tablas nuevas son contenido curado — mismo patrón que `lessons`/`exercises` en 004: `select` público (o para authenticated), sin `insert`/`update`/`delete` desde cliente.

```sql
alter table public.teaching_cards enable row level security;
alter table public.teaching_examples enable row level security;
alter table public.pronunciation_highlights enable row level security;

create policy "read teaching cards from published lessons"
  on public.teaching_cards for select to authenticated
  using (
    exists (
      select 1 from public.lessons l
      join public.units u on u.id = l.unit_id
      where l.id = teaching_cards.lesson_id
        and u.is_published = true
    )
  );

create policy "read teaching examples from published lessons"
  on public.teaching_examples for select to authenticated
  using (
    exists (
      select 1 from public.teaching_cards tc
      join public.lessons l on l.id = tc.lesson_id
      join public.units u on u.id = l.unit_id
      where tc.id = teaching_examples.teaching_card_id
        and u.is_published = true
    )
  );

create policy "read pronunciation highlights from published lessons"
  on public.pronunciation_highlights for select to authenticated
  using (
    exists (
      select 1 from public.lessons l
      join public.units u on u.id = l.unit_id
      where l.id = pronunciation_highlights.lesson_id
        and u.is_published = true
    )
  );
```

Sin políticas de `insert`/`update`/`delete` → default deny.

## Migración única

Todo va en una sola migración: `20260819000000_adaptive_learning.sql` — crea las 3 tablas, agrega `goal` a `exercises`, aplica RLS.

Sin backfill de datos: las tablas nuevas empiezan vacías, se pueblan con el seed. `exercises.goal` queda `null` para las filas existentes (equivalente a `general`).

## Tipos TypeScript

Después de la migración, regenerar `packages/shared/src/database.types.ts` con `supabase gen types typescript`.

Nuevos tipos derivados en `packages/shared/src/content/types.ts`:
```ts
export type TeachingCard = Database['public']['Tables']['teaching_cards']['Row'];
export type TeachingExample = Database['public']['Tables']['teaching_examples']['Row'];
export type PronunciationHighlight = Database['public']['Tables']['pronunciation_highlights']['Row'];
```

Y el enum de goals reusa el existente en `packages/shared/src/auth/types.ts`:
```ts
export type ContentGoal = LearningGoal; // ya definido: travel | work | study | entertainment | general
```

## Schema de JSON (authoring)

Actualizar `packages/shared/src/content/authoring.ts` (Zod) para que cada `lesson` acepte:

```ts
{
  slug: string,
  title: string,
  grammarTopicSlugs: string[],
  teachingCards?: [{
    key: string,
    titleEs: string,
    bodyEs: string,
    examples: [{ en: string, es: string, goal?: LearningGoal }]
  }],
  exercises: [{
    key: string,
    type: ExerciseType,
    goal?: LearningGoal,
    payload: {...}
  }],
  pronunciationHighlights?: [{ en: string, respellingEs: string }]
}
```

Todo lo agregado es opcional — las lecciones existentes siguen validando sin cambios.
