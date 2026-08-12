# Plan — 008 Offline PWA

## Arquitectura

```
apps/mobile/
├── app.json               # + manifest fields ya en 001; agregar icon
├── assets/
│   └── icon.png           # 1024×1024 base para todos los tamaños
├── public/
│   ├── sw.js              # Service worker (Workbox via CDN import)
│   └── manifest-extra.json # (opcional) overrides — Expo genera manifest base
└── src/
    ├── lib/
    │   └── sw-register.ts    # registra /sw.js en prod web
    └── components/
        ├── ConnectionBanner.tsx
        └── UpdateAvailableBanner.tsx

apps/mobile/app/
└── _layout.tsx            # + ConnectionBanner + sw-register on mount
```

## Orden de implementación

### Fase 1 — SW estático + registro
1. `apps/mobile/assets/icon.png` (1024×1024). Si no hay diseño, dejar placeholder con la "N" de Nivelate sobre bg-bg.
2. `apps/mobile/public/sw.js` — SW con Workbox CDN import + estrategias:
   - `precacheAndRoute` sobre `self.__WB_MANIFEST` (Workbox lo inyecta al build) — o listado explícito.
   - `registerRoute` para navegación (NetworkFirst con fallback al shell).
   - `registerRoute` para `${SUPABASE_URL}/rest/v1/units|lessons|exercises|grammar_topics` — StaleWhileRevalidate.
   - `registerRoute` para `${SUPABASE_URL}/rest/v1/rpc/*` — NetworkOnly.
   - `skipWaiting` + `clientsClaim` gateados por mensaje del cliente para permitir el flujo "update available".
3. `sw-register.ts` que registra `/sw.js` solo si `NODE_ENV === 'production'` y hay `navigator.serviceWorker`.
4. Llamarlo desde `app/_layout.tsx` en `useEffect` una sola vez.

### Fase 2 — UI de conexión y actualización
5. `ConnectionBanner`: hook con `useSyncExternalStore` sobre `online`/`offline`. Cuando offline: banner rojo discreto arriba, `role="alert"`.
6. `UpdateAvailableBanner`: cuando el SW pasa a `waiting`, muestra "Nueva versión disponible" + botón "Actualizar" que hace `postMessage('SKIP_WAITING')` y reload.
7. Ambos montados en `app/_layout.tsx`.

### Fase 3 — Errores de red claros en mutations
8. Helper `isNetworkError(err)` en `apps/mobile/src/lib/net.ts` (detecta `TypeError: Failed to fetch`, `NetworkError`, etc.).
9. En los tres hooks de mutation críticos (useCompleteLesson, useReviewCard, useSignIn/useSignUp) mapear a un mensaje "Sin conexión. Volvé a intentar cuando tengas red." si es network error.

### Fase 4 — Build + doc
10. Configurar `app.json` para que `expo export --platform web` incluya `public/sw.js` en `dist/`.
11. `quickstart.md` con los pasos: build → serve → Chrome → Lighthouse → offline test.
12. PR.

## Decisiones clave

- **SW en prod solamente**. Metro dev no juega bien con SW cacheable.
- **Sin cola offline** en MVP. Los mutations en offline fallan visiblemente; el usuario reintenta con red. Cola con IndexedDB queda para post-MVP con demanda real.
- **Workbox por CDN** dentro del SW (evita tener que integrarlo al bundle de la app). El SW es un archivo estático servido tal cual.
- **Content cache = stale-while-revalidate**: el usuario ve la última copia al instante y la app actualiza en background. Es lo correcto para contenido casi-inmutable como el currículum.

## Verificación esperada

Al no poder testear offline en dev, la validación real requiere:

```bash
pnpm --filter mobile export:web
# Servir dist/ con cualquier http server local:
pnpm dlx serve apps/mobile/dist -p 5000
# Abrir http://localhost:5000 en Chrome → DevTools → Application → Service Workers (activo)
# → Lighthouse → PWA (installable ✓)
# → Network → Offline → reload → la app carga
```

## Fuera del plan

- Cola offline de mutations, background sync, push, native builds, download-a-unit UX.
