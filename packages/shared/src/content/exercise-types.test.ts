import { describe, expect, it } from 'vitest';
import {
  dialoguePayloadSchema,
  exercisePayloadSchema,
  fillInBlankPayloadSchema,
  multipleChoicePayloadSchema,
  wordOrderPayloadSchema,
} from './exercise-types';

describe('multipleChoicePayloadSchema', () => {
  it('acepta un payload válido', () => {
    const r = multipleChoicePayloadSchema.safeParse({
      prompt: 'She ___ to school every day.',
      options: ['go', 'goes', 'going'],
      correctIndex: 1,
    });
    expect(r.success).toBe(true);
  });

  it('rechaza correctIndex fuera de rango', () => {
    const r = multipleChoicePayloadSchema.safeParse({
      prompt: 'x',
      options: ['a', 'b'],
      correctIndex: 5,
    });
    expect(r.success).toBe(false);
  });
});

describe('fillInBlankPayloadSchema', () => {
  it('acepta 1 hueco (2 segmentos, 1 answer)', () => {
    const r = fillInBlankPayloadSchema.safeParse({
      segments: ['I ', ' to the party yesterday.'],
      answers: ['went'],
    });
    expect(r.success).toBe(true);
  });

  it('rechaza cuando segments != answers + 1', () => {
    const r = fillInBlankPayloadSchema.safeParse({
      segments: ['a', 'b', 'c'],
      answers: ['x'],
    });
    expect(r.success).toBe(false);
  });

  it('rechaza acceptable con largo distinto a answers', () => {
    const r = fillInBlankPayloadSchema.safeParse({
      segments: ['a ', ' b'],
      answers: ['x'],
      acceptable: [['x'], ['y']],
    });
    expect(r.success).toBe(false);
  });
});

describe('wordOrderPayloadSchema', () => {
  it('acepta una permutación válida', () => {
    const r = wordOrderPayloadSchema.safeParse({
      tokens: ['I', 'am', 'happy'],
      correctOrder: [0, 1, 2],
    });
    expect(r.success).toBe(true);
  });

  it('rechaza si correctOrder no es permutación', () => {
    const r = wordOrderPayloadSchema.safeParse({
      tokens: ['a', 'b', 'c'],
      correctOrder: [0, 1, 1],
    });
    expect(r.success).toBe(false);
  });
});

describe('dialoguePayloadSchema', () => {
  it('acepta un diálogo con turno en blanco', () => {
    const r = dialoguePayloadSchema.safeParse({
      turns: [
        { speaker: 'A', text: 'How are you?' },
        { speaker: 'B', text: '' },
      ],
      blankTurnIndex: 1,
      options: ["I'm fine, thanks.", 'Yesterday.'],
      correctIndex: 0,
    });
    expect(r.success).toBe(true);
  });

  it('rechaza si el turno en blanco no está vacío', () => {
    const r = dialoguePayloadSchema.safeParse({
      turns: [
        { speaker: 'A', text: 'Hi' },
        { speaker: 'B', text: 'not empty' },
      ],
      blankTurnIndex: 1,
      options: ['a', 'b'],
      correctIndex: 0,
    });
    expect(r.success).toBe(false);
  });
});

describe('exercisePayloadSchema (discriminated union)', () => {
  it('valida por type', () => {
    const r = exercisePayloadSchema.safeParse({
      type: 'translation',
      payload: {
        prompt: 'Voy al trabajo en tren.',
        direction: 'es_to_en',
        acceptable: ['I go to work by train.', 'I take the train to work.'],
      },
    });
    expect(r.success).toBe(true);
  });

  it('rechaza payload que no matchea su type', () => {
    const r = exercisePayloadSchema.safeParse({
      type: 'matching',
      payload: { prompt: 'x', options: ['a', 'b'], correctIndex: 0 },
    });
    expect(r.success).toBe(false);
  });
});
