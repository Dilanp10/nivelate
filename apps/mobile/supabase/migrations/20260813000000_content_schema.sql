-- Spec 004 — Curriculum & Content
-- Schema del contenido educativo: units → lessons → exercises, + grammar_topics
-- y vocab_items. Todo de lectura pública para usuarios autenticados; la escritura
-- la hace el loader con service_role (se salta RLS).

-- Enum de tipos de ejercicio
create type public.exercise_type as enum (
  'multiple_choice',
  'fill_in_blank',
  'matching',
  'word_order',
  'listening',
  'translation',
  'dialogue'
);

-- units
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

-- lessons
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

-- exercises
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  exercise_key text not null,
  type public.exercise_type not null,
  payload jsonb not null,
  sort_order int not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, exercise_key),
  unique (lesson_id, sort_order)
);
create index exercises_lesson_order_idx on public.exercises (lesson_id, sort_order);

-- grammar_topics
create table public.grammar_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  explanation_es text not null,
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- lesson_grammar_topics (puente)
create table public.lesson_grammar_topics (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  grammar_topic_id uuid not null references public.grammar_topics(id) on delete cascade,
  primary key (lesson_id, grammar_topic_id)
);
-- Covering index del FK grammar_topic_id (el PK ya cubre lesson_id).
create index lesson_grammar_topics_topic_idx
  on public.lesson_grammar_topics (grammar_topic_id);

-- vocab_items
create table public.vocab_items (
  id uuid primary key default gen_random_uuid(),
  term_en text not null,
  term_es text not null,
  example_en text,
  cefr_level text not null check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  created_at timestamptz not null default now(),
  unique (term_en, term_es)
);

-- Triggers updated_at (reutiliza public.set_updated_at de la migración de 002)
create trigger units_updated_at before update on public.units
  for each row execute function public.set_updated_at();
create trigger lessons_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();
create trigger exercises_updated_at before update on public.exercises
  for each row execute function public.set_updated_at();
create trigger grammar_topics_updated_at before update on public.grammar_topics
  for each row execute function public.set_updated_at();

-- RLS: lectura pública de contenido publicado
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.grammar_topics enable row level security;
alter table public.lesson_grammar_topics enable row level security;
alter table public.vocab_items enable row level security;

create policy "read published units"
  on public.units for select to authenticated
  using (is_published = true);

create policy "read lessons of published units"
  on public.lessons for select to authenticated
  using (exists (
    select 1 from public.units u
    where u.id = lessons.unit_id and u.is_published = true
  ));

create policy "read exercises of published units"
  on public.exercises for select to authenticated
  using (exists (
    select 1 from public.lessons l
    join public.units u on u.id = l.unit_id
    where l.id = exercises.lesson_id and u.is_published = true
  ));

create policy "read grammar topics"
  on public.grammar_topics for select to authenticated using (true);
create policy "read lesson grammar topics"
  on public.lesson_grammar_topics for select to authenticated using (true);
create policy "read vocab items"
  on public.vocab_items for select to authenticated using (true);
