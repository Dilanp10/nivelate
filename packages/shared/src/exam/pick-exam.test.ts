import { describe, expect, it } from 'vitest';
import { pickExamExercises } from './pick-exam';

// RNG determinístico simple: siempre devuelve 0.5 → siempre elige el medio.
const rngFixed = () => 0.5;
const seededRng = (seed: number) => {
  let x = seed;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
};

function makePool(perLesson: Record<string, number>) {
  const pool: { id: string; lessonId: string }[] = [];
  for (const [lessonId, n] of Object.entries(perLesson)) {
    for (let i = 0; i < n; i++) {
      pool.push({ id: `${lessonId}-${i}`, lessonId });
    }
  }
  return pool;
}

describe('pickExamExercises', () => {
  it('devuelve array vacío si el pool está vacío', () => {
    expect(pickExamExercises([], 10, rngFixed)).toEqual([]);
  });

  it('si el pool es más chico que count, devuelve todo (barajado)', () => {
    const pool = makePool({ l1: 3, l2: 2 });
    const r = pickExamExercises(pool, 10, seededRng(1));
    expect(r).toHaveLength(5);
    expect(new Set(r.map((x) => x.id))).toEqual(new Set(pool.map((x) => x.id)));
  });

  it('respeta el count cuando el pool es más grande', () => {
    const pool = makePool({ l1: 8, l2: 8, l3: 8 });
    expect(pickExamExercises(pool, 10, seededRng(1))).toHaveLength(10);
  });

  it('cubre todas las lecciones cuando hay lugar', () => {
    // 3 lecciones, count=10 → seguro entra al menos 1 de cada
    const pool = makePool({ l1: 8, l2: 8, l3: 8 });
    const r = pickExamExercises(pool, 10, seededRng(1));
    const lessons = new Set(r.map((x) => x.lessonId));
    expect(lessons).toEqual(new Set(['l1', 'l2', 'l3']));
  });

  it('cuando count es menor que las lecciones, agarra 1 por lección hasta el cap', () => {
    const pool = makePool({ l1: 5, l2: 5, l3: 5, l4: 5, l5: 5 });
    const r = pickExamExercises(pool, 3, seededRng(1));
    expect(r).toHaveLength(3);
    // 3 lecciones distintas de las 5 disponibles
    expect(new Set(r.map((x) => x.lessonId)).size).toBe(3);
  });

  it('no repite ejercicios', () => {
    const pool = makePool({ l1: 8, l2: 8, l3: 8 });
    const r = pickExamExercises(pool, 10, seededRng(1));
    const ids = r.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos los IDs devueltos están en el pool', () => {
    const pool = makePool({ l1: 5, l2: 5 });
    const r = pickExamExercises(pool, 7, seededRng(1));
    const poolIds = new Set(pool.map((x) => x.id));
    for (const ex of r) expect(poolIds.has(ex.id)).toBe(true);
  });
});
