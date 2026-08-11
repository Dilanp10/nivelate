-- Spec 002 — Auth (hardening)
-- Corrige 3 advertencias del security advisor de Supabase sobre la migración
-- 20260812000000_profiles.sql.

-- Fix 1 (lint 0011 function_search_path_mutable):
-- set_updated_at no tenía search_path fijo. Con search_path mutable, un rol
-- podría anteponer un schema propio y secuestrar la resolución de nombres.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Fix 2 y 3 (lints 0028 y 0029):
-- handle_new_user es SECURITY DEFINER y PostgREST la exponía como RPC en
-- /rest/v1/rpc/handle_new_user, invocable por anon y por authenticated.
-- Solo debe ejecutarse como trigger sobre auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- Nota: revocar EXECUTE no rompe el trigger. Los triggers corren con los
-- permisos del owner de la tabla, no del rol que dispara el INSERT.
-- Verificado insertando un usuario de prueba en auth.users: el profile se
-- creó con daily_goal_min=10 y onboarded_at NULL.
