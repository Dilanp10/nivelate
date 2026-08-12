# Tasks — 007 Gamification

Cada tarea → un commit. `<tipo>(007): T### — <descripción>`.

## Fase 1 — SQL ✅

- [x] T001 — Migración `20260816000000_achievements.sql`: user_achievements + RLS + evaluate_achievements + drop+create de complete_lesson devolviendo newly_unlocked.
- [x] T002 — Aplicada. Bug encontrado y arreglado en migración de patch `20260816010000_achievements_fix_append.sql` (concatenación `v_ids || 'str'` fallaba: Postgres lo casteaba como array literal → `array_append`).
- [x] T003 — Tipos regenerados con user_achievements + evaluate_achievements + nuevo shape de complete_lesson.
- [x] T004 — Probado por SQL: primer complete devolvió `[first_lesson, perfect_lesson]`; segundo (llevó xp a 100) devolvió `[xp_100]`. Los ya desbloqueados no reaparecen. ✓

## Fase 2 — Shared ✅

- [x] T010 — types + definitions con los 10 logros ES.
- [x] T011 — evaluate.ts + 7 tests.
- [x] T012 — index + re-export. Total 98 unit tests.

## Fase 3 — Cliente ✅

- [x] T020 — CompleteLessonResult ahora tiene newly_unlocked; useCompleteLesson invalida ['user-achievements'].
- [x] T021 — useAchievements cruza ACHIEVEMENTS con user_achievements.
- [x] T022 — AchievementsGrid (2 col, unlocked color, locked silueta con "?").
- [x] T023 — Sección "Logros" al final de progress.tsx.
- [x] T024 — Banner discreto "🏅 Desbloqueaste: X, Y" en LessonSummary.

## Fase 4 — Verificación + cierre

- [x] T030 — **Verificado desde el browser autenticado** (fetch directo al PostgREST con la sesión real): primer complete 8/8 devolvió `{xp_awarded:80, new_total_xp:80, current_streak:1, newly_unlocked:["first_lesson","perfect_lesson"]}`; segundo complete `{new_total_xp:160, newly_unlocked:["xp_100"]}`; user_achievements persistidos: `["first_lesson","perfect_lesson","xp_100"]`. La home reflejó Nivel 2 / 160 XP.
- [x] T031 — `pnpm typecheck && pnpm lint && pnpm test` verde (98 unit tests).
- [x] T090 — `quickstart.md`.
- [ ] T099 — PR `feat(007): gamification` (tras mergear la cadena 002→004→005→003→006→007).
