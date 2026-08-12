# Tasks — 008 Offline PWA

Cada tarea → un commit. `<tipo>(008): T### — <descripción>`.

## Fase 1 — SW estático + registro

- [ ] T001 — `apps/mobile/assets/icon.png` (1024×1024). **Requiere al usuario:** archivo binario a diseñar. `assets/README.md` documenta las specs y un placeholder mínimo.
- [x] T002 — `apps/mobile/public/sw.js` con Workbox CDN import y estrategias por tipo de recurso.
- [x] T003 — `sw-register.ts` con guards (prod + web + feature-detect).
- [x] T004 — Llamada al register en `_layout.tsx` (useEffect + escucha updatefound).

## Fase 2 — UI ✅

- [x] T010 — `useOnlineStatus` con `useSyncExternalStore`.
- [x] T011 — `ConnectionBanner`.
- [x] T012 — `UpdateAvailableBanner` (postMessage `SKIP_WAITING` + reload en `controllerchange`).
- [x] T013 — Ambos montados en el root layout, arriba del `<Slot />`.

## Fase 3 — Errores de red claros ✅

- [x] T020 — `lib/net.ts` con `isNetworkError` + `toFriendlyError`.
- [x] T021 — Aplicado en useCompleteLesson, useReviewCard, useSignIn, useSignUp.

## Fase 4 — Build + doc

- [ ] T030 — Verificar que `expo export --platform web` incluye `public/sw.js` en `dist/`. **Requiere al usuario:** correr el build y confirmar (documentado en quickstart).
- [x] T031 — `pnpm typecheck && pnpm lint && pnpm test` verde (98 unit tests).
- [x] T090 — `quickstart.md` con los pasos de build + serve + Lighthouse + offline.
- [ ] T091 — README con badge "PWA installable". Diferido hasta tener el deploy en Vercel.
- [ ] T099 — PR `feat(008): offline pwa` tras cerrar 001 T004 + resto de la cadena.

## Verificaciones hechas en esta sesión

- **Guard de dev**: en `pnpm --filter mobile web` (Metro dev, NODE_ENV=development), el SW NO se registra. `navigator.serviceWorker.getRegistrations()` devuelve `[]`. ✓
- **`ConnectionBanner`**: simulando `navigator.onLine = false` + `offline` event → aparece "Sin conexión — algunas acciones pueden fallar" arriba de la home. Al volver a `true` + `online` event → desaparece. ✓
- **App no rompió**: home sigue rindiendo (Nivel 2 / 160 XP del usuario de prueba).

## Verificaciones que requieren al usuario

- La validación real del SW **NO funciona con `pnpm --filter mobile web`** (Metro dev). Requiere:
  1. `pnpm --filter mobile export:web`
  2. Servir `apps/mobile/dist/` con un HTTP server (ej. `pnpm dlx serve apps/mobile/dist -p 5000`).
  3. Abrir en Chrome → DevTools → Application → Service Workers (activo).
  4. Lighthouse → PWA audit debería dar "installable" en verde (siempre que hayas creado `assets/icon.png` de 1024×1024).
  5. DevTools → Network → Offline → recargar → app carga.
