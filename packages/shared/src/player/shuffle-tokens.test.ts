import { describe, expect, it } from 'vitest';
import { shuffleTokenIndices } from './shuffle-tokens';

describe('shuffleTokenIndices', () => {
  it('devuelve una permutación válida (mismos índices, sin repetidos)', () => {
    const tokens = ['He', "doesn't", 'like', 'fish'];
    const order = shuffleTokenIndices(tokens);
    expect(order).toHaveLength(tokens.length);
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });

  it('es determinística para los mismos tokens', () => {
    const tokens = ['I', 'usually', 'have', 'dinner', 'at', 'eight'];
    expect(shuffleTokenIndices(tokens)).toEqual(shuffleTokenIndices(tokens));
  });

  it('produce permutaciones distintas para ejercicios distintos', () => {
    const a = shuffleTokenIndices(['He', "doesn't", 'like', 'fish']);
    const b = shuffleTokenIndices(['Did', 'you', 'call', 'her', 'yesterday']);
    expect(a).not.toEqual(b);
  });

  it('nunca deja el orden identidad cuando hay al menos 2 tokens', () => {
    // Ejercicios reales de la Unidad 1 que antes salían triviales:
    const casos = [
      ['He', "doesn't", 'like', 'fish'],
      ['Did', 'you', 'call', 'her', 'yesterday'],
      ['I', 'usually', 'have', 'dinner', 'at', 'eight'],
    ];
    for (const tokens of casos) {
      const order = shuffleTokenIndices(tokens);
      const isIdentity = order.every((v, i) => v === i);
      expect(isIdentity).toBe(false);
    }
  });

  it('con 0 o 1 tokens devuelve el orden trivial (no puede barajar)', () => {
    expect(shuffleTokenIndices([])).toEqual([]);
    expect(shuffleTokenIndices(['solo'])).toEqual([0]);
  });
});
