# Tasks — 009 Aprendizaje adaptativo

Cada tarea → un commit. Formato: `<tipo>(009): T### — <descripción breve>`.

## Fase 1 — Schema y contenido base ✅

- [x] T001 — Migración `20260819000000_adaptive_learning.sql`: crear `teaching_cards`, `teaching_examples`, `pronunciation_highlights`, agregar `exercises.goal`, RLS de las 3 tablas nuevas.
- [x] T002 — Aplicada con `apply_migration` (Supabase MCP). Verificado en `list_tables`. Advisors sin regresiones (3 warnings preexistentes, ninguno nuevo).
- [x] T003 — `packages/shared/src/database.types.ts` regenerado con las nuevas tablas y columna.
- [x] T004 — `docs/pronunciation-guide.md` — convención de respelling en español (base R-001).
- [x] T005 — `packages/shared/src/content/types.ts` extendido con `TeachingCard`, `TeachingExample`, `PronunciationHighlight`.
- [x] T006 — `authoring.ts` (Zod) extendido con los schemas nuevos (todo opcional). `authoring.test.ts` con 5 casos nuevos.
- [x] T007 — `scripts/content-load.ts` actualizado: inserta las 3 tablas nuevas y setea `goal` en `exercises`.

## Fase 2 — Lógica pura en shared (con tests) ✅

- [x] T010 — `starting-unit.ts` + `starting-unit.test.ts` (12 tests): `getStartingUnitOrder`, `getStartingUnit`, `skippedUnits`.
- [x] T011 — `goal-filter.ts` + `goal-filter.test.ts` (8 tests): `filterByGoal` con fallback a `general`/`null`, nunca mezcla goals.
- [x] T012 — Exportados desde `packages/shared/src/player/index.ts`.

## Fase 3 — Cliente: teaching cards ✅

- [x] T020 — `TeachingCard.tsx`: título, cuerpo, ejemplos filtrados por goal (`filterByGoal`, minCount 2), botones 🔊, botón "Entendido".
- [x] T021 — Decisión de implementación: en vez de tocar el reducer puro `lessonReducer` (packages/shared), la fase de teaching es estado local simple (`cardIndex`) en `[lessonId].tsx` — sin retry, más simple, sin riesgo sobre el reducer ya testeado de ejercicios. Ver research.md R-002 (la propuesta original sugería un Step unificado; se prefirió la capa local por menor riesgo).
- [x] T022 — `useLesson` trae `teachingCards` + `pronunciationHighlights` en el mismo hook (`Promise.all`).
- [x] T023 — Progress bar cuenta `teachingCards.length + exercises.length`.
- [x] T024 — Integrado en `[lessonId].tsx`: fase teaching antes de exercises.

## Fase 4 — Cliente: pronunciación ✅

- [x] T030 — `PronunciationSummary.tsx`: lista de highlights, respelling, botón 🔊, botón "Continuar".
- [x] T031 — Insertada entre el último ejercicio y `LessonSummary`. Sin highlights → se salta directo al summary.

## Fase 5 — Cliente: adaptación por nivel ✅

- [x] T040 — `useStartingUnit.ts`: unidad de arranque combinando catálogo publicado + `getStartingUnitOrder`.
- [x] T041 — `useFirstLesson` reescrito: primera lección no completada desde la unidad de arranque en adelante (antes ignoraba completions y siempre devolvía la lección 1).
- [x] T042 — Badge "Opcional — repaso" en `progress.tsx` para unidades previas a la de arranque.
- [x] T043 — Enlace "¿Muy difícil? Empezá desde el principio →", visible solo cuando el catálogo *publicado* permite un salto real (no solo cuando el self_level lo sugiere — verificado con self_level temporal en browser).

## Fase 6 — Contenido

- [x] T050 — U1: teaching cards para las 3 lecciones (2 cada una, 5 ejemplos por card cubriendo los 5 goals).
- [x] T051 — U1: pronunciation highlights para las 3 lecciones (6 cada una).
- [x] T052 — U1: 1 ejercicio etiquetado con `goal='work'` donde el contexto era inequívoco (el resto queda `null`/agnóstico, por diseño).
- [ ] T053 — U2/U3 (draft): teaching cards. **Bloqueado** por la revisión pedagógica pendiente del usuario — queda para cuando se publiquen.
- [ ] T054 — U2/U3: pronunciation highlights. Idem.

## Fase 7 — Verificación y cierre ✅

- [x] T080 — Tests unitarios verdes: 128 tests (`goal-filter`, `starting-unit`, Zod nuevo incluidos).
- [x] T081 — `lesson-flow.spec.ts` reescrito para cubrir teaching cards + pantalla de pronunciación, con planes de respuesta para las 3 lecciones de U1 (necesario porque la CTA ahora es completion-aware, ver T041).
- [x] T082 — Verificación manual en browser: 2 perfiles de goal distintos (travel, work) mostrando ejemplos contextualizados + fallback general; self_level intermediate sin catálogo suficiente no muestra badge/enlace falsos positivos.
- [x] T083 — `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e` — todo verde (128 unit + 10 E2E).
- [x] T090 — `quickstart.md` escrito.
- [ ] T099 — PR `feat(009): adaptive learning` (rama `009-adaptive-learning` → `main`). Pendiente de decisión del usuario sobre cuándo abrir/mergear.
