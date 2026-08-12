import { describe, expect, it } from 'vitest';
import { EASE_MAX, EASE_MIN, NEW_CARD, nextCard } from './sm2';

describe('sm2 nextCard', () => {
  it('card nueva + correcta → interval 3 (round(1*2.5)), reps 1', () => {
    const r = nextCard(NEW_CARD, true);
    expect(r.intervalDays).toBe(3);
    expect(r.repetitions).toBe(1);
    expect(r.easeFactor).toBe(EASE_MAX);
  });

  it('segunda correcta → 3 * 2.5 = 7.5 → 8', () => {
    const r1 = nextCard(NEW_CARD, true);
    const r2 = nextCard(r1, true);
    expect(r2.intervalDays).toBe(8);
    expect(r2.repetitions).toBe(2);
  });

  it('incorrecta → interval 1, reps 0, ease baja 0.20', () => {
    const r = nextCard({ easeFactor: 2.5, intervalDays: 10, repetitions: 5 }, false);
    expect(r.intervalDays).toBe(1);
    expect(r.repetitions).toBe(0);
    expect(r.easeFactor).toBeCloseTo(2.3);
  });

  it('ease no baja de 1.3', () => {
    let s = { easeFactor: 1.5, intervalDays: 5, repetitions: 2 };
    s = nextCard(s, false); // 1.3
    s = nextCard(s, false); // debería quedar en 1.3
    expect(s.easeFactor).toBeCloseTo(EASE_MIN);
  });

  it('interval mínimo es 1 aunque el ease sea bajo', () => {
    const r = nextCard({ easeFactor: EASE_MIN, intervalDays: 0, repetitions: 0 }, true);
    expect(r.intervalDays).toBeGreaterThanOrEqual(1);
  });
});
