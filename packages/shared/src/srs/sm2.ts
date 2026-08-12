// SM-2 simplificado (bien/mal). Espeja lo que hace el RPC public.review_card;
// el SQL es la autoridad. Esta versión pura sirve para tests y para display
// optimista.

export const EASE_MIN = 1.3;
export const EASE_MAX = 2.5;
export const EASE_DEFAULT = 2.5;

export type SrsState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export const NEW_CARD: SrsState = {
  easeFactor: EASE_DEFAULT,
  intervalDays: 0,
  repetitions: 0,
};

export function nextCard(state: SrsState, correct: boolean): SrsState {
  if (correct) {
    const base = Math.max(state.intervalDays, 1);
    const nextInterval = Math.max(1, Math.round(base * state.easeFactor));
    return {
      easeFactor: state.easeFactor,
      intervalDays: nextInterval,
      repetitions: state.repetitions + 1,
    };
  }
  return {
    easeFactor: Math.max(EASE_MIN, state.easeFactor - 0.2),
    intervalDays: 1,
    repetitions: 0,
  };
}
