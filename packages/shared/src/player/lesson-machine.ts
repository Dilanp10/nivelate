// Reducer puro de una lección: maneja la cola de ejercicios, el re-intento sin
// castigo (fallar reencola) y las fases. Sin React, testeable con Vitest.

export type PlayerPhase = 'answering' | 'feedback' | 'summary';

export type ExerciseResult = {
  attempts: number;
  firstTryCorrect: boolean;
  done: boolean;
};

export type PlayerState = {
  queue: string[]; // ids pendientes, en orden (el actual es queue[0])
  results: Record<string, ExerciseResult>;
  phase: PlayerPhase;
  lastCorrect: boolean | null; // resultado de la última respuesta (para el feedback)
};

export type PlayerAction = { kind: 'ANSWER'; correct: boolean } | { kind: 'CONTINUE' };

export function initLesson(exerciseIds: string[]): PlayerState {
  const results: Record<string, ExerciseResult> = {};
  for (const id of exerciseIds) {
    results[id] = { attempts: 0, firstTryCorrect: false, done: false };
  }
  return {
    queue: [...exerciseIds],
    results,
    phase: exerciseIds.length === 0 ? 'summary' : 'answering',
    lastCorrect: null,
  };
}

export function currentExerciseId(state: PlayerState): string | null {
  return state.queue[0] ?? null;
}

export function lessonReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.kind) {
    case 'ANSWER': {
      if (state.phase !== 'answering') return state;
      const id = state.queue[0];
      if (id === undefined) return state;

      const prev = state.results[id] ?? { attempts: 0, firstTryCorrect: false, done: false };
      const isFirstAttempt = prev.attempts === 0;
      const results: Record<string, ExerciseResult> = {
        ...state.results,
        [id]: {
          attempts: prev.attempts + 1,
          firstTryCorrect: isFirstAttempt ? action.correct : prev.firstTryCorrect,
          done: action.correct,
        },
      };
      return { ...state, results, phase: 'feedback', lastCorrect: action.correct };
    }

    case 'CONTINUE': {
      if (state.phase !== 'feedback') return state;
      const [id, ...rest] = state.queue;
      if (id === undefined) return state;

      const wasCorrect = state.results[id]?.done ?? false;
      // Correcto → sale de la cola. Incorrecto → vuelve al final.
      const queue = wasCorrect ? rest : [...rest, id];
      const phase: PlayerPhase = queue.length === 0 ? 'summary' : 'answering';
      return { ...state, queue, phase, lastCorrect: null };
    }
  }
}

export type LessonSummary = {
  total: number;
  firstTryCorrect: number;
  estimatedXp: number;
};

export function summarize(state: PlayerState): LessonSummary {
  const ids = Object.keys(state.results);
  const total = ids.length;
  const firstTryCorrect = ids.filter((id) => state.results[id]?.firstTryCorrect).length;
  // Fórmula placeholder; la real la define 003/007.
  const estimatedXp = firstTryCorrect * 10 + (total - firstTryCorrect) * 5;
  return { total, firstTryCorrect, estimatedXp };
}
