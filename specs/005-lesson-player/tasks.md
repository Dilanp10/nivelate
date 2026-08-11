# Tasks — 005 Lesson Player

Cada tarea → un commit. Formato: `<tipo>(005): T### — <descripción>`.

## Fase 1 — Motor puro (shared)

- [ ] T001 — `player/user-answer.ts` (tipos `UserAnswer` + `normalizeText`).
- [ ] T002 — `player/check-answer.ts` (`checkAnswer` para los 7 tipos).
- [ ] T003 — Tests de `checkAnswer` (correcto/incorrecto + normalización).
- [ ] T004 — `player/lesson-machine.ts` (reducer: cola, re-intento, fases, firstTryCorrect).
- [ ] T005 — Tests del reducer.
- [ ] T006 — `player/index.ts` + re-export desde `shared/index.ts`.

## Fase 2 — Infra app

- [ ] T010 — `lib/tts.ts` (SpeechSynthesis con feature-detect + selección de voz en-*).
- [ ] T011 — `hooks/useLesson.ts` (React Query: lesson + exercises ordenados).

## Fase 3 — Renderers

- [ ] T020 — `MultipleChoiceExercise.tsx`.
- [ ] T021 — `FillInBlankExercise.tsx`.
- [ ] T022 — `MatchingExercise.tsx`.
- [ ] T023 — `WordOrderExercise.tsx`.
- [ ] T024 — `ListeningExercise.tsx` (usa tts).
- [ ] T025 — `TranslationExercise.tsx`.
- [ ] T026 — `DialogueExercise.tsx`.
- [ ] T027 — `ExerciseRenderer.tsx` (switch por type).
- [ ] T028 — `FeedbackBanner.tsx`, `LessonProgress.tsx`, `LessonSummary.tsx`.

## Fase 4 — Pantalla

- [ ] T030 — `(protected)/lesson/[lessonId].tsx` (orquesta player + feedback + summary).
- [ ] T031 — Link desde la home a la primera lección.

## Fase 5 — Verificación + cierre

- [ ] T040 — Publicar temporalmente la Unidad 1 en dev para probar (o flag).
- [ ] T041 — Recorrer una lección completa en el browser (fallar + reintentar + resumen).
- [ ] T042 — e2e Playwright del flujo mínimo de lección.
- [ ] T043 — `pnpm typecheck && pnpm lint && pnpm test` verde.
- [ ] T090 — `quickstart.md`.
- [ ] T099 — PR `feat(005): lesson player`.
