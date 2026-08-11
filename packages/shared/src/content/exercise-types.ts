import { z } from 'zod';

// Forma del `payload` JSONB de cada exercise.type. Este es el contrato entre el
// contenido (004) y el lesson player (005). El loader valida cada ejercicio con
// `exercisePayloadSchema` antes de insertar en la DB.

const explanation = z.string().min(1).optional();

// multiple_choice
export const multipleChoicePayloadSchema = z
  .object({
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(5),
    correctIndex: z.number().int().nonnegative(),
    explanation,
  })
  .refine((p) => p.correctIndex < p.options.length, {
    message: 'correctIndex fuera de rango de options',
    path: ['correctIndex'],
  });
export type MultipleChoicePayload = z.infer<typeof multipleChoicePayloadSchema>;

// fill_in_blank — N huecos ⇒ N+1 segmentos, N answers
export const fillInBlankPayloadSchema = z
  .object({
    segments: z.array(z.string()).min(2),
    answers: z.array(z.string().min(1)).min(1),
    acceptable: z.array(z.array(z.string().min(1))).optional(),
    bank: z.array(z.string().min(1)).optional(),
    explanation,
  })
  .refine((p) => p.segments.length === p.answers.length + 1, {
    message: 'segments.length debe ser answers.length + 1',
    path: ['segments'],
  })
  .refine((p) => p.acceptable === undefined || p.acceptable.length === p.answers.length, {
    message: 'acceptable debe tener una entrada por answer',
    path: ['acceptable'],
  });
export type FillInBlankPayload = z.infer<typeof fillInBlankPayloadSchema>;

// matching
export const matchingPayloadSchema = z.object({
  pairs: z
    .array(z.object({ left: z.string().min(1), right: z.string().min(1) }))
    .min(3)
    .max(6),
  explanation,
});
export type MatchingPayload = z.infer<typeof matchingPayloadSchema>;

// word_order — correctOrder es una permutación de [0..tokens.length-1]
export const wordOrderPayloadSchema = z
  .object({
    tokens: z.array(z.string().min(1)).min(2),
    correctOrder: z.array(z.number().int().nonnegative()).min(2),
    explanation,
  })
  .refine((p) => p.correctOrder.length === p.tokens.length, {
    message: 'correctOrder debe tener la misma longitud que tokens',
    path: ['correctOrder'],
  })
  .refine(
    (p) => {
      const sorted = [...p.correctOrder].sort((a, b) => a - b);
      return sorted.every((v, i) => v === i);
    },
    {
      message: 'correctOrder debe ser una permutación de los índices de tokens',
      path: ['correctOrder'],
    },
  );
export type WordOrderPayload = z.infer<typeof wordOrderPayloadSchema>;

// listening — audioText + sub-ejercicio (MC o fill)
const listeningSubSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('multiple_choice'),
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(5),
    correctIndex: z.number().int().nonnegative(),
  }),
  z.object({
    kind: z.literal('fill_in_blank'),
    segments: z.array(z.string()).min(2),
    answers: z.array(z.string().min(1)).min(1),
    acceptable: z.array(z.array(z.string().min(1))).optional(),
  }),
]);

export const listeningPayloadSchema = z.object({
  audioText: z.string().min(1),
  audioUrl: z.string().url().nullable().optional(),
  sub: listeningSubSchema,
  explanation,
});
export type ListeningPayload = z.infer<typeof listeningPayloadSchema>;

// translation
export const translationPayloadSchema = z.object({
  prompt: z.string().min(1),
  direction: z.enum(['en_to_es', 'es_to_en']),
  acceptable: z.array(z.string().min(1)).min(1),
  explanation,
});
export type TranslationPayload = z.infer<typeof translationPayloadSchema>;

// dialogue — el turno en blanco tiene text: ""
export const dialoguePayloadSchema = z
  .object({
    turns: z.array(z.object({ speaker: z.string().min(1), text: z.string() })).min(2),
    blankTurnIndex: z.number().int().nonnegative(),
    options: z.array(z.string().min(1)).min(2).max(5),
    correctIndex: z.number().int().nonnegative(),
    explanation,
  })
  .refine((p) => p.blankTurnIndex < p.turns.length, {
    message: 'blankTurnIndex fuera de rango de turns',
    path: ['blankTurnIndex'],
  })
  .refine((p) => p.turns[p.blankTurnIndex]?.text === '', {
    message: 'el turno en blanco debe tener text vacío',
    path: ['turns'],
  })
  .refine((p) => p.correctIndex < p.options.length, {
    message: 'correctIndex fuera de rango de options',
    path: ['correctIndex'],
  });
export type DialoguePayload = z.infer<typeof dialoguePayloadSchema>;

// Discriminated union { type, payload } — lo que valida el loader por ejercicio.
export const exercisePayloadSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('multiple_choice'), payload: multipleChoicePayloadSchema }),
  z.object({ type: z.literal('fill_in_blank'), payload: fillInBlankPayloadSchema }),
  z.object({ type: z.literal('matching'), payload: matchingPayloadSchema }),
  z.object({ type: z.literal('word_order'), payload: wordOrderPayloadSchema }),
  z.object({ type: z.literal('listening'), payload: listeningPayloadSchema }),
  z.object({ type: z.literal('translation'), payload: translationPayloadSchema }),
  z.object({ type: z.literal('dialogue'), payload: dialoguePayloadSchema }),
]);
export type ExercisePayload = z.infer<typeof exercisePayloadSchema>;
