import { describe, expect, it } from 'vitest';
import { APP_CEFR_RANGE, CEFR_LABELS } from './cefr';

describe('cefr', () => {
  it('APP_CEFR_RANGE includes A2 and B1', () => {
    expect(APP_CEFR_RANGE).toContain('A2');
    expect(APP_CEFR_RANGE).toContain('B1');
  });

  it('APP_CEFR_RANGE has exactly 2 levels', () => {
    expect(APP_CEFR_RANGE).toHaveLength(2);
  });

  it('CEFR_LABELS has entries for all 6 CEFR levels', () => {
    expect(Object.keys(CEFR_LABELS)).toHaveLength(6);
  });
});
