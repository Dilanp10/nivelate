import type { ExerciseType } from '../content/types';

// La respuesta del usuario, según el tipo de ejercicio.
export type UserAnswer =
  | { type: 'multiple_choice'; selectedIndex: number }
  | { type: 'fill_in_blank'; values: string[] } // una entrada por hueco
  | { type: 'matching'; pairs: { left: string; right: string }[] } // emparejamiento elegido
  | { type: 'word_order'; order: number[] } // índices en el orden elegido
  | { type: 'listening'; sub: SubAnswer }
  | { type: 'translation'; text: string }
  | { type: 'dialogue'; selectedIndex: number };

export type SubAnswer =
  | { kind: 'multiple_choice'; selectedIndex: number }
  | { kind: 'fill_in_blank'; values: string[] };

export function answerTypeMatches(exerciseType: ExerciseType, answer: UserAnswer): boolean {
  return exerciseType === answer.type;
}

/**
 * Normaliza texto para comparar respuestas libres: trim, colapsa espacios,
 * minúsculas, quita puntuación final y normaliza comillas.
 */
export function normalizeText(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
}

/** ¿`value` (normalizado) coincide con alguna de las opciones aceptadas? */
export function textMatches(value: string, accepted: string[]): boolean {
  const norm = normalizeText(value);
  return accepted.some((a) => normalizeText(a) === norm);
}
