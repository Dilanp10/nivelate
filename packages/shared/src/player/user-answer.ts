import type { ExerciseType } from '../content/types';

// La respuesta del usuario, según el tipo de ejercicio.
export type UserAnswer =
  | { type: 'multiple_choice'; selectedIndex: number }
  | { type: 'fill_in_blank'; values: string[] } // una entrada por hueco
  | { type: 'matching'; pairs: { left: string; right: string }[] } // emparejamiento elegido
  | { type: 'word_order'; order: number[] } // índices en el orden elegido
  | { type: 'listening'; sub: SubAnswer }
  | { type: 'translation'; text: string }
  | { type: 'dialogue'; selectedIndex: number };

export type SubAnswer =
  | { kind: 'multiple_choice'; selectedIndex: number }
  | { kind: 'fill_in_blank'; values: string[] };

export function answerTypeMatches(exerciseType: ExerciseType, answer: UserAnswer): boolean {
  return exerciseType === answer.type;
}

/**
 * Normaliza texto para comparar respuestas libres: trim, colapsa espacios,
 * minúsculas, quita puntuación final y normaliza comillas.
 */
export function normalizeText(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
}

/** ¿`value` (normalizado) coincide con alguna de las opciones aceptadas? */
export function textMatches(value: string, accepted: string[]): boolean {
  const norm = normalizeText(value);
  return accepted.some((a) => normalizeText(a) === norm);
}

/**
 * Distancia de Damerau-Levenshtein: cuenta inserciones, borrados,
 * sustituciones y transposiciones de caracteres adyacentes (cada una = 1).
 * Necesaria para tolerar tipos comunes tipo "wnet"/"went" que Levenshtein
 * clásico contaría como 2 sustituciones.
 */
export function damerauLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  // Matriz plana en Uint16Array — no arrays anidados, contiguo en memoria y
  // los tipos son `number` (no `number | undefined`), lo que TypeScript en
  // modo estricto (noUncheckedIndexedAccess) exige.
  const w = n + 1;
  const dp = new Uint16Array((m + 1) * w);
  for (let i = 0; i <= m; i++) dp[i * w] = i;
  for (let j = 0; j <= n; j++) dp[j] = j;
  // Non-null assertions abajo: cada `dp[k]!` con k computado desde bounds ya
  // validados por los for-loops. Necesario por noUncheckedIndexedAccess.
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const ca = a.charCodeAt(i - 1);
      const cb = b.charCodeAt(j - 1);
      const cost = ca === cb ? 0 : 1;
      let v = Math.min(
        dp[(i - 1) * w + j]! + 1,
        dp[i * w + (j - 1)]! + 1,
        dp[(i - 1) * w + (j - 1)]! + cost,
      );
      if (
        i > 1 &&
        j > 1 &&
        ca === b.charCodeAt(j - 2) &&
        cb === a.charCodeAt(i - 2)
      ) {
        v = Math.min(v, dp[(i - 2) * w + (j - 2)]! + 1);
      }
      dp[i * w + j] = v;
    }
  }
  return dp[m * w + n]!;
}

/**
 * Cuántas ediciones toleramos según el largo del texto. Escala moderada:
 * palabras cortas exigen exactitud (para no confundir "he"/"she"), medianas
 * aceptan 1 tipeo, largas hasta 2. Cap en 2 para frases enteras: si te faltan
 * 3+ letras, probablemente no sabías la respuesta.
 */
function typoThreshold(len: number): number {
  if (len <= 3) return 0;
  if (len <= 7) return 1;
  return 2;
}

export type MatchResult = {
  /** true si la respuesta se considera correcta (exacta o con tipeo). */
  matched: boolean;
  /** true si fue aceptada gracias a tolerancia de tipeo — para poder mostrar
   * "Casi — la respuesta correcta es X" y que igual aprenda la escritura. */
  typo: boolean;
};

/**
 * Como textMatches, pero además de coincidencia exacta acepta respuestas con
 * hasta N errores de tipeo (según `typoThreshold` por longitud). Devuelve
 * también un flag `typo` para que la UI muestre feedback de corrección.
 */
export function matchWithTypoTolerance(value: string, accepted: string[]): MatchResult {
  const norm = normalizeText(value);
  if (norm.length === 0) return { matched: false, typo: false };
  // Primero, coincidencia exacta (barata) contra todas las aceptadas.
  for (const a of accepted) {
    if (normalizeText(a) === norm) return { matched: true, typo: false };
  }
  // Después, tolerancia de tipeo. Umbral basado en el largo del target.
  for (const a of accepted) {
    const target = normalizeText(a);
    const threshold = typoThreshold(target.length);
    if (threshold === 0) continue;
    const dist = damerauLevenshtein(norm, target);
    if (dist <= threshold) return { matched: true, typo: true };
  }
  return { matched: false, typo: false };
}
