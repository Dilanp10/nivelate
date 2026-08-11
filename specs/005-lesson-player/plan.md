# Plan — 005 Lesson Player

## Arquitectura

```
packages/shared/src/player/
├── user-answer.ts         # tipos UserAnswer (unión por tipo) + normalización de texto
├── check-answer.ts        # checkAnswer(exercise, answer) → CheckResult (puro)
├── lesson-machine.ts      # reducer de la lección (cola + re-intento + fases)
├── index.ts
└── *.test.ts

apps/mobile/src/
├── lib/tts.ts             # speak(text, lang) con SpeechSynthesis
├── hooks/useLesson.ts     # React Query: lesson + exercises ordenados
└── player/
    ├── ExerciseRenderer.tsx        # switch por type
    ├── exercises/
    │   ├── MultipleChoiceExercise.tsx
    │   ├── FillInBlankExercise.tsx
    │   ├── MatchingExercise.tsx
    │   ├── WordOrderExercise.tsx
    │   ├── ListeningExercise.tsx
    │   ├── TranslationExercise.tsx
    │   └── DialogueExercise.tsx
    ├── FeedbackBanner.tsx
    ├── LessonProgress.tsx
    └── LessonSummary.tsx

apps/mobile/app/(protected)/
└── lesson/[lessonId].tsx  # pantalla que orquesta el player
```

## Orden de implementación

### Fase 1 — Motor puro (shared, con tests)
1. `player/user-answer.ts` — `UserAnswer` + `normalizeText`.
2. `player/check-answer.ts` — `checkAnswer` para los 7 tipos.
3. Tests de `checkAnswer` (correcto/incorrecto por tipo + normalización).
4. `player/lesson-machine.ts` — reducer (cola, re-intento, fases, `firstTryCorrect`).
5. Tests del reducer (fallar reencola; acertar completa; resumen correcto).
6. `player/index.ts` + re-export desde `shared`.

### Fase 2 — Infra de la app
7. `lib/tts.ts` — wrapper SpeechSynthesis con feature-detect.
8. `hooks/useLesson.ts` — React Query.

### Fase 3 — Renderers
9. Los 7 componentes de ejercicio + `ExerciseRenderer` (switch).
10. `FeedbackBanner`, `LessonProgress`, `LessonSummary`.

### Fase 4 — Pantalla
11. `(protected)/lesson/[lessonId].tsx` — orquesta: useLesson + lesson-machine + renderers + feedback + summary + `onLessonComplete`.
12. Link desde la home a una lección (para poder entrar).

### Fase 5 — Verificación
13. Publicar temporalmente la Unidad 1 en dev (o flag) para probar en browser.
14. Recorrer una lección completa en el browser (incluye fallar y reintentar).
15. e2e Playwright del flujo mínimo.
16. `pnpm typecheck && pnpm lint && pnpm test` verde.
17. Quickstart + PR.

## Decisiones clave (de research.md)

- `checkAnswer` y el reducer son **puros** en `shared` → el grueso de la lógica se testea sin UI.
- Re-intento sin castigo: fallar reencola, no descuenta nada.
- Normalización de texto explícita y testeada.
- TTS con feature-detect; nunca bloquea el ejercicio.
- `onLessonComplete(result)` es la costura con 003 (progreso); acá se stubbea.

## Dependencia con 003

005 **emite** `LessonResult` pero no lo persiste. Cuando exista 003, `onLessonComplete` hará el insert a `xp_events` y actualizará racha. Hasta entonces, loguea + navega a la home.

## Fuera del plan

- SRS (006), gamificación visual (007), offline (008).
- Reanudar lección a mitad tras cerrar la app.
