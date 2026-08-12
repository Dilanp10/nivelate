# Spec 008 — Offline PWA

> **Estado:** Draft
> **Depende de:** todos los anteriores (es puro cliente / build).
> **Última actualización:** 2026-08-11

## Contexto

Cerrar el MVP como PWA instalable: manifest válido, service worker que cachea el app shell y el contenido, indicador de conexión, y comportamiento razonable cuando no hay red. Es puro frontend/build — no toca DB ni RPCs.

## Objetivos

1. **Manifest PWA correcto** con iconos que pasan Lighthouse "installable".
2. **Service worker** con Workbox: precache del app shell + runtime cache para contenido.
3. **Runtime cache stale-while-revalidate** para queries de contenido (units/lessons/exercises) — el contenido casi no cambia.
4. **Network-only** para mutations (`/rpc/complete_lesson`, `/rpc/review_card`). Si no hay red, el error se muestra y el usuario reintenta. Sin cola offline en MVP.
5. **Banner de conexión**: cuando `!navigator.onLine`, un banner discreto arriba avisa que se está offline.
6. **Documentar cómo probar offline de verdad** con `expo export --platform web` + servidor estático + DevTools "Offline".

## No-objetivos (fuera de alcance)

- **Cola de sync con IndexedDB** para replay de mutations offline. Complejo, frágil sin verificación real, y para MVP el usuario probablemente no completa lecciones offline (necesita al menos cargarlas primero). Si aparece la demanda, versión posterior.
- **Precache por-unidad on-demand** ("descargar unidad para offline"). El precache del build cubre el app shell; el contenido queda en cache runtime tras la primera visita a esa lección.
- **Notificaciones push**. En iOS PWA son irregulares.
- **Background sync**. Idem cola offline.
- **Native app installable** (iOS/Android via Expo build). Sigue siendo PWA-first.

## Requisitos funcionales

### FR-001: Iconos y manifest
`app.json` con `web.name`, `web.shortName`, `web.themeColor`, `web.backgroundColor`, `web.display: 'standalone'`, `web.lang: 'es'` (ya listos en 001). Agregar `assets/icon.png` (1024×1024) — Expo genera los tamaños al hacer `export`. **Must.**

### FR-002: Service worker con Workbox
Un `public/sw.js` (o generado por `@expo/config-plugins`) que:
- **Precache** de assets estáticos (JS, CSS, fuentes, HTML shell).
- **Runtime cache** `stale-while-revalidate` para GETs a `${SUPABASE_URL}/rest/v1/units*`, `.../lessons*`, `.../exercises*`, `.../grammar_topics*` — el contenido cambia poco y la última respuesta cacheada sirve offline.
- **Network-only** (con timeout) para el resto de `rest/v1/*` (queries de progreso/logros/srs) — datos personales, no cachear.
- **Network-only** para `rest/v1/rpc/*` — mutations nunca desde cache.
- **NetworkOnly + navigation preload** para navegación al shell HTML. Fallback al `index.html` cacheado si no hay red.

**Must.**

### FR-003: Registro del SW
`apps/mobile/src/lib/sw-register.ts` — en web, registra `/sw.js` cuando `document.readyState === 'complete'`. Feature-detect. **Must.**

### FR-004: Banner de conexión
Componente `<ConnectionBanner>` en el root layout. Escucha `online`/`offline` events. Cuando offline: banner discreto arriba "Sin conexión — algunas acciones pueden fallar". Cuando vuelve online: se oculta. **Must.**

### FR-005: Errores de red claros
Los hooks de mutation (`useCompleteLesson`, `useReviewCard`, hooks de auth) ya muestran errores del server. Cuando el error es de red, mostrar "Sin conexión. Volvé a intentar cuando tengas red." (mejora sobre el `error.message` técnico). **Should.**

### FR-006: Instalabilidad
Con el manifest + SW + `https:` (o `localhost`), el browser ofrece "Install app". El usuario ve un ícono en el escritorio/home screen que abre en modo standalone.

**Verificación**: DevTools → Lighthouse → PWA audit debería dar verde en "installable".

**Must** (deja de ser Should porque es el punto del módulo).

## Requisitos no funcionales

- **No romper el dev**: el SW solo se registra en production build. En dev (Metro) queda desactivado — no cachea assets que cambian a cada rebuild.
- **Sin regresiones**: el bundle web sigue funcionando con `pnpm --filter mobile web`.
- **Advisors** no aplica (sin cambios de DB).
- **Bundle size**: Workbox agrega ~15KB gzipped, aceptable.

## Criterios de aceptación

- [ ] AC-001: `pnpm --filter mobile export:web` genera `dist/` con `manifest.json`, iconos y `sw.js`.
- [ ] AC-002: Servir `dist/` con un HTTP server local y abrir en Chrome → Lighthouse PWA audit pasa "installable".
- [ ] AC-003: Cargar la app, ir a una lección, activar "Offline" en DevTools, recargar → la app carga (shell + contenido cacheado).
- [ ] AC-004: Estando offline, tocar "Empezar lección" carga la lección si ya se visitó (contenido en cache) o muestra error claro si no.
- [ ] AC-005: Al perder conexión, aparece el banner "Sin conexión"; al recuperarla, desaparece.
- [ ] AC-006: `pnpm typecheck && pnpm lint && pnpm test` verde.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Expo web no expone Workbox de forma nativa | Alto | SW manual en `public/sw.js`. Registro manual. Workbox vía CDN import en el SW. |
| El SW cachea un bundle roto y trabá la app | Alto | Estrategia de versionado por hash del build (Expo lo hace). Botón "actualizar" en el banner al detectar new SW. |
| iOS PWA con SW tiene comportamiento raro | Medio | Documentar limitaciones. Testear en Safari mobile. |
| Precache del contenido de la Unidad 1 quedaría desactualizado si se re-publica | Bajo | stale-while-revalidate → siguiente visita trae fresh. |
| Metro dev server sirve el SW con headers `no-cache` | Alto | SW solo en prod build (`process.env.NODE_ENV === 'production'` guard en el register). |

## Preguntas abiertas

- [ ] ¿Cache versioning: por hash del build (default de Workbox) o custom con env var? *Sugerido: default de Workbox.*
- [ ] ¿"Update available" toast cuando el SW nuevo está en `waiting`? *Sugerido: sí, discreto, con botón "actualizar" que hace `skipWaiting`.*
