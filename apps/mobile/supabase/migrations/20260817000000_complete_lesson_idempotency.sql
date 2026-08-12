-- Fix (code review chore/polish): complete_lesson podía duplicar XP si la
-- respuesta del primer intento se perdía por red y el cliente reintentaba
-- (el server ya había ejecutado el insert de xp_events + update de profiles;
-- el retry corría todo de nuevo).
--
-- Agrega idempotencia: el cliente manda un p_idempotency_key (uuid v4 generado
-- una vez por "intento de completar esta lección"). Si ya se procesó esa key,
-- se devuelve el resultado guardado sin volver a tocar XP/racha/logros/srs.

create table public.lesson_completion_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key uuid not null,
  xp_awarded int not null,
  new_total_xp int not null,
  current_streak int not null,
  newly_unlocked text[] not null,
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key)
);

alter table public.lesson_completion_attempts enable row level security;

create policy "read own completion attempts"
  on public.lesson_completion_attempts for select to authenticated
  using ((select auth.uid()) = user_id);

drop function public.complete_lesson(uuid, int, int);

create or replace function public.complete_lesson(
  p_lesson_id uuid,
  p_total int,
  p_first_try_correct int,
  p_idempotency_key uuid default null
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
  v_existing record;
begin
  if v_user is null then raise exception 'no autenticado'; end if;
  if p_total < 0 or p_first_try_correct < 0 or p_first_try_correct > p_total then
    raise exception 'conteos inválidos';
  end if;

  -- Idempotencia: si esta key ya se procesó, devolver el resultado guardado
  -- sin volver a otorgar XP ni tocar racha/logros/srs.
  if p_idempotency_key is not null then
    select * into v_existing
    from public.lesson_completion_attempts
    where user_id = v_user and idempotency_key = p_idempotency_key;

    if found then
      xp_awarded := v_existing.xp_awarded;
      new_total_xp := v_existing.new_total_xp;
      current_streak := v_existing.current_streak;
      newly_unlocked := v_existing.newly_unlocked;
      return next;
      return;
    end if;
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

  if p_idempotency_key is not null then
    insert into public.lesson_completion_attempts
      (user_id, idempotency_key, xp_awarded, new_total_xp, current_streak, newly_unlocked)
    values (v_user, p_idempotency_key, xp_awarded, new_total_xp, current_streak, newly_unlocked)
    on conflict (user_id, idempotency_key) do nothing;
  end if;

  return next;
end;
$$;

revoke execute on function public.complete_lesson(uuid, int, int, uuid) from public;
revoke execute on function public.complete_lesson(uuid, int, int, uuid) from anon;
grant execute on function public.complete_lesson(uuid, int, int, uuid) to authenticated;
