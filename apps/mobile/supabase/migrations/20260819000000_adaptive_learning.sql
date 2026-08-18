-- Spec 009 — Aprendizaje adaptativo
-- 3 tablas nuevas de contenido (teaching cards, examples, pronunciation highlights)
-- + columna `goal` en exercises para adaptación por learning_goal del perfil.
-- Todo es contenido curado: RLS de lectura pública para authenticated (solo
-- cuando la unidad está publicada); mutations solo con service_role (loader).

-- Check reusable: los goals válidos deben coincidir con LEARNING_GOAL_OPTIONS
-- en packages/shared/src/auth/types.ts.
-- Si esa lista cambia, hay que actualizar los checks acá y todas las filas
-- existentes que usen el valor eliminado.

-- teaching_cards
create table public.teaching_cards (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  key text not null,
  title_es text not null,
  body_es text not null,
  sort_order int not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, key),
  unique (lesson_id, sort_order)
);
create index teaching_cards_lesson_order_idx
  on public.teaching_cards (lesson_id, sort_order);

-- teaching_examples (una card tiene N ejemplos; cada uno con su goal opcional)
create table public.teaching_examples (
  id uuid primary key default gen_random_uuid(),
  teaching_card_id uuid not null references public.teaching_cards(id) on delete cascade,
  en text not null,
  es text not null,
  goal text null check (goal in ('travel', 'work', 'study', 'entertainment', 'general')),
  sort_order int not null check (sort_order >= 0),
  created_at timestamptz not null default now()
);
create index teaching_examples_card_order_idx
  on public.teaching_examples (teaching_card_id, sort_order);

-- pronunciation_highlights (frases clave con respelling en español)
create table public.pronunciation_highlights (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  en text not null,
  respelling_es text not null,
  sort_order int not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (lesson_id, sort_order)
);
create index pronunciation_highlights_lesson_order_idx
  on public.pronunciation_highlights (lesson_id, sort_order);

-- Columna goal en exercises (nullable = agnóstico, aplica a todos los goals)
alter table public.exercises
  add column goal text null
  check (goal in ('travel', 'work', 'study', 'entertainment', 'general'));

-- Triggers updated_at (reutiliza public.set_updated_at de 002)
create trigger teaching_cards_updated_at before update on public.teaching_cards
  for each row execute function public.set_updated_at();

-- RLS: lectura pública de contenido de unidades publicadas
alter table public.teaching_cards enable row level security;
alter table public.teaching_examples enable row level security;
alter table public.pronunciation_highlights enable row level security;

create policy "read teaching cards of published units"
  on public.teaching_cards for select to authenticated
  using (exists (
    select 1 from public.lessons l
    join public.units u on u.id = l.unit_id
    where l.id = teaching_cards.lesson_id and u.is_published = true
  ));

create policy "read teaching examples of published units"
  on public.teaching_examples for select to authenticated
  using (exists (
    select 1 from public.teaching_cards tc
    join public.lessons l on l.id = tc.lesson_id
    join public.units u on u.id = l.unit_id
    where tc.id = teaching_examples.teaching_card_id and u.is_published = true
  ));

create policy "read pronunciation highlights of published units"
  on public.pronunciation_highlights for select to authenticated
  using (exists (
    select 1 from public.lessons l
    join public.units u on u.id = l.unit_id
    where l.id = pronunciation_highlights.lesson_id and u.is_published = true
  ));
