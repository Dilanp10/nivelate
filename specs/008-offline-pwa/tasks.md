# Tasks — 008 Offline PWA

Cada tarea → un commit. `<tipo>(008): T### — <descripción>`.

## Fase 1 — SW estático + registro

- [ ] T001 — `apps/mobile/assets/icon.png` (1024×1024).
- [ ] T002 — `apps/mobile/public/sw.js` con Workbox CDN import y estrategias.
- [ ] T003 — `apps/mobile/src/lib/sw-register.ts` — registro condicional (prod + web + feature-detect).
- [ ] T004 — Llamada al register en `app/_layout.tsx` (useEffect una vez).

## Fase 2 — UI

- [ ] T010 — `useOnlineStatus` (useSyncExternalStore sobre online/offline).
- [ ] T011 — `ConnectionBanner`.
- [ ] T012 — `UpdateAvailableBanner`.
- [ ] T013 — Montaje de ambos en `_layout.tsx`.

## Fase 3 — Errores de red claros

- [ ] T020 — `lib/net.ts` con `isNetworkError` + `toFriendlyError`.
- [ ] T021 — Aplicar en useCompleteLesson, useReviewCard, useSignIn, useSignUp.

## Fase 4 — Build + doc

- [ ] T030 — Verificar que `expo export --platform web` incluye `public/sw.js` en `dist/`.
- [ ] T031 — `pnpm typecheck && pnpm lint && pnpm test` verde.
- [ ] T090 — `quickstart.md` con los pasos de build + serve + Lighthouse + offline.
- [ ] T091 — Actualizar `README.md` con badge "PWA installable".
- [ ] T099 — PR `feat(008): offline pwa`.

## Notas para la verificación

- La validación real del SW **no funciona con `pnpm --filter mobile web`** (Metro dev). Requiere `expo export --platform web` + un servidor estático + Chrome.
- El usuario debe correr Lighthouse a mano para AC-002.
