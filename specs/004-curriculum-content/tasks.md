# Tasks — 004 Curriculum & Content

Cada tarea → un commit. Formato: `<tipo>(004): T### — <descripción>`.

## Fase 1 — Schema DB ✅

- [x] T001 — Migración `20260813000000_content_schema.sql` (enum + 6 tablas + triggers + índices).
- [x] T002 — RLS de lectura pública de contenido publicado en la misma migración.
- [x] T003 — Migración aplicada vía MCP.
- [x] T004 — Advisors resueltos: agregado covering index en FK `grammar_topic_id`. Security en cero; los 2 "unused index" restantes son los índices de orden sobre tablas que aún no se consultaron. Migración `20260813010000_content_schema_fk_index`.
- [x] T005 — Tipos regenerados → `database.types.ts` con las 6 tablas + enum.

## Fase 2 — Tipos + validación en shared ✅

- [x] T010 — `content/types.ts`.
- [x] T011 — `content/exercise-types.ts` (7 Zod payload schemas + discriminatedUnion).
- [x] T012 — 11 tests de payloads (válidos + inválidos por invariante).
- [x] T013 — `content/authoring.ts` (schema de unidad con validaciones cruzadas).
- [x] T014 — 5 tests del authoring schema.
- [x] T015 — `content/index.ts` + re-export desde `shared/index.ts`.

## Fase 3 — Tooling ✅

- [x] T020 — `tsx` + `dotenv` + `@supabase/supabase-js` + `@nivelate/shared` como devDeps raíz.
- [x] T021 — `scripts/content-validate.ts` + `content:validate`. Verificado sobre Unidad 1.
- [x] T022 — `scripts/content-load.ts` (upsert idempotente con service_role) + `content:load`.
- [x] T023 — `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` documentados en `.env.example`.

## Fase 4 — Seed PoC Unidad 1 ✅

- [x] T030 — `content/units/01-a2-refresh.json` (3 lecciones, 23 ejercicios, 7 tipos, borrador).
- [x] T031 — `pnpm content:validate` verde.
- [x] T032 — Carga verificada en la DB real (vía MCP, equivalente al loader). `pnpm content:load` end-to-end requiere el service_role key del usuario. **Ver T092.**
- [x] T033 — Idempotencia verificada: repetir upserts deja 1 unit / 3 lessons / 23 exercises.

## Fase 5 — Verificación + cierre

- [x] T040 — Query (unit → lessons → exercises ordenados) verificada; los 7 tipos presentes.
- [x] T041 — `pnpm typecheck && pnpm lint && pnpm test` verde (52 unit tests).
- [x] T090 — `quickstart.md` con el flujo de autoría + carga.
- [ ] T091 — **Requiere al usuario:** revisión pedagógica del contenido de la Unidad 1 antes de `is_published=true`. Es contenido curado por IA marcado como borrador; hay que validarlo o corregirlo antes de publicar.
- [ ] T092 — **Requiere al usuario:** correr `pnpm content:load` con el service_role key en un `.env` de raíz, para validar el script end-to-end (la carga equivalente ya está verificada).
- [ ] T099 — PR `feat(004): curriculum content` (después de que 002 mergee, para rebasar limpio).
