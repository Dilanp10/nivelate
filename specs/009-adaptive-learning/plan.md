# Plan — 009 Aprendizaje adaptativo

## Arquitectura

```
docs/
└── pronunciation-guide.md            # convención de respelling en español

packages/shared/src/
├── content/
│   ├── types.ts                      # + TeachingCard, TeachingExample, PronunciationHighlight
│   ├── authoring.ts                  # + schemas Zod nuevos
│   └── authoring.test.ts             # + tests de validación
├── player/
│   ├── goal-filter.ts                # nueva: filterByGoal(items, userGoal, minCount)
│   ├── goal-filter.test.ts
│   ├── starting-unit.ts              # nueva: getStartingUnitOrder(selfLevel)
│   └── starting-unit.test.ts
├── database.types.ts                 # regenerado
└── index.ts                          # export nuevos módulos

apps/mobile/src/
├── player/
│   ├── TeachingCard.tsx              # nuevo renderer
│   ├── PronunciationSummary.tsx      # nuevo — pantalla final antes de XP
│   ├── ExerciseRenderer.tsx          # orquestador — soporta TeachingStep
│   ├── LessonProgress.tsx            # progress bar cuenta cards + ejercicios
│   └── LessonRunner (reducer)        # + tipo Step (teaching | exercise)
├── hooks/
│   ├── useLessonContent.ts           # + trae teachingCards + highlights
│   └── useStartingUnit.ts            # nuevo — devuelve la unidad de arranque
└── lib/speak.ts                      # reusar (existe de 005)

apps/mobile/app/(protected)/
├── index.tsx                         # CTA apunta a la unidad de arranque
└── progress.tsx                      # marca unidades previas como "Opcional — repaso"

supabase/migrations/
└── 20260819000000_adaptive_learning.sql

content/units/
├── 01-a2-refresh.json                # + teachingCards + pronunciationHighlights
├── 02-now-and-then.json              # + teachingCards + pronunciationHighlights
└── 03-experiences-so-far.json        # + teachingCards + pronunciationHighlights
```

## Orden

### Fase 1 — Schema y contenido base

1. Migración SQL: 3 tablas nuevas + `exercises.goal` + RLS. Regenerar tipos. Advisors debe seguir en verde (esperados los warnings de siempre).
2. Extender tipos y Zod en `packages/shared/src/content/` — todo opcional, sin breaking en U1/U2/U3 existentes.
3. `docs/pronunciation-guide.md` con la convención de respelling.
4. Actualizar el seed script (o el que hoy inserta el JSON en Supabase) para que además inserte las nuevas tablas.

### Fase 2 — Lógica pura en shared (con tests)

5. `starting-unit.ts` + test — mapping `SelfLevel` → `sortOrder` de la unidad de arranque, con fallback si no existe.
6. `goal-filter.ts` + test — priorizar match exacto, completar con `general`/`null`, nunca mezclar goals.

### Fase 3 — Cliente: teaching cards

7. `TeachingCard.tsx` — componente con título, cuerpo, lista de ejemplos filtrados por goal, botones 🔊, botón "Entendido".
8. Extender el reducer del `LessonRunner` para el tipo `Step = TeachingStep | ExerciseStep`.
9. `useLessonContent` trae `teachingCards` y `pronunciationHighlights` junto con la lección.
10. `LessonProgress` cuenta cards + ejercicios en el total.

### Fase 4 — Cliente: pronunciación

11. `PronunciationSummary.tsx` — pantalla con lista de highlights + 🔊 por frase + botón "Continuar".
12. Insertar `PronunciationSummary` entre el último ejercicio y `LessonSummary` en el flujo. Si no hay highlights, saltar directo al summary.

### Fase 5 — Cliente: adaptación por nivel

13. `useStartingUnit` — devuelve la unidad de arranque según el perfil.
14. En `(protected)/index.tsx` (dashboard), la CTA "Empezar lección" apunta a la primera lección no completada de la unidad de arranque en adelante.
15. En `(protected)/progress.tsx`, unidades previas al arranque se muestran con badge "Opcional — repaso" pero siguen navegables.
16. Enlace discreto "¿Muy difícil? Empezá desde el principio →" en el header de las unidades ≥ arranque, solo si `self_level in ('conversational', 'intermediate')`.

### Fase 6 — Contenido

17. Escribir teaching cards y pronunciation highlights para U1 (publicada — bloqueante).
18. Etiquetar con `goal` los ejemplos y ejercicios existentes donde el contexto sea claro (mayormente queda como `null`/`general`).
19. Escribir teaching cards y highlights para U2/U3 (dependen de la revisión pedagógica pendiente — puede quedar para PR posterior).

### Fase 7 — Verificación

20. Tests unitarios verdes (`goal-filter`, `starting-unit`, Zod nuevo).
21. E2E: `lesson-flow.spec.ts` extendido para cubrir teaching cards + pronunciation screen.
22. Verificación manual en browser con usuarios de prueba de distintos `learning_goal` y `self_level`.
23. Lighthouse / Advisors — sin regresiones.

## Decisiones (research)

- **R-001**: respelling en español propio, con convención documentada.
- **R-002**: teaching cards como Step del `LessonRunner`, no pantalla aparte.
- **R-003**: tablas normalizadas (`teaching_cards`, `teaching_examples`, `pronunciation_highlights`).
- **R-004**: fallback `matches → general → null`, sin mezclar goals.
- **R-005**: Web Speech API con `en-US`, `rate 0.9`, sin fijar voice.
- **R-006**: unidad de arranque calculada en runtime, no persistida.
- **R-007**: progress bar = cards + ejercicios; XP solo de ejercicios.
- **R-008**: tablas vacías al aplicar migración, se pueblan con seed.
- **R-009**: botón "muy difícil" solo si arrancó saltando unidades.
- **R-010**: sin nuevos logros en este módulo.

## Riesgos

- **U2/U3 sin contenido nuevo al mergear** → el módulo entra sin teaching cards para esas unidades; la app las muestra como antes (solo ejercicios). Aceptable, se completa en PR posterior.
- **Regeneración de tipos** puede introducir cambios de shape en `Database` que rompan otros archivos → tratable con `pnpm typecheck` tras la migración.
- **Layout del `PronunciationSummary` en mobile** — lista larga con audio puede desbordar. Usar scroll interno y limitar a 10 items (ya en el schema).

## Estimación

- Fase 1: 2h (migración + Zod + seed + guide).
- Fase 2: 1h (dos funciones puras con tests).
- Fase 3: 3h (renderer + reducer + hook + progress).
- Fase 4: 2h (renderer + integración en flujo).
- Fase 5: 2h (dashboard + progress + botón "muy difícil").
- Fase 6: variable — depende de cuánto contenido escribamos (2-6h).
- Fase 7: 2h (E2E + verificación manual).

**Total ~14-18h** de trabajo, sin contar la revisión pedagógica.
