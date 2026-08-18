import type { SelfLevel } from '../auth/types';
import type { Unit } from '../content/types';

/**
 * Mapea el nivel autopercibido a la posición (`sort_order`) de la unidad de
 * arranque. La convención vive acá y no en el perfil: si el usuario cambia
 * su self_level, el arranque se recalcula en runtime.
 *
 * - `zero` y `basic` arrancan en U1 (el refresh gramatical les sirve igual).
 * - `conversational` salta a U2.
 * - `intermediate` salta a U3.
 */
export function getStartingUnitOrder(selfLevel: SelfLevel | null | undefined): number {
  switch (selfLevel) {
    case 'conversational':
      return 2;
    case 'intermediate':
      return 3;
    default:
      // null, 'zero', 'basic' o valores desconocidos → arrancar desde el principio
      return 1;
  }
}

/**
 * Devuelve la unidad de arranque del usuario. Si no existe una unidad con el
 * `sort_order` objetivo (típicamente porque las unidades avanzadas aún no
 * están publicadas), cae al primer sort_order **>=** al objetivo. Si tampoco
 * hay, devuelve la primera unidad disponible.
 *
 * Precondiciones: `units` no debe estar vacío.
 */
export function getStartingUnit(
  selfLevel: SelfLevel | null | undefined,
  units: readonly Unit[],
): Unit | null {
  if (units.length === 0) return null;
  const sorted = [...units].sort((a, b) => a.sort_order - b.sort_order);
  const target = getStartingUnitOrder(selfLevel);
  return sorted.find((u) => u.sort_order >= target) ?? sorted[0] ?? null;
}

/**
 * `true` si el usuario arrancó saltando unidades (i.e. self_level lo llevó
 * a una unidad posterior a la primera). Sirve para condicionar UI como el
 * enlace "¿Muy difícil? Empezá desde el principio".
 */
export function skippedUnits(selfLevel: SelfLevel | null | undefined): boolean {
  return getStartingUnitOrder(selfLevel) > 1;
}
