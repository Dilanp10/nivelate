import { describe, expect, it } from 'vitest';
import { authoringUnitSchema } from './authoring';

const validUnit = {
  slug: 'a2-refresh',
  title: 'A2 Refresh',
  cefrLevel: 'A2' as const,
  sortOrder: 1,
  isPublished: false,
  grammarTopics: [
    {
      slug: 'present-simple',
      title: 'Presente simple',
      explanationEs: 'Se usa para rutinas y hechos generales.',
      cefrLevel: 'A2' as const,
    },
  ],
  lessons: [
    {
      slug: 'present-simple-review',
      title: 'Presente simple',
      grammarTopicSlugs: ['present-simple'],
      exercises: [
        {
          key: 'u1l1-e1',
          type: 'multiple_choice' as const,
          payload: { prompt: 'She ___ tennis.', options: ['play', 'plays'], correctIndex: 1 },
        },
      ],
    },
  ],
};

describe('authoringUnitSchema', () => {
  it('acepta una unidad válida', () => {
    const r = authoringUnitSchema.safeParse(validUnit);
    expect(r.success).toBe(true);
  });

  it('rechaza slug no kebab-case', () => {
    const r = authoringUnitSchema.safeParse({ ...validUnit, slug: 'A2 Refresh' });
    expect(r.success).toBe(false);
  });

  it('rechaza slugs de lección duplicados', () => {
    const r = authoringUnitSchema.safeParse({
      ...validUnit,
      lessons: [validUnit.lessons[0], validUnit.lessons[0]],
    });
    expect(r.success).toBe(false);
  });

  it('rechaza keys de ejercicio duplicadas en una lección', () => {
    const r = authoringUnitSchema.safeParse({
      ...validUnit,
      lessons: [
        {
          ...validUnit.lessons[0],
          exercises: [validUnit.lessons[0].exercises[0], validUnit.lessons[0].exercises[0]],
        },
      ],
    });
    expect(r.success).toBe(false);
  });

  it('rechaza grammarTopicSlug no declarado', () => {
    const r = authoringUnitSchema.safeParse({
      ...validUnit,
      lessons: [{ ...validUnit.lessons[0], grammarTopicSlugs: ['inexistente'] }],
    });
    expect(r.success).toBe(false);
  });
});
