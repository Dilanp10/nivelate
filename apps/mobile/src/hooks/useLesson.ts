import type { ExerciseType, LearningGoal, Lesson, PronunciationHighlight } from '@nivelate/shared';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type PlayableExercise = {
  id: string;
  exerciseKey: string;
  type: ExerciseType;
  payload: unknown;
  sortOrder: number;
  goal: LearningGoal | null;
};

export type PlayableTeachingExample = {
  en: string;
  es: string;
  goal: LearningGoal | null;
};

export type PlayableTeachingCard = {
  id: string;
  key: string;
  titleEs: string;
  bodyEs: string;
  sortOrder: number;
  examples: PlayableTeachingExample[];
};

export type PlayableHighlight = Pick<PronunciationHighlight, 'en' | 'respelling_es'>;

export type PlayableLesson = {
  lesson: Lesson;
  exercises: PlayableExercise[];
  teachingCards: PlayableTeachingCard[];
  pronunciationHighlights: PlayableHighlight[];
};

async function fetchLesson(lessonId: string): Promise<PlayableLesson> {
  if (!supabase) throw new Error('Supabase no configurado');

  const { data: lesson, error: lessonErr } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();
  if (lessonErr || !lesson) throw new Error(lessonErr?.message ?? 'Lección no encontrada');

  const [
    { data: exercises, error: exErr },
    { data: cards, error: cardsErr },
    { data: highlights, error: hErr },
  ] = await Promise.all([
    supabase
      .from('exercises')
      .select('id, exercise_key, type, payload, sort_order, goal')
      .eq('lesson_id', lessonId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('teaching_cards')
      .select('id, key, title_es, body_es, sort_order, teaching_examples(en, es, goal, sort_order)')
      .eq('lesson_id', lessonId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('pronunciation_highlights')
      .select('en, respelling_es, sort_order')
      .eq('lesson_id', lessonId)
      .order('sort_order', { ascending: true }),
  ]);
  if (exErr) throw new Error(exErr.message);
  if (cardsErr) throw new Error(cardsErr.message);
  if (hErr) throw new Error(hErr.message);

  return {
    lesson,
    exercises: (exercises ?? []).map((e) => ({
      id: e.id,
      exerciseKey: e.exercise_key,
      type: e.type,
      payload: e.payload,
      sortOrder: e.sort_order,
      goal: (e.goal as LearningGoal | null) ?? null,
    })),
    teachingCards: (cards ?? []).map((c) => ({
      id: c.id,
      key: c.key,
      titleEs: c.title_es,
      bodyEs: c.body_es,
      sortOrder: c.sort_order,
      examples: [...(c.teaching_examples ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((ex) => ({
          en: ex.en,
          es: ex.es,
          goal: (ex.goal as LearningGoal | null) ?? null,
        })),
    })),
    pronunciationHighlights: (highlights ?? []).map((h) => ({
      en: h.en,
      respelling_es: h.respelling_es,
    })),
  };
}

export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => fetchLesson(lessonId),
    staleTime: 5 * 60_000, // el contenido casi no cambia
  });
}
