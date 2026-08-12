-- Spec 006 — Review System (SM-2 simplificado)
-- Agrega srs_cards + RPC review_card + reemplaza complete_lesson para sembrar
-- cards al completar una lección.

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
create index srs_cards_exercise_idx on public.srs_cards (exercise_id);

alter table public.srs_cards enable row level security;

create policy "read own srs cards"
  on public.srs_cards for select to authenticated
  using ((select auth.uid()) = user_id);

-- RPC review_card: aplica SM-2 simplificado y persiste. Cliente solo dice correct/incorrect.
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

-- Reemplazo de complete_lesson agregando la siembra de cards. El resto es igual
-- a la versión de 003.
create or replace function public.complete_lesson(
  p_lesson_id uuid,
  p_total int,
  p_first_try_correct int
)
returns table (xp_awarded int, new_total_xp int, current_streak int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_xp int;
  v_today date := current_date;
  v_last date;
  v_streak int;
  v_new_total int;
begin
  if v_user is null then
    raise exception 'no autenticado';
  end if;
  if p_total < 0 or p_first_try_correct < 0 or p_first_try_correct > p_total then
    raise exception 'conteos inválidos';
  end if;
  if not exists (
    select 1 from public.lessons l
    join public.units u on u.id = l.unit_id
    where l.id = p_lesson_id and u.is_published = true
  ) then
    raise exception 'lección no disponible';
  end if;

  v_xp := p_first_try_correct * 10 + (p_total - p_first_try_correct) * 5;

  insert into public.xp_events (user_id, source, xp_delta, lesson_id)
  values (v_user, 'lesson_complete', v_xp, p_lesson_id);

  insert into public.lesson_completions
    (user_id, lesson_id, total, best_first_try_correct, times_completed)
  values (v_user, p_lesson_id, p_total, p_first_try_correct, 1)
  on conflict (user_id, lesson_id) do update set
    total = excluded.total,
    best_first_try_correct = greatest(
      public.lesson_completions.best_first_try_correct, excluded.best_first_try_correct
    ),
    times_completed = public.lesson_completions.times_completed + 1,
    last_completed_at = now();

  -- Siembra de srs_cards para los ejercicios de esta lección.
  -- due_at = mañana; si el card ya existe (repaso previo o completar de nuevo),
  -- no se toca (el intervalo del repaso manda).
  insert into public.srs_cards (user_id, exercise_id, due_at)
  select v_user, e.id, now() + interval '1 day'
  from public.exercises e
  where e.lesson_id = p_lesson_id
  on conflict (user_id, exercise_id) do nothing;

  select last_activity_date, profiles.current_streak into v_last, v_streak
  from public.profiles where user_id = v_user for update;

  if v_last = v_today then
    v_streak := coalesce(v_streak, 0);
  elsif v_last = v_today - 1 then
    v_streak := coalesce(v_streak, 0) + 1;
  else
    v_streak := 1;
  end if;

  update public.profiles set
    total_xp = total_xp + v_xp,
    current_streak = v_streak,
    longest_streak = greatest(longest_streak, v_streak),
    last_activity_date = v_today
  where user_id = v_user
  returning total_xp into v_new_total;

  xp_awarded := v_xp;
  new_total_xp := v_new_total;
  current_streak := v_streak;
  return next;
end;
$$;
