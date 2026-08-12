# Tasks — 006 Review System

Cada tarea → un commit. Formato: `<tipo>(006): T### — <descripción>`.

## Fase 1 — Schema + RPC + patch ✅

- [x] T001-T003 — Migración `20260815000000_srs.sql`: srs_cards + RLS + RPC `review_card` + reemplazo de `complete_lesson` con siembra.
- [x] T004 — Aplicada. Advisors: los 3 warnings son esperados (2 funciones security definer ejecutables por authenticated son por diseño; leaked_password_protection es setting de dashboard).
- [x] T005 — Tipos regenerados (srs_cards + review_card).
- [x] T006 — Probado por SQL: complete siembra 8 cards; review#1 correct 0→1×2.5→3; review#2 correct 3×2.5→8; review#3 wrong reset a 1 con ease 2.5→2.3. ✓

## Fase 2 — Lógica pura ✅

- [x] T010 — `srs/sm2.ts` `nextCard(state, correct)` con cap ease [1.3, 2.5].
- [x] T011 — types + re-export. 5 tests SM-2. Total 91 verdes.

## Fase 3 — Hooks ✅

- [x] T020 — `useDueCards` (join exercises + filtro is_published + limit 20).
- [x] T021 — `useDueCardCount` (count head:true).
- [x] T022 — `useReviewCard` (RPC + invalidación de ['due-cards*']).

## Fase 4 — UI ✅

- [x] T030 — `review/ReviewRunner.tsx` (una respuesta por card, reusa renderers).
- [x] T031 — `review/ReviewSummary.tsx`.
- [x] T032 — `(protected)/review.tsx` con loading/error/empty ("Al día ✓").
- [x] T033 — Home: badge "🔁 Tenés N para repasar" con `<Link asChild>` (los Pressable+router.push tenían glitch de primer tap en Expo web).

## Fase 5 — Verificación + cierre

- [x] T040 — **Verificado end-to-end en browser autenticado:** badge apareció con "🔁 Tenés 8 para repasar" tras forzar `due_at=now()`. RPC `review_card` invocado con la sesión real desde el browser (fetch al PostgREST) devolvió status 200 con `interval_days=3` (SM-2 correcto). Cola bajó de 8→7 cards due, total sigue 8.
- [x] T041 — `pnpm typecheck && pnpm lint && pnpm test` verde (91 unit tests).
- [x] T090 — `quickstart.md`.
- [ ] T099 — PR `feat(006): review system` (tras mergear la cadena).

## Notas

- Los cards del usuario de prueba quedaron con `due_at=now()` de la verificación.
  Para restaurar a "mañana": `update srs_cards set due_at = now() + interval '1 day'
  where user_id = (select id from auth.users where email='tester@nivelate.local');`
