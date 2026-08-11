-- Spec 002 — Auth (performance)
-- Corrige el lint 0003 auth_rls_initplan del performance advisor.
--
-- Con `auth.uid() = user_id`, Postgres re-evalúa la función por cada fila
-- escaneada. Envolviéndola en `(select auth.uid())` la trata como constante
-- y la evalúa una sola vez por query.
--
-- En profiles no se nota (una fila por usuario), pero el patrón importa para
-- las tablas de los módulos siguientes (progreso, ejercicios, srs_cards),
-- que sí van a tener muchas filas por usuario.

drop policy if exists "user reads own profile" on public.profiles;
drop policy if exists "user updates own profile" on public.profiles;

create policy "user reads own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user updates own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
