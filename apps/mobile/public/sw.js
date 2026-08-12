// Service worker de Nivelate. Servido estáticamente desde /sw.js.
// Se registra solo en producción (ver src/lib/sw-register.ts).
// Workbox se importa desde CDN — mantiene el bundle de la app liviano.
// importScripts es API del SW (no ESM).
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

// SUPABASE_URL se reemplaza al build (ver plan.md T030). En dev queda vacío
// y el SW no se registra igual.
const SUPABASE_URL_PATTERN = /^https:\/\/[a-z0-9]+\.supabase\.co\/rest\/v1/;

if (self.workbox) {
  const { core, routing, strategies, precaching, expiration } = self.workbox;

  // Update inmediato cuando el cliente lo pide.
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  });
  core.clientsClaim();

  // NOTA: self.__WB_MANIFEST solo se llena si el build corre por Workbox
  // Build/injectManifest — este proyecto no lo tiene configurado, así que hoy
  // esta lista SIEMPRE está vacía y precacheAndRoute no hace nada. Queda el
  // call para cuando se agregue ese build step. Mientras tanto, el shell se
  // cachea recién al navegar (ver NetworkFirst de abajo) o vía el warm-up de
  // 'install' de más abajo, que cubre el caso de "nunca visité y ya me quiero
  // ir offline".
  precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Pre-warm: cachear el shell en el install, no depender de que el usuario ya
  // haya navegado. Sin esto, un usuario que instala la PWA y se va offline
  // antes de la primera visita completa no tiene nada que servir.
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('app-shell').then((cache) => cache.add('/').catch(() => undefined)),
    );
  });

  // Navegación (HTML shell): network-first con fallback al index cacheado.
  routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new strategies.NetworkFirst({
      cacheName: 'app-shell',
      networkTimeoutSeconds: 3,
      plugins: [
        new expiration.ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 }),
      ],
    }),
  );

  // Assets estáticos (JS, CSS, imágenes, fuentes): stale-while-revalidate.
  routing.registerRoute(
    ({ request }) => ['script', 'style', 'image', 'font'].includes(request.destination),
    new strategies.StaleWhileRevalidate({
      cacheName: 'static-assets',
      plugins: [
        new expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      ],
    }),
  );

  // Contenido educativo de Supabase (units/lessons/exercises/grammar_topics):
  // stale-while-revalidate. Casi no cambia, y la última copia sirve offline.
  routing.registerRoute(
    ({ url, request }) =>
      request.method === 'GET' &&
      SUPABASE_URL_PATTERN.test(url.href) &&
      /\/rest\/v1\/(units|lessons|exercises|grammar_topics|lesson_grammar_topics|vocab_items)/.test(
        url.pathname,
      ),
    new strategies.StaleWhileRevalidate({
      cacheName: 'content',
      plugins: [
        new expiration.ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      ],
    }),
  );

  // Datos personales del usuario: network-only con timeout corto. Nunca servir
  // stale (progreso, logros, srs). Si no hay red, falla y la UI muestra el error.
  routing.registerRoute(
    ({ url, request }) =>
      request.method === 'GET' &&
      SUPABASE_URL_PATTERN.test(url.href) &&
      /\/rest\/v1\/(profiles|xp_events|lesson_completions|srs_cards|user_achievements)/.test(
        url.pathname,
      ),
    new strategies.NetworkOnly(),
  );

  // Mutations (RPCs y cualquier POST/PATCH/DELETE): siempre network. Si no hay
  // red, error visible; el usuario reintenta. Sin cola offline en MVP.
  routing.registerRoute(
    ({ url, request }) =>
      SUPABASE_URL_PATTERN.test(url.href) &&
      (request.method !== 'GET' || url.pathname.includes('/rpc/')),
    new strategies.NetworkOnly(),
  );
}
