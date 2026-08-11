# Tasks — 006 Review System

Cada tarea → un commit. Formato: `<tipo>(006): T### — <descripción>`.

## Fase 1 — Schema + RPC + patch

- [ ] T001 — Migración `20260815000000_srs.sql` (srs_cards + índice + RLS).
- [ ] T002 — RPC `review_card` en la misma migración.
- [ ] T003 — Reemplazar `complete_lesson` con siembra de cards (insert on conflict do nothing).
- [ ] T004 — Aplicar. Advisors → cero (el warning de function ejecutable por authenticated es por diseño).
- [ ] T005 — Regenerar tipos.
- [ ] T006 — Probar por SQL: siembra, primer review OK/FAIL, intervalos crecen.

## Fase 2 — Lógica pura

- [ ] T010 — `srs/sm2.ts` (`nextCard`) + tests.
- [ ] T011 — `srs/types.ts` + `index.ts` + re-export.

## Fase 3 — Hooks

- [ ] T020 — `useDueCards.ts` (limit 20, join a exercises, filtro is_published).
- [ ] T021 — `useDueCardCount.ts` (count con head:true).
- [ ] T022 — `useReviewCard.ts` (RPC).

## Fase 4 — UI

- [ ] T030 — `review/ReviewRunner.tsx` (reusa renderers + checkAnswer + FeedbackBanner).
- [ ] T031 — `review/ReviewSummary.tsx`.
- [ ] T032 — `(protected)/review.tsx`.
- [ ] T033 — Home: badge "🔁 Tenés N para repasar" linkeando a /review.

## Fase 5 — Verificación + cierre

- [ ] T040 — Verificado en browser: completar lección → sembrar cards; forzar `due_at=now()` en dev; recorrer sesión; confirmar intervalos y badge.
- [ ] T041 — `pnpm typecheck && pnpm lint && pnpm test` verde.
- [ ] T090 — `quickstart.md`.
- [ ] T099 — PR `feat(006): review system`.
