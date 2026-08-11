# Tasks — 004 Curriculum & Content

Cada tarea → un commit. Formato: `<tipo>(004): T### — <descripción>`.

## Fase 1 — Schema DB

- [ ] T001 — Migración `20260813000000_content_schema.sql` (enum + units, lessons, exercises, grammar_topics, lesson_grammar_topics, vocab_items + triggers + índices).
- [ ] T002 — RLS de lectura pública de contenido publicado en la misma migración.
- [ ] T003 — Aplicar migración vía MCP.
- [ ] T004 — Correr security + performance advisors; resolver hasta cero.
- [ ] T005 — Regenerar tipos → `packages/shared/src/database.types.ts`.

## Fase 2 — Tipos + validación en shared

- [ ] T010 — `content/types.ts` (Unit, Lesson, ExerciseRow, EXERCISE_TYPES, ExerciseType).
- [ ] T011 — `content/exercise-types.ts` (7 Zod payload schemas + discriminatedUnion `exercisePayloadSchema`).
- [ ] T012 — Tests de los 7 payloads (válidos + inválidos por invariante).
- [ ] T013 — `content/authoring.ts` (Zod schema del archivo de unidad).
- [ ] T014 — Tests del authoring schema.
- [ ] T015 — `content/index.ts` + re-export desde `shared/index.ts`.

## Fase 3 — Tooling

- [ ] T020 — Agregar `tsx` como devDependency raíz.
- [ ] T021 — `scripts/content-validate.ts` + script `content:validate`.
- [ ] T022 — `scripts/content-load.ts` (upsert idempotente con service_role) + script `content:load`.
- [ ] T023 — Documentar `SUPABASE_SERVICE_ROLE_KEY` en `.env.example` (para scripts, no para la app).

## Fase 4 — Seed PoC Unidad 1

- [ ] T030 — `content/units/01-a2-refresh.json` (3-4 lecciones, ~25-30 ejercicios, 7 tipos, borrador).
- [ ] T031 — `pnpm content:validate` verde sobre la Unidad 1.
- [ ] T032 — `pnpm content:load` carga la Unidad 1.
- [ ] T033 — Segundo `content:load` no cambia conteos (idempotencia verificada).

## Fase 5 — Verificación + cierre

- [ ] T040 — Query de ejemplo (unit → lessons → exercises ordenados) devuelve la estructura.
- [ ] T041 — `pnpm typecheck && pnpm lint && pnpm test` verde.
- [ ] T090 — `quickstart.md` con el flujo de autoría + carga verificado.
- [ ] T091 — Revisión humana del contenido de la Unidad 1 antes de `is_published=true`. **Requiere al usuario.**
- [ ] T099 — PR `feat(004): curriculum content`.
