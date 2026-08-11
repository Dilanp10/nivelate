import { describe, expect, it } from 'vitest';
import { currentExerciseId, initLesson, lessonReducer, summarize } from './lesson-machine';

describe('lesson-machine', () => {
  it('arranca en answering con el primer ejercicio', () => {
    const s = initLesson(['a', 'b', 'c']);
    expect(s.phase).toBe('answering');
    expect(currentExerciseId(s)).toBe('a');
  });

  it('lección vacía va directo a summary', () => {
    const s = initLesson([]);
    expect(s.phase).toBe('summary');
  });

  it('acertar todos al primer intento completa la lección', () => {
    let s = initLesson(['a', 'b']);
    s = lessonReducer(s, { kind: 'ANSWER', correct: true });
    expect(s.phase).toBe('feedback');
    s = lessonReducer(s, { kind: 'CONTINUE' });
    expect(currentExerciseId(s)).toBe('b');
    s = lessonReducer(s, { kind: 'ANSWER', correct: true });
    s = lessonReducer(s, { kind: 'CONTINUE' });
    expect(s.phase).toBe('summary');

    const sum = summarize(s);
    expect(sum.total).toBe(2);
    expect(sum.firstTryCorrect).toBe(2);
    expect(sum.estimatedXp).toBe(20);
  });

  it('fallar reencola el ejercicio al final', () => {
    let s = initLesson(['a', 'b']);
    // fallar 'a'
    s = lessonReducer(s, { kind: 'ANSWER', correct: false });
    s = lessonReducer(s, { kind: 'CONTINUE' });
    // ahora debería tocar 'b', con 'a' al final
    expect(currentExerciseId(s)).toBe('b');
    expect(s.queue).toEqual(['b', 'a']);
    // acertar 'b'
    s = lessonReducer(s, { kind: 'ANSWER', correct: true });
    s = lessonReducer(s, { kind: 'CONTINUE' });
    // vuelve 'a'
    expect(currentExerciseId(s)).toBe('a');
    // acertar 'a' (segundo intento)
    s = lessonReducer(s, { kind: 'ANSWER', correct: true });
    s = lessonReducer(s, { kind: 'CONTINUE' });
    expect(s.phase).toBe('summary');

    const sum = summarize(s);
    expect(sum.total).toBe(2);
    // 'a' falló al primer intento, 'b' acertó
    expect(sum.firstTryCorrect).toBe(1);
    expect(sum.estimatedXp).toBe(15);
  });

  it('firstTryCorrect no se pisa si después se acierta', () => {
    let s = initLesson(['a']);
    s = lessonReducer(s, { kind: 'ANSWER', correct: false });
    s = lessonReducer(s, { kind: 'CONTINUE' });
    s = lessonReducer(s, { kind: 'ANSWER', correct: true });
    s = lessonReducer(s, { kind: 'CONTINUE' });
    expect(summarize(s).firstTryCorrect).toBe(0);
  });

  it('ignora ANSWER fuera de fase answering', () => {
    let s = initLesson(['a']);
    s = lessonReducer(s, { kind: 'ANSWER', correct: true });
    const again = lessonReducer(s, { kind: 'ANSWER', correct: false });
    expect(again).toBe(s); // sin cambios
  });
});
