-- Spec 001 — Project Bootstrap
-- Tabla efímera de smoke test. Se elimina cuando el módulo 002 (auth) esté mergeado.

create table public._bootstrap_ping (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  note text
);

insert into public._bootstrap_ping (note) values ('bootstrap ok');

alter table public._bootstrap_ping enable row level security;

create policy "public read ping"
  on public._bootstrap_ping
  for select
  to anon
  using (true);
