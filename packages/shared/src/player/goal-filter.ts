import type { LearningGoal } from '../auth/types';

/**
 * Cualquier item de contenido que declare a qué `learning_goal` está dirigido.
 * `null` o `'general'` = agnóstico, aplica como fallback a todos los usuarios.
 */
export type Goalable = { goal?: LearningGoal | null };

/**
 * Filtra items priorizando match exacto con `userGoal`; si el pool queda con
 * menos de `minCount`, completa con los agnósticos (`general` o `null`).
 * Nunca mezcla items de otro goal (no queremos mostrar ejemplos de trabajo
 * a un usuario que dijo viaje).
 *
 * - `userGoal = null/undefined` → devuelve solo agnósticos.
 * - `matches < minCount` → devuelve `[...matches, ...fallbacks]`.
 * - `matches >= minCount` → devuelve solo `matches` (respeta el orden de entrada).
 */
export function filterByGoal<T extends Goalable>(
  items: readonly T[],
  userGoal: LearningGoal | null | undefined,
  minCount = 1,
): T[] {
  const isAgnostic = (g: T['goal']) => g === 'general' || g == null;

  if (userGoal == null) {
    return items.filter((i) => isAgnostic(i.goal));
  }

  const matches = items.filter((i) => i.goal === userGoal);
  if (matches.length >= minCount) return matches;

  const fallbacks = items.filter((i) => isAgnostic(i.goal));
  return [...matches, ...fallbacks];
}
