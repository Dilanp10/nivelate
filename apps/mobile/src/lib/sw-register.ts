import { Platform } from 'react-native';

// Registro del service worker. Solo en web + producción + navegador que lo
// soporta. En dev el SW no se registra: Metro no juega bien con SW cacheable.

type SWEvents = {
  onUpdateAvailable?: (worker: ServiceWorker) => void;
};

export function registerServiceWorker(events: SWEvents = {}): void {
  if (Platform.OS !== 'web') return;
  if (process.env.NODE_ENV !== 'production') return;
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  const load = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Watch por versión nueva.
        registration.addEventListener('updatefound', () => {
          const nw = registration.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              // Ya había un SW activo → hay una versión nueva esperando.
              events.onUpdateAvailable?.(nw);
            }
          });
        });
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== 'production') console.warn('[sw] register failed:', err);
      });
  };

  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load);
}

/** Le pide al SW en espera que se active ya (llama a `skipWaiting`). */
export function activateWaitingSw(worker: ServiceWorker): void {
  worker.postMessage({ type: 'SKIP_WAITING' });
}
