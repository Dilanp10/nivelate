-- Spec 003 — User Progress
-- xp_events (log inmutable), lesson_completions, contadores en profiles y el RPC
-- atómico complete_lesson (calcula la XP en el server + actualiza racha).

create type public.xp_source as enum ('lesson_complete', 'streak_bonus', 'achievement');

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source public.xp_source not null,
  xp_delta int not null check (xp_delta >= 0),
  lesson_id uuid references public.lessons(id) on delete set null,
  created_at timestamptz not null default now()
);
create index xp_events_user_created_idx on public.xp_events (user_id, created_at desc);
create index xp_events_lesson_idx on public.xp_events (lesson_id);

create table public.lesson_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  total int not null check (total >= 0),
  best_first_try_correct int not null check (best_first_try_correct >= 0),
  times_completed int not null default 1 check (times_completed >= 1),
  first_completed_at timestamptz not null default now(),
  last_completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index lesson_completions_user_idx on public.lesson_completions (user_id);
create index lesson_completions_lesson_idx on public.lesson_completions (lesson_id);

alter table public.profiles
  add column total_xp int not null default 0 check (total_xp >= 0),
  add column current_streak int not null default 0 check (current_streak >= 0),
  add column longest_streak int not null default 0 check (longest_streak >= 0),
  add column last_activity_date date;

-- RLS: cada quien lee solo lo suyo. Escritura solo vía RPC (security definer).
alter table public.xp_events enable row level security;
alter table public.lesson_completions enable row level security;

create policy "read own xp events"
  on public.xp_events for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "read own completions"
  on public.lesson_completions for select to authenticated
  using ((select auth.uid()) = user_id);

-- RPC atómico
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

revoke execute on function public.complete_lesson(uuid, int, int) from public;
revoke execute on function public.complete_lesson(uuid, int, int) from anon;
grant execute on function public.complete_lesson(uuid, int, int) to authenticated;
