// Regla de racha diaria. Espeja la lógica del RPC complete_lesson (SQL es la
// autoridad); esta versión pura documenta la regla y sirve para display optimista.

/** Diferencia en días entre dos fechas 'YYYY-MM-DD' (b - a). */
export function daysBetween(a: string, b: string): number {
  const da = Date.parse(`${a}T00:00:00Z`);
  const db = Date.parse(`${b}T00:00:00Z`);
  return Math.round((db - da) / 86_400_000);
}

/**
 * Dada la última fecha de actividad, el día de hoy y la racha actual, devuelve
 * la nueva racha al completar una lección hoy.
 * - mismo día: sin cambios.
 * - día consecutivo: +1.
 * - otro / nunca: 1.
 */
export function nextStreak(
  lastActivityDate: string | null,
  today: string,
  currentStreak: number,
): number {
  if (!lastActivityDate) return 1;
  const diff = daysBetween(lastActivityDate, today);
  if (diff === 0) return Math.max(currentStreak, 1);
  if (diff === 1) return currentStreak + 1;
  return 1;
}
