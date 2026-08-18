// Permutación determinística de los índices de un array de tokens.
//
// Por qué existe: el ejercicio word_order recibe tokens del content y una
// respuesta esperada. El renderer no puede mostrar los tokens en el mismo
// orden en que están en el content (o el ejercicio se vuelve trivial),
// pero tampoco puede usar Math.random directo — cambiaría de orden en cada
// render y sería imposible testear. Solución: seed derivada del contenido
// del ejercicio ⇒ misma permutación estable para el mismo ejercicio, y
// distinta entre ejercicios diferentes.

// PRNG determinístico (Mulberry32). Suficiente para barajar 5-12 tokens.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash FNV-1a de 32 bits sobre un string.
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function isIdentity(a: number[]): boolean {
  for (let i = 0; i < a.length; i++) if (a[i] !== i) return false;
  return true;
}

/**
 * Devuelve una permutación de [0..tokens.length) que:
 * - es la misma para las mismas entradas (estable entre renders/tests),
 * - es distinta entre ejercicios distintos (seed derivada de los tokens),
 * - nunca es la identidad cuando tokens.length >= 2 (si el shuffle cayera
 *   en identidad, hace un swap del primer y último elemento).
 */
export function shuffleTokenIndices(tokens: readonly string[]): number[] {
  const n = tokens.length;
  const order = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return order;

  // Separador U+001F para evitar colisiones tipo ["ab","c"] vs ["a","bc"].
  const rand = mulberry32(hash32(tokens.join('')));

  // Fisher-Yates. Los índices siempre son válidos (i, j ∈ [0, n)), pero el
  // destructuring-swap dispara noUncheckedIndexedAccess ⇒ usamos temp local.
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = order[i] as number;
    order[i] = order[j] as number;
    order[j] = tmp;
  }

  if (isIdentity(order)) {
    const first = order[0] as number;
    order[0] = order[n - 1] as number;
    order[n - 1] = first;
  }
  return order;
}
