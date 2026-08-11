import { describe, expect, it } from 'vitest';
import { levelForXp } from './level';
import { daysBetween, nextStreak } from './streak';

describe('levelForXp', () => {
  it('0 XP = nivel 1', () => {
    const l = levelForXp(0);
    expect(l.level).toBe(1);
    expect(l.xpIntoLevel).toBe(0);
    expect(l.progress).toBe(0);
  });
  it('70 XP sigue en nivel 1', () => {
    const l = levelForXp(70);
    expect(l.level).toBe(1);
    expect(l.xpIntoLevel).toBe(70);
    expect(l.progress).toBeCloseTo(0.7);
  });
  it('100 XP = nivel 2 justo', () => {
    const l = levelForXp(100);
    expect(l.level).toBe(2);
    expect(l.xpIntoLevel).toBe(0);
  });
  it('250 XP = nivel 3 con 50 dentro', () => {
    const l = levelForXp(250);
    expect(l.level).toBe(3);
    expect(l.xpIntoLevel).toBe(50);
  });
  it('XP negativa se trata como 0', () => {
    expect(levelForXp(-10).level).toBe(1);
  });
});

describe('daysBetween', () => {
  it('mismo día = 0', () => {
    expect(daysBetween('2026-08-11', '2026-08-11')).toBe(0);
  });
  it('día siguiente = 1', () => {
    expect(daysBetween('2026-08-11', '2026-08-12')).toBe(1);
  });
  it('cruza fin de mes', () => {
    expect(daysBetween('2026-08-31', '2026-09-01')).toBe(1);
  });
});

describe('nextStreak', () => {
  it('primera vez (null) = 1', () => {
    expect(nextStreak(null, '2026-08-11', 0)).toBe(1);
  });
  it('mismo día no cambia', () => {
    expect(nextStreak('2026-08-11', '2026-08-11', 5)).toBe(5);
  });
  it('día consecutivo suma 1', () => {
    expect(nextStreak('2026-08-11', '2026-08-12', 5)).toBe(6);
  });
  it('salto de días resetea a 1', () => {
    expect(nextStreak('2026-08-11', '2026-08-14', 5)).toBe(1);
  });
});
