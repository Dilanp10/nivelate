# Tasks — 003 User Progress

Cada tarea → un commit. Formato: `<tipo>(003): T### — <descripción>`.

## Fase 1 — Schema + RPC

- [ ] T001 — Migración `20260814000000_progress.sql` (enum xp_source, xp_events, lesson_completions, columnas en profiles, índices, RLS).
- [ ] T002 — RPC `complete_lesson` en la misma migración (security definer, XP server-side, racha, EXECUTE solo a authenticated).
- [ ] T003 — Aplicar vía MCP. Advisors (security + performance) → cero.
- [ ] T004 — Regenerar tipos → `database.types.ts`.
- [ ] T005 — Probar el RPC por SQL: completar, verificar efectos; rechazar conteos inválidos; XP la fija el server.

## Fase 2 — Lógica pura (shared)

- [ ] T010 — `progress/level.ts` (`levelForXp`) + tests.
- [ ] T011 — `progress/streak.ts` (`nextStreak`) + tests.
- [ ] T012 — `progress/types.ts` + `index.ts` + re-export desde `shared`.

## Fase 3 — Hooks + integración

- [ ] T020 — `hooks/useCompleteLesson.ts` (RPC).
- [ ] T021 — `hooks/useProgress.ts` (counters + % por unidad + global).
- [ ] T022 — Enchufar `onLessonComplete` en la pantalla de lección (RPC + XP del server + error/reintento).

## Fase 4 — UI

- [ ] T030 — `(protected)/progress.tsx` ("Mi progreso").
- [ ] T031 — Home: widget racha + barra XP + link a "Mi progreso".

## Fase 5 — Verificación + cierre

- [ ] T040 — Recorrido en browser: completar lección → XP/racha en resumen y en Mi progreso.
- [ ] T041 — `pnpm typecheck && pnpm lint && pnpm test` verde.
- [ ] T090 — `quickstart.md`.
- [ ] T099 — PR `feat(003): user progress`.
