# Tasks — 009 Aprendizaje adaptativo

Cada tarea → un commit. Formato: `<tipo>(009): T### — <descripción breve>`.

## Fase 1 — Schema y contenido base

- [ ] T001 — Migración `20260819000000_adaptive_learning.sql`: crear `teaching_cards`, `teaching_examples`, `pronunciation_highlights`, agregar `exercises.goal`, RLS de las 3 tablas nuevas.
- [ ] T002 — Aplicar migración con `apply_migration` (Supabase MCP). Verificar en `list_tables`. Advisors → sin regresiones nuevas.
- [ ] T003 — Regenerar `packages/shared/src/database.types.ts` con las nuevas tablas y columna.
- [ ] T004 — `docs/pronunciation-guide.md` — convención de respelling en español (base R-001).
- [ ] T005 — Extender `packages/shared/src/content/types.ts` con `TeachingCard`, `TeachingExample`, `PronunciationHighlight`.
- [ ] T006 — Extender `packages/shared/src/content/authoring.ts` (Zod) con los schemas nuevos (todo opcional). Actualizar `authoring.test.ts` con casos válidos e inválidos.
- [ ] T007 — Actualizar el seed/tooling de contenido (el que hoy inserta el JSON en Supabase) para que además inserte las 3 tablas nuevas y setee `goal` en `exercises`.

## Fase 2 — Lógica pura en shared (con tests)

- [ ] T010 — `packages/shared/src/player/starting-unit.ts` + `starting-unit.test.ts`: `getStartingUnitOrder(selfLevel)` + `getStartingUnit(selfLevel, units)`.
- [ ] T011 — `packages/shared/src/player/goal-filter.ts` + `goal-filter.test.ts`: `filterByGoal(items, userGoal, minCount)` con fallback a `general`/`null`.
- [ ] T012 — Exportar los nuevos módulos desde `packages/shared/src/index.ts`.

## Fase 3 — Cliente: teaching cards

- [ ] T020 — `apps/mobile/src/player/TeachingCard.tsx`: componente puro con título, cuerpo, ejemplos filtrados por goal, botones 🔊, botón "Entendido".
- [ ] T021 — Extender el reducer del `LessonRunner` (donde vive el `Step` type) para soportar `TeachingStep | ExerciseStep`. `checkAnswer` solo aplica a `ExerciseStep`.
- [ ] T022 — `useLessonContent` (o el hook actual que trae la lección) trae `teachingCards` y `pronunciationHighlights` en el mismo query.
- [ ] T023 — `LessonProgress` cuenta cards + ejercicios en el total.
- [ ] T024 — Integrar el orquestador en `ExerciseRenderer.tsx` (o donde viva) para renderizar `TeachingCard` cuando el step actual es de tipo teaching.

## Fase 4 — Cliente: pronunciación

- [ ] T030 — `apps/mobile/src/player/PronunciationSummary.tsx`: lista de highlights con frase en inglés, respelling debajo, botón 🔊, botón "Continuar".
- [ ] T031 — Insertar `PronunciationSummary` entre el último ejercicio y `LessonSummary`. Si no hay highlights, saltar directo al summary.

## Fase 5 — Cliente: adaptación por nivel

- [ ] T040 — `apps/mobile/src/hooks/useStartingUnit.ts`: devuelve la unidad de arranque combinando `useProfile()` + `useUnits()`.
- [ ] T041 — En `apps/mobile/app/(protected)/index.tsx`, la CTA "Empezar lección" apunta a la primera lección no completada de la unidad de arranque.
- [ ] T042 — En `apps/mobile/app/(protected)/progress.tsx`, unidades con `sortOrder < startingUnit.sortOrder` reciben un badge "Opcional — repaso". Siguen navegables.
- [ ] T043 — Enlace discreto "¿Muy difícil? Empezá desde el principio →" en el header de las unidades ≥ arranque, condicionado a `self_level in ('conversational', 'intermediate')`.

## Fase 6 — Contenido

- [ ] T050 — U1 (publicada): teaching cards para las 3 lecciones.
- [ ] T051 — U1: pronunciation highlights para las 3 lecciones.
- [ ] T052 — U1: etiquetar con `goal` los ejemplos y ejercicios donde el contexto sea claro (mucho quedará como `null`).
- [ ] T053 — U2/U3 (draft): teaching cards. Va junto con la aprobación pedagógica pendiente — puede quedar para PR posterior.
- [ ] T054 — U2/U3: pronunciation highlights. Idem.

## Fase 7 — Verificación y cierre

- [ ] T080 — Tests unitarios verdes: `pnpm --filter @nivelate/shared test` incluye `goal-filter`, `starting-unit`, Zod nuevo.
- [ ] T081 — E2E: extender `tests/e2e/lesson-flow.spec.ts` para verificar teaching cards + pantalla de pronunciación aparecen en el flujo.
- [ ] T082 — Verificación manual en browser con usuarios de prueba de distintos `learning_goal` (travel vs work) y `self_level` (zero vs intermediate). Screenshots.
- [ ] T083 — `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e` verde.
- [ ] T090 — `quickstart.md` con pasos para probar el módulo end-to-end.
- [ ] T099 — PR `feat(009): adaptive learning` (rama `009-adaptive-learning`).
