# Tasks — 003 User Progress

Cada tarea → un commit. Formato: `<tipo>(003): T### — <descripción>`.

## Fase 1 — Schema + RPC ✅

- [x] T001 — Migración `20260814000000_progress.sql` (enum, xp_events, lesson_completions, columnas en profiles, índices, RLS).
- [x] T002 — RPC `complete_lesson` (security definer, XP server-side, racha, EXECUTE solo a authenticated).
- [x] T003 — Aplicado. Advisors: security OK (el warning de `complete_lesson` ejecutable por authenticated es por diseño); performance solo "unused index" sobre tablas nuevas. **Aparte:** el advisor marcó `leaked_password_protection` deshabilitado — es config de auth del dashboard (como T004 de 002), no de esta migración.
- [x] T004 — Tipos regenerados con las 3 tablas + la function `complete_lesson`.
- [x] T005 — RPC probado por SQL: completar 8/6→70xp/racha1; conteos inválidos rechazados; repetir mismo día→total 150/racha 1/times 2. ✓

## Fase 2 — Lógica pura (shared) ✅

- [x] T010 — `progress/level.ts` (`levelForXp`) + tests.
- [x] T011 — `progress/streak.ts` (`nextStreak` + `daysBetween`) + tests.
- [x] T012 — `progress/types.ts` + `index.ts` + re-export. 12 tests, total 86.

## Fase 3 — Hooks + integración ✅

- [x] T020 — `hooks/useCompleteLesson.ts` (RPC; solo manda conteos).
- [x] T021 — `hooks/useProgress.ts` (% por unidad + global ponderado).
- [x] T022 — `onLessonComplete` enchufado: RPC en el resumen (useEffect, una vez), XP del server, saving + error/reintento.

## Fase 4 — UI ✅

- [x] T030 — `(protected)/progress.tsx` (nivel+XP, racha actual/mejor, % por unidad, % global, empty state).
- [x] T031 — Home: widget racha + nivel/XP + links a Mi progreso.

## Fase 5 — Verificación + cierre

- [x] T040 — **Verificado en browser**: completé la lección 8/8; resumen mostró +80 XP (server) y 🔥 1 día; home pasó a Nivel 1 / 80 XP / 🔥 1; "Mi progreso" mostró 80/100 para nivel 2, A2 Refresh 1/3, y Camino A2→B1 33% (1 de 3).
- [x] T041 — `pnpm typecheck && pnpm lint && pnpm test` verde (86 unit tests).
- [x] T090 — `quickstart.md`.
- [ ] T099 — PR `feat(003): user progress` (tras mergear la cadena 002→004→005).
