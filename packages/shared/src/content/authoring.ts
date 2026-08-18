import { z } from 'zod';
import { LEARNING_GOAL_OPTIONS } from '../auth/types';
import { exercisePayloadSchema } from './exercise-types';

// Schema del archivo de autoría de una unidad: content/units/NN-slug.json.
// El loader (scripts/content-load.ts) valida cada archivo contra esto antes de
// escribir en la DB.

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug en kebab-case (a-z, 0-9, guiones)');

const cefrLevel = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const goalEnum = z.enum(LEARNING_GOAL_OPTIONS);

// Un ejercicio en el archivo: key + { type, payload } validado por su forma.
// Opcionalmente lleva `goal` para adaptación por learning_goal del perfil.
const authoringExerciseSchema = z.intersection(
  z.object({ key: slug, goal: goalEnum.nullish() }),
  exercisePayloadSchema,
);
export type AuthoringExercise = z.infer<typeof authoringExerciseSchema>;

const authoringTeachingExampleSchema = z.object({
  en: z.string().min(1),
  es: z.string().min(1),
  goal: goalEnum.nullish(),
});
export type AuthoringTeachingExample = z.infer<typeof authoringTeachingExampleSchema>;

const authoringTeachingCardSchema = z.object({
  key: slug,
  titleEs: z.string().min(1),
  bodyEs: z.string().min(1),
  examples: z.array(authoringTeachingExampleSchema).min(1),
});
export type AuthoringTeachingCard = z.infer<typeof authoringTeachingCardSchema>;

const authoringPronunciationHighlightSchema = z.object({
  en: z.string().min(1),
  respellingEs: z.string().min(1),
});
export type AuthoringPronunciationHighlight = z.infer<typeof authoringPronunciationHighlightSchema>;

const authoringLessonSchema = z.object({
  slug,
  title: z.string().min(1),
  grammarTopicSlugs: z.array(slug).optional(),
  teachingCards: z.array(authoringTeachingCardSchema).optional(),
  exercises: z.array(authoringExerciseSchema).min(1),
  pronunciationHighlights: z.array(authoringPronunciationHighlightSchema).min(1).max(10).optional(),
});
export type AuthoringLesson = z.infer<typeof authoringLessonSchema>;

const authoringGrammarTopicSchema = z.object({
  slug,
  title: z.string().min(1),
  explanationEs: z.string().min(1),
  cefrLevel,
});
export type AuthoringGrammarTopic = z.infer<typeof authoringGrammarTopicSchema>;

export const authoringUnitSchema = z
  .object({
    slug,
    title: z.string().min(1),
    description: z.string().optional(),
    cefrLevel,
    sortOrder: z.number().int().nonnegative(),
    isPublished: z.boolean(),
    grammarTopics: z.array(authoringGrammarTopicSchema).optional(),
    lessons: z.array(authoringLessonSchema).min(1),
  })
  .superRefine((unit, ctx) => {
    // slugs de lección únicos dentro de la unidad
    const lessonSlugs = new Set<string>();
    unit.lessons.forEach((lesson, i) => {
      if (lessonSlugs.has(lesson.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `slug de lección duplicado: ${lesson.slug}`,
          path: ['lessons', i, 'slug'],
        });
      }
      lessonSlugs.add(lesson.slug);

      // keys de ejercicio únicas dentro de la lección
      const keys = new Set<string>();
      lesson.exercises.forEach((ex, j) => {
        if (keys.has(ex.key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `key de ejercicio duplicada en la lección: ${ex.key}`,
            path: ['lessons', i, 'exercises', j, 'key'],
          });
        }
        keys.add(ex.key);
      });

      // keys de teaching card únicas dentro de la lección
      const cardKeys = new Set<string>();
      (lesson.teachingCards ?? []).forEach((card, j) => {
        if (cardKeys.has(card.key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `key de teaching card duplicada en la lección: ${card.key}`,
            path: ['lessons', i, 'teachingCards', j, 'key'],
          });
        }
        cardKeys.add(card.key);
      });

      // grammarTopicSlugs deben existir en grammarTopics de la unidad
      const declared = new Set((unit.grammarTopics ?? []).map((g) => g.slug));
      (lesson.grammarTopicSlugs ?? []).forEach((gslug, k) => {
        if (!declared.has(gslug)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `grammarTopicSlug "${gslug}" no está declarado en unit.grammarTopics`,
            path: ['lessons', i, 'grammarTopicSlugs', k],
          });
        }
      });
    });
  });

export type AuthoringUnit = z.infer<typeof authoringUnitSchema>;
