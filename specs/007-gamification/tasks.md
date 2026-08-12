# Tasks — 007 Gamification

Cada tarea → un commit. `<tipo>(007): T### — <descripción>`.

## Fase 1 — SQL

- [ ] T001 — Migración `20260816000000_achievements.sql`: `user_achievements` + RLS + función `evaluate_achievements(uuid) returns text[]` + reemplazo de `complete_lesson` devolviendo `newly_unlocked text[]`.
- [ ] T002 — Aplicar. Advisors → cero (esperados los mismos warnings).
- [ ] T003 — Regenerar tipos.
- [ ] T004 — Probar por SQL: primer complete devuelve `newly_unlocked` con `first_lesson`; segundo (mismo día) vacío.

## Fase 2 — Shared

- [ ] T010 — `achievements/types.ts` + `definitions.ts` con los 10.
- [ ] T011 — `evaluate.ts` (`evaluateAchievements(state)`) + tests.
- [ ] T012 — `index.ts` + re-export.

## Fase 3 — Cliente

- [ ] T020 — Actualizar `useCompleteLesson` para leer `newly_unlocked` del RPC.
- [ ] T021 — `useAchievements`.
- [ ] T022 — `AchievementsGrid` + `AchievementCard`.
- [ ] T023 — Sección "Logros" en `progress.tsx`.
- [ ] T024 — Banner discreto en `LessonSummary` con `newly_unlocked`.

## Fase 4 — Verificación + cierre

- [ ] T030 — Verificado en browser: completar lección → banner + grid.
- [ ] T031 — `pnpm typecheck && pnpm lint && pnpm test` verde.
- [ ] T090 — `quickstart.md`.
- [ ] T099 — PR `feat(007): gamification`.
