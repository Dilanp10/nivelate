import { describe, expect, it } from 'vitest';
import type { Unit } from '../content/types';
import { getStartingUnit, getStartingUnitOrder, skippedUnits } from './starting-unit';

const makeUnit = (sort: number): Unit =>
  ({
    id: `u-${sort}`,
    slug: `unit-${sort}`,
    title: `Unit ${sort}`,
    description: null,
    cefr_level: 'A2',
    sort_order: sort,
    is_published: true,
    created_at: '2026-08-18T00:00:00Z',
    updated_at: '2026-08-18T00:00:00Z',
  }) as Unit;

describe('getStartingUnitOrder', () => {
  it('devuelve 1 para zero y basic (arrancan desde el principio)', () => {
    expect(getStartingUnitOrder('zero')).toBe(1);
    expect(getStartingUnitOrder('basic')).toBe(1);
  });

  it('devuelve 2 para conversational', () => {
    expect(getStartingUnitOrder('conversational')).toBe(2);
  });

  it('devuelve 3 para intermediate', () => {
    expect(getStartingUnitOrder('intermediate')).toBe(3);
  });

  it('devuelve 1 para null/undefined (perfil sin nivel)', () => {
    expect(getStartingUnitOrder(null)).toBe(1);
    expect(getStartingUnitOrder(undefined)).toBe(1);
  });
});

describe('getStartingUnit', () => {
  const units = [makeUnit(1), makeUnit(2), makeUnit(3)];

  it('devuelve la unidad con sort_order coincidente para intermediate', () => {
    expect(getStartingUnit('intermediate', units)?.sort_order).toBe(3);
  });

  it('devuelve U1 para zero', () => {
    expect(getStartingUnit('zero', units)?.sort_order).toBe(1);
  });

  it('cae a la siguiente disponible si no existe el sort_order objetivo', () => {
    // Solo hay U1 y U2; intermediate (target 3) debería caer a U... nada más grande.
    const soloDos = [makeUnit(1), makeUnit(2)];
    expect(getStartingUnit('intermediate', soloDos)?.sort_order).toBe(1);
  });

  it('respeta la primera unidad publicada si el orden es no consecutivo', () => {
    // Si el catálogo tiene U1 y U3 (sin U2), conversational (target 2) → U3.
    const salteado = [makeUnit(1), makeUnit(3)];
    expect(getStartingUnit('conversational', salteado)?.sort_order).toBe(3);
  });

  it('devuelve null si no hay unidades', () => {
    expect(getStartingUnit('zero', [])).toBeNull();
  });

  it('no muta el array de entrada', () => {
    const orig = [makeUnit(3), makeUnit(1), makeUnit(2)];
    const snapshot = orig.map((u) => u.sort_order);
    getStartingUnit('intermediate', orig);
    expect(orig.map((u) => u.sort_order)).toEqual(snapshot);
  });
});

describe('skippedUnits', () => {
  it('false para zero/basic/null', () => {
    expect(skippedUnits('zero')).toBe(false);
    expect(skippedUnits('basic')).toBe(false);
    expect(skippedUnits(null)).toBe(false);
  });

  it('true para conversational e intermediate', () => {
    expect(skippedUnits('conversational')).toBe(true);
    expect(skippedUnits('intermediate')).toBe(true);
  });
});
