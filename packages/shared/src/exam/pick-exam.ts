/**
 * Selecciona los ejercicios para el examen de unidad.
 *
 * Reglas:
 * - Toma hasta `count` ejercicios (por defecto 10) del pool provisto.
 * - Prioriza cobertura: intenta muestrear al menos 1 de cada lección para que
 *   el examen represente toda la unidad, no solo la última lección.
 * - Después de garantizar cobertura, completa con selección aleatoria del
 *   resto del pool.
 * - Si `pool.length <= count`, devuelve TODO el pool barajado (no hay que
 *   descartar nada).
 *
 * Determinismo: acepta un `rng` opcional para tests reproducibles. En prod,
 * el default `Math.random` da un mix distinto cada intento.
 */
export type ExamSourceExercise = {
  id: string;
  lessonId: string;
};

export function pickExamExercises<T extends ExamSourceExercise>(
  pool: readonly T[],
  count = 10,
  rng: () => number = Math.random,
): T[] {
  if (pool.length === 0) return [];
  const target = Math.min(count, pool.length);

  // Agrupar por lección para forzar cobertura.
  const byLesson = new Map<string, T[]>();
  for (const ex of pool) {
    const bucket = byLesson.get(ex.lessonId) ?? [];
    bucket.push(ex);
    byLesson.set(ex.lessonId, bucket);
  }

  const shuffled = <A>(items: readonly A[]): A[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i]!;
      arr[i] = arr[j]!;
      arr[j] = tmp;
    }
    return arr;
  };

  // 1) Uno por lección primero (barajado dentro de cada bucket).
  const picked: T[] = [];
  const remainingByLesson = new Map<string, T[]>();
  for (const [lessonId, exs] of byLesson) {
    const [first, ...rest] = shuffled(exs);
    if (first) picked.push(first);
    remainingByLesson.set(lessonId, rest);
  }

  // Si ya cubrimos el target con "uno por lección", cortamos ahí.
  if (picked.length >= target) {
    return shuffled(picked).slice(0, target);
  }

  // 2) Llenamos el resto con el pool remanente barajado.
  const remainingFlat = shuffled(
    [...remainingByLesson.values()].flat(),
  );
  for (const ex of remainingFlat) {
    if (picked.length >= target) break;
    picked.push(ex);
  }

  return shuffled(picked);
}
