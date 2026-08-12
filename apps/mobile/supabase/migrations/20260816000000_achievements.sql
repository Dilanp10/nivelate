-- Spec 007 — Gamification
-- Tabla user_achievements + función evaluate_achievements + reemplazo de
-- complete_lesson para devolver newly_unlocked text[].

create table public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
create index user_achievements_user_idx on public.user_achievements (user_id);

alter table public.user_achievements enable row level security;

create policy "read own achievements"
  on public.user_achievements for select to authenticated
  using ((select auth.uid()) = user_id);

-- evaluate_achievements(user) → ids de logros que DEBERÍAN estar desbloqueados
-- según el estado actual. Idempotente. La lógica espeja lo declarado en
-- packages/shared/src/achievements/definitions.ts.
create or replace function public.evaluate_achievements(p_user uuid)
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids text[] := array[]::text[];
  v_total_xp int;
  v_streak int;
  v_completions int;
  v_has_perfect boolean;
  v_first_unit_done boolean;
begin
  select total_xp, current_streak into v_total_xp, v_streak
  from public.profiles where user_id = p_user;

  select count(*) into v_completions
  from public.lesson_completions where user_id = p_user;

  select exists (
    select 1 from public.lesson_completions
    where user_id = p_user and best_first_try_correct = total
  ) into v_has_perfect;

  -- Primera unidad "hecha": alguna unit publicada con todas sus lessons en
  -- lesson_completions del usuario.
  select exists (
    select 1
    from public.units u
    where u.is_published = true
      and not exists (
        select 1 from public.lessons l
        where l.unit_id = u.id
          and not exists (
            select 1 from public.lesson_completions c
            where c.user_id = p_user and c.lesson_id = l.id
          )
      )
      -- excluir unidades sin lessons
      and exists (select 1 from public.lessons l where l.unit_id = u.id)
  ) into v_first_unit_done;

  if v_completions >= 1 then v_ids := array_append(v_ids, 'first_lesson'); end if;
  if v_completions >= 5 then v_ids := array_append(v_ids, 'five_lessons'); end if;
  if v_first_unit_done then v_ids := array_append(v_ids, 'first_unit'); end if;
  if v_streak >= 3 then v_ids := array_append(v_ids, 'streak_3'); end if;
  if v_streak >= 7 then v_ids := array_append(v_ids, 'streak_7'); end if;
  if v_streak >= 30 then v_ids := array_append(v_ids, 'streak_30'); end if;
  if coalesce(v_total_xp, 0) >= 100 then v_ids := array_append(v_ids, 'xp_100'); end if;
  if coalesce(v_total_xp, 0) >= 500 then v_ids := array_append(v_ids, 'xp_500'); end if;
  if coalesce(v_total_xp, 0) >= 1000 then v_ids := array_append(v_ids, 'xp_1000'); end if;
  if v_has_perfect then v_ids := array_append(v_ids, 'perfect_lesson'); end if;

  return v_ids;
end;
$$;

revoke execute on function public.evaluate_achievements(uuid) from public;
revoke execute on function public.evaluate_achievements(uuid) from anon;
revoke execute on function public.evaluate_achievements(uuid) from authenticated;
-- No la exponemos vía RPC; solo la llama complete_lesson (mismo owner).

-- Reemplazo de complete_lesson agregando el unlock de logros y newly_unlocked
-- en el retorno. Cambio de signature (nueva columna): DROP + CREATE.
drop function public.complete_lesson(uuid, int, int);

create or replace function public.complete_lesson(
  p_lesson_id uuid,
  p_total int,
  p_first_try_correct int
)
returns table (
  xp_awarded int,
  new_total_xp int,
  current_streak int,
  newly_unlocked text[]
)
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
  v_should text[];
  v_new text[];
begin
  if v_user is null then raise exception 'no autenticado'; end if;
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

  -- Evaluar logros con el estado ya actualizado, y quedarse con los nuevos.
  v_should := public.evaluate_achievements(v_user);

  with ins as (
    insert into public.user_achievements (user_id, achievement_id)
    select v_user, id from unnest(v_should) as t(id)
    on conflict (user_id, achievement_id) do nothing
    returning achievement_id
  )
  select coalesce(array_agg(achievement_id), array[]::text[]) into v_new from ins;

  xp_awarded := v_xp;
  new_total_xp := v_new_total;
  current_streak := v_streak;
  newly_unlocked := v_new;
  return next;
end;
$$;

revoke execute on function public.complete_lesson(uuid, int, int) from public;
revoke execute on function public.complete_lesson(uuid, int, int) from anon;
grant execute on function public.complete_lesson(uuid, int, int) to authenticated;
