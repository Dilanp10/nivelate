import { describe, expect, it } from 'vitest';
import { checkAnswer } from './check-answer';
import { normalizeText } from './user-answer';

describe('normalizeText', () => {
  it('trim, colapsa espacios, minúsculas, quita puntuación final', () => {
    expect(normalizeText('  I   Went. ')).toBe('i went');
    expect(normalizeText('Hello!')).toBe('hello');
  });
});

describe('checkAnswer — multiple_choice', () => {
  const ex = {
    type: 'multiple_choice' as const,
    payload: { prompt: 'x', options: ['go', 'goes'], correctIndex: 1 },
  };
  it('acierta con el índice correcto', () => {
    expect(checkAnswer(ex, { type: 'multiple_choice', selectedIndex: 1 }).correct).toBe(true);
  });
  it('falla con el índice incorrecto y reporta la respuesta', () => {
    const r = checkAnswer(ex, { type: 'multiple_choice', selectedIndex: 0 });
    expect(r.correct).toBe(false);
    expect(r.correctAnswer).toBe('goes');
  });
});

describe('checkAnswer — fill_in_blank', () => {
  const ex = {
    type: 'fill_in_blank' as const,
    payload: { segments: ['I ', ' home.'], answers: ['went'], acceptable: [['went', 'got']] },
  };
  it('acierta con variante aceptada y normalización', () => {
    expect(checkAnswer(ex, { type: 'fill_in_blank', values: ['  Went '] }).correct).toBe(true);
    expect(checkAnswer(ex, { type: 'fill_in_blank', values: ['got'] }).correct).toBe(true);
  });
  it('falla con respuesta incorrecta', () => {
    expect(checkAnswer(ex, { type: 'fill_in_blank', values: ['go'] }).correct).toBe(false);
  });
});

describe('checkAnswer — matching', () => {
  const ex = {
    type: 'matching' as const,
    payload: {
      pairs: [
        { left: 'go', right: 'went' },
        { left: 'have', right: 'had' },
      ],
    },
  };
  it('acierta con todos los pares correctos (en cualquier orden)', () => {
    const r = checkAnswer(ex, {
      type: 'matching',
      pairs: [
        { left: 'have', right: 'had' },
        { left: 'go', right: 'went' },
      ],
    });
    expect(r.correct).toBe(true);
  });
  it('falla si un par está mal emparejado', () => {
    const r = checkAnswer(ex, {
      type: 'matching',
      pairs: [
        { left: 'go', right: 'had' },
        { left: 'have', right: 'went' },
      ],
    });
    expect(r.correct).toBe(false);
  });
});

describe('checkAnswer — word_order', () => {
  const ex = {
    type: 'word_order' as const,
    payload: { tokens: ['He', 'likes', 'tea'], correctOrder: [0, 1, 2] },
  };
  it('acierta con el orden correcto', () => {
    expect(checkAnswer(ex, { type: 'word_order', order: [0, 1, 2] }).correct).toBe(true);
  });
  it('falla con el orden equivocado', () => {
    const r = checkAnswer(ex, { type: 'word_order', order: [1, 0, 2] });
    expect(r.correct).toBe(false);
    expect(r.correctAnswer).toBe('He likes tea');
  });
});

describe('checkAnswer — translation', () => {
  const ex = {
    type: 'translation' as const,
    payload: {
      prompt: 'Voy a casa.',
      direction: 'es_to_en' as const,
      acceptable: ['I go home.', 'I am going home.'],
    },
  };
  it('acierta con cualquiera de las aceptadas (normalizado)', () => {
    expect(checkAnswer(ex, { type: 'translation', text: 'i go home' }).correct).toBe(true);
    expect(checkAnswer(ex, { type: 'translation', text: 'I am going home.' }).correct).toBe(true);
  });
  it('falla con una traducción no aceptada', () => {
    expect(checkAnswer(ex, { type: 'translation', text: 'I went home' }).correct).toBe(false);
  });
});

describe('checkAnswer — tolerancia de tipeo', () => {
  it('translation: acepta un tipeo simple con flag typo', () => {
    const ex = {
      type: 'translation' as const,
      payload: {
        prompt: 'Fui al cine.',
        direction: 'es_to_en' as const,
        acceptable: ['I went to the cinema.'],
      },
    };
    // 1 letra faltante
    const r = checkAnswer(ex, { type: 'translation', text: 'I went to the cinena' });
    expect(r.correct).toBe(true);
    expect(r.typo).toBe(true);
  });

  it('translation: transposición ("wnet" vs "went") se acepta como typo', () => {
    const ex = {
      type: 'translation' as const,
      payload: {
        prompt: 'Yo fui.',
        direction: 'es_to_en' as const,
        acceptable: ['I went'],
      },
    };
    const r = checkAnswer(ex, { type: 'translation', text: 'I wnet' });
    expect(r.correct).toBe(true);
    expect(r.typo).toBe(true);
  });

  it('translation: coincidencia exacta NO trae flag typo', () => {
    const ex = {
      type: 'translation' as const,
      payload: {
        prompt: 'Yo fui.',
        direction: 'es_to_en' as const,
        acceptable: ['I went'],
      },
    };
    const r = checkAnswer(ex, { type: 'translation', text: 'I went' });
    expect(r.correct).toBe(true);
    expect(r.typo).toBeFalsy();
  });

  it('translation: palabras cortas exigen exactitud (no acepta "he" por "she")', () => {
    const ex = {
      type: 'translation' as const,
      payload: {
        prompt: 'Ella va.',
        direction: 'es_to_en' as const,
        acceptable: ['She'],
      },
    };
    expect(checkAnswer(ex, { type: 'translation', text: 'He' }).correct).toBe(false);
  });

  it('translation: rechaza cuando hay demasiadas ediciones', () => {
    const ex = {
      type: 'translation' as const,
      payload: {
        prompt: 'Fui al cine.',
        direction: 'es_to_en' as const,
        acceptable: ['I went to the cinema.'],
      },
    };
    // "casa" en vez de "cinema" — no es un tipeo, es palabra distinta
    const r = checkAnswer(ex, { type: 'translation', text: 'I went to the house' });
    expect(r.correct).toBe(false);
  });

  it('fill_in_blank: acepta un tipeo en un hueco y marca typo', () => {
    const ex = {
      type: 'fill_in_blank' as const,
      payload: {
        segments: ['Yesterday I ', ' to the cinema.'],
        answers: ['went'],
      },
    };
    const r = checkAnswer(ex, { type: 'fill_in_blank', values: ['wnet'] });
    expect(r.correct).toBe(true);
    expect(r.typo).toBe(true);
  });
});

describe('checkAnswer — dialogue', () => {
  const ex = {
    type: 'dialogue' as const,
    payload: {
      turns: [
        { speaker: 'A', text: 'Hi' },
        { speaker: 'B', text: '' },
      ],
      blankTurnIndex: 1,
      options: ['Hello!', 'Yesterday.'],
      correctIndex: 0,
    },
  };
  it('acierta con la opción correcta', () => {
    expect(checkAnswer(ex, { type: 'dialogue', selectedIndex: 0 }).correct).toBe(true);
  });
  it('falla con la opción incorrecta', () => {
    expect(checkAnswer(ex, { type: 'dialogue', selectedIndex: 1 }).correct).toBe(false);
  });
});

describe('checkAnswer — listening (sub mc y sub fill)', () => {
  const mcEx = {
    type: 'listening' as const,
    payload: {
      audioText: 'We visited grandma.',
      sub: {
        kind: 'multiple_choice' as const,
        prompt: 'Who?',
        options: ['grandma', 'boss'],
        correctIndex: 0,
      },
    },
  };
  it('acierta el sub multiple_choice', () => {
    const r = checkAnswer(mcEx, {
      type: 'listening',
      sub: { kind: 'multiple_choice', selectedIndex: 0 },
    });
    expect(r.correct).toBe(true);
  });

  const fillEx = {
    type: 'listening' as const,
    payload: {
      audioText: 'It closes at eight.',
      sub: {
        kind: 'fill_in_blank' as const,
        segments: ['Closes at ', '.'],
        answers: ['eight'],
        acceptable: [['eight', '8']],
      },
    },
  };
  it('acierta el sub fill_in_blank con variante', () => {
    const r = checkAnswer(fillEx, {
      type: 'listening',
      sub: { kind: 'fill_in_blank', values: ['8'] },
    });
    expect(r.correct).toBe(true);
  });
  it('falla el sub fill con respuesta incorrecta', () => {
    const r = checkAnswer(fillEx, {
      type: 'listening',
      sub: { kind: 'fill_in_blank', values: ['nine'] },
    });
    expect(r.correct).toBe(false);
  });
});
