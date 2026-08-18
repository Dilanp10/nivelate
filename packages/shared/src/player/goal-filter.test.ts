import { describe, expect, it } from 'vitest';
import type { LearningGoal } from '../auth/types';
import { filterByGoal } from './goal-filter';

type Item = { id: string; goal?: LearningGoal | null };

const items: Item[] = [
  { id: 'a', goal: 'travel' },
  { id: 'b', goal: 'work' },
  { id: 'c', goal: 'travel' },
  { id: 'd', goal: 'general' },
  { id: 'e', goal: null },
  { id: 'f' }, // undefined
  { id: 'g', goal: 'entertainment' },
];

describe('filterByGoal', () => {
  it('devuelve solo los del goal exacto cuando hay suficientes', () => {
    const r = filterByGoal(items, 'travel', 1);
    expect(r.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('completa con agnósticos (general + null + undefined) cuando el pool queda chico', () => {
    // work solo tiene 1; minCount 3 fuerza el fallback
    const r = filterByGoal(items, 'work', 3);
    expect(r.map((i) => i.id)).toEqual(['b', 'd', 'e', 'f']);
  });

  it('nunca mezcla goals distintos', () => {
    const r = filterByGoal(items, 'travel', 5);
    // travel + agnósticos, nunca work/entertainment
    expect(r.map((i) => i.id)).toEqual(['a', 'c', 'd', 'e', 'f']);
    expect(r.find((i) => i.goal === 'work')).toBeUndefined();
    expect(r.find((i) => i.goal === 'entertainment')).toBeUndefined();
  });

  it('userGoal null/undefined devuelve solo agnósticos', () => {
    expect(filterByGoal(items, null).map((i) => i.id)).toEqual(['d', 'e', 'f']);
    expect(filterByGoal(items, undefined).map((i) => i.id)).toEqual(['d', 'e', 'f']);
  });

  it('respeta el orden original de los items', () => {
    const shuffled: Item[] = [
      { id: 'x1', goal: 'general' },
      { id: 'x2', goal: 'travel' },
      { id: 'x3', goal: null },
      { id: 'x4', goal: 'travel' },
    ];
    const r = filterByGoal(shuffled, 'travel', 5);
    expect(r.map((i) => i.id)).toEqual(['x2', 'x4', 'x1', 'x3']);
  });

  it('devuelve array vacío si no hay matches ni agnósticos', () => {
    const soloWork: Item[] = [{ id: 'w', goal: 'work' }];
    expect(filterByGoal(soloWork, 'travel', 3)).toEqual([]);
  });

  it('minCount default = 1: si hay al menos un match, no fallback', () => {
    const oneMatch: Item[] = [
      { id: 'a', goal: 'travel' },
      { id: 'b', goal: 'general' },
    ];
    expect(filterByGoal(oneMatch, 'travel').map((i) => i.id)).toEqual(['a']);
  });

  it('minCount 0: siempre devuelve solo matches, sin fallback', () => {
    expect(filterByGoal(items, 'work', 0).map((i) => i.id)).toEqual(['b']);
  });
});
