# Plan — 004 Curriculum & Content

## Arquitectura

```
packages/shared/src/content/
├── types.ts               # Unit, Lesson, ExerciseRow, ExerciseType (desde DB types)
├── exercise-types.ts      # Zod schemas + tipos de cada payload + discriminatedUnion
├── authoring.ts           # Zod schema del archivo de autoría (unit → lessons → exercises)
├── index.ts
└── *.test.ts              # tests de los schemas (payloads válidos/ inválidos)

content/
└── units/
    └── 01-a2-refresh.json # seed PoC (borrador, is_published:false)

scripts/
├── content-validate.ts    # valida content/units/*.json contra authoring schema
└── content-load.ts        # upsert idempotente a Supabase con service_role

apps/mobile/supabase/migrations/
└── 20260813000000_content_schema.sql
```

## Orden de implementación

### Fase 1 — Schema en la DB
1. Migración `content_schema.sql` (enum + 6 tablas + triggers + RLS + índices).
2. Aplicar vía MCP. Correr advisors (security + performance), resolver.
3. Regenerar tipos → `database.types.ts`.

### Fase 2 — Tipos y validación en shared (con tests)
4. `content/types.ts` (re-export desde DB types + `EXERCISE_TYPES`).
5. `content/exercise-types.ts` (7 Zod payload schemas + discriminatedUnion) + tests.
6. `content/authoring.ts` (schema del archivo de unidad) + tests.
7. `content/index.ts` + re-export desde `shared/index.ts`.

### Fase 3 — Tooling
8. `scripts/content-validate.ts` + script `content:validate` en package.json.
9. `scripts/content-load.ts` + script `content:load`. Usa `SUPABASE_SERVICE_ROLE_KEY` de un `.env` de scripts. `tsx` como runner.
10. Documentar el service_role key en `.env.example`.

### Fase 4 — Seed PoC Unidad 1
11. `content/units/01-a2-refresh.json`: 3-4 lecciones, ~25-30 ejercicios cubriendo los 7 tipos. **Borrador** (`isPublished: false`).
12. `pnpm content:validate` verde.
13. `pnpm content:load` carga la unidad; segundo run no cambia conteos.

### Fase 5 — Verificación
14. Query de ejemplo (unit → lessons → exercises ordenados) devuelve la estructura.
15. `pnpm typecheck && pnpm lint && pnpm test` verde.
16. Quickstart documentado.
17. PR `feat(004): curriculum content`.

## Decisiones clave (de research.md)

- `exercises` = `type` (enum) + `payload` JSONB. Validación fina por Zod en el loader.
- Idempotencia por claves naturales: `units.slug`, `lessons(unit_id,slug)`, `exercises(lesson_id,exercise_key)`.
- Loader con **service_role** (escribe salteando RLS); nunca desde la app.
- Contenido carga como **borrador** (`is_published=false`); publicar es decisión editorial.

## Nota sobre dependencia con 002

Este módulo se ramifica desde `002-auth` (aún no mergeado) porque necesita `auth.users`/`authenticated` para las políticas RLS y reutiliza `set_updated_at()`. Cuando 002 se mergee a main, esta rama se rebasa.

## Fuera del plan

- Renderizar los ejercicios (005).
- Progreso/SRS (003/006).
- Cargar las 10 unidades completas (se hace con el mismo tooling después).
