# Tasks — 005 Lesson Player

Cada tarea → un commit. Formato: `<tipo>(005): T### — <descripción>`.

## Fase 1 — Motor puro (shared) ✅

- [x] T001 — `player/user-answer.ts` (`UserAnswer` + `normalizeText` + `textMatches`).
- [x] T002 — `player/check-answer.ts` (`checkAnswer` para los 7 tipos).
- [x] T003 — 15 tests de `checkAnswer` (correcto/incorrecto por tipo + normalización).
- [x] T004 — `player/lesson-machine.ts` (reducer: cola, re-intento, fases, firstTryCorrect, summarize).
- [x] T005 — 7 tests del reducer.
- [x] T006 — `player/index.ts` + re-export desde `shared/index.ts`.

## Fase 2 — Infra app ✅

- [x] T010 — `lib/tts.ts` (SpeechSynthesis con feature-detect + voz en-*).
- [x] T011 — `hooks/useLesson.ts` (React Query) + `hooks/useFirstLesson.ts`.

## Fase 3 — Renderers ✅

- [x] T020-T026 — Los 7 renderers.
- [x] T027 — `ExerciseRenderer.tsx` (switch) + `isAnswerComplete`.
- [x] T028 — `FeedbackBanner`, `LessonProgress`, `LessonSummary`.

## Fase 4 — Pantalla ✅

- [x] T030 — `(protected)/lesson/[lessonId].tsx` (loading/error/empty + player + summary + onLessonComplete stub).
- [x] T031 — Card "Empezar lección" en la home (linkea a la primera lección publicada).

## Fase 5 — Verificación + cierre

- [x] T040 — Unidad 1 publicada para dev. **Sigue publicada** para que el usuario pruebe el player ya. Bajar con `update units set is_published=false where slug='a2-refresh';` cuando se quiera esconder.
- [x] T041 — **Recorrido verificado en el browser** con un usuario de prueba: MC render, feedback correcto (con explicación en español) e incorrecto (muestra la respuesta), re-encolado del fallado (siguió en 0/8 y volvió al final), progreso 0→1/8.
- [ ] T042 — e2e Playwright del flujo de lección. **Diferido:** requiere sembrar un usuario autenticado + onboarded + contenido publicado, frágil en CI. Cubierto por los 22 unit tests del motor + verificación manual en browser.
- [x] T043 — `pnpm typecheck && pnpm lint && pnpm test` verde (74 unit tests).
- [x] T090 — `quickstart.md`.
- [ ] T099 — PR `feat(005): lesson player` (tras mergear 002/004).

## Notas de la verificación

- **Usuario de prueba** creado en Supabase: `tester@nivelate.local` / `nivelate123`
  (email confirmado por SQL, sin pasar por el flujo de mail). Sirve para entrar
  y probar el player sin la config de auth del dashboard. Borrar cuando no se
  necesite: `delete from auth.users where email='tester@nivelate.local';`.
- **El contenido de la Unidad 1 sigue siendo borrador pedagógico** (T091 de 004):
  aunque esté `is_published=true`, hay que revisarlo antes de considerarlo final.
