import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

// Hook para saber si el browser reporta conexión. En native (Expo Go) siempre
// devuelve true — sin NetInfo, la native no puede reportar offline sin permisos.
// Suficiente para el MVP web-first.

function subscribe(callback: () => void): () => void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return () => undefined;
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot(): boolean {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

// Server-side / SSR: asume online para no parpadear al hidratar.
const getServerSnapshot = () => true;

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
