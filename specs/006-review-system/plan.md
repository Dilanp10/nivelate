# Plan — 006 Review System

## Arquitectura

```
packages/shared/src/srs/
├── sm2.ts               # nextCard({ ease, interval, reps }, correct) — puro
├── types.ts
├── index.ts
└── sm2.test.ts

apps/mobile/src/
├── hooks/
│   ├── useDueCards.ts       # trae cards due (limit 20)
│   ├── useDueCardCount.ts   # count para el badge de home
│   └── useReviewCard.ts     # RPC review_card
└── review/
    ├── ReviewRunner.tsx     # sesión de repaso (reusa renderers de 005)
    └── ReviewSummary.tsx

apps/mobile/app/(protected)/
├── index.tsx           # + badge "Tenés N para repasar"
└── review.tsx          # entra al ReviewRunner

apps/mobile/supabase/migrations/
└── 20260815000000_srs.sql
```

## Orden de implementación

### Fase 1 — Schema + RPC + patch a complete_lesson
1. Migración `srs.sql` (tabla + RLS + RPC review_card + reemplazo de complete_lesson con siembra).
2. Aplicar. Advisors → cero. Regenerar tipos.
3. Probar por SQL:
   - Completar una lección → aparecen cards con `due_at = now() + 1d`.
   - `review_card(correct=true)` sobre card virgen → `interval=1`, `reps=1`, `due` mañana.
   - Segunda vez → `interval ≈ 3`.
   - Incorrecto → reset a 1.

### Fase 2 — Lógica pura (shared)
4. `srs/sm2.ts` (`nextCard(state, correct)`) + tests (bien/mal/bordes de ease/intervalos crecientes).
5. `srs/types.ts` + `index.ts` + re-export.

### Fase 3 — Hooks
6. `useDueCards`, `useDueCardCount`, `useReviewCard`.

### Fase 4 — UI
7. `review/ReviewRunner.tsx` reusa `ExerciseRenderer` + `isAnswerComplete` + `checkAnswer` + `FeedbackBanner` (uno-a-uno, sin reencolado). Al terminar → `ReviewSummary`.
8. `(protected)/review.tsx`.
9. Home: badge "🔁 Tenés N para repasar" (o "Al día ✓") linkea a `/review`.

### Fase 5 — Verificación
10. Con el usuario de prueba: completar la lección de vuelta para que se siembren cards; navegar a `/review` mañana (o mover `due_at` a `now()` para probar hoy); recorrer una sesión y confirmar que los intervalos crecen.
11. `pnpm typecheck && pnpm lint && pnpm test` verde.
12. Quickstart + PR.

## Decisiones clave (research)

- SM-2 simplificado (bien/mal) en SQL con espejo puro testeado.
- Siembra automática en `complete_lesson` (transacción única).
- Sesión de repaso propia (no reusa reducer de 005; sí renderers).
- Sin XP por repaso en MVP.
- Cap diario 20.

## Fuera del plan

- Notificaciones push, congelar cards, SRS por tema/tag, FSRS.
