// Heurística para distinguir "no hay red" del resto de errores. Es imperfecta
// porque los browsers no exponen un tipo consistente, pero cubre los casos
// típicos: fetch abortado por offline, DNS caído, servidor no responde.

const NETWORK_HINTS = [
  'failed to fetch',
  'network request failed',
  'networkerror',
  'load failed',
  'internet',
  'offline',
];

export function isNetworkError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const msg = err instanceof Error ? err.message : String(err ?? '');
  const lower = msg.toLowerCase();
  return NETWORK_HINTS.some((h) => lower.includes(h));
}

/**
 * Convierte un error a un mensaje amable en español. Si es de red, mensaje
 * fijo; si no, el message original (que ya está traducido por toSpanishAuthError
 * en el caso de auth).
 */
export function toFriendlyError(err: unknown, fallback = 'Ocurrió un error.'): string {
  if (isNetworkError(err)) return 'Sin conexión. Volvé a intentar cuando tengas red.';
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
