import type { ExerciseType, Lesson } from '@nivelate/shared';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type PlayableExercise = {
  id: string;
  exerciseKey: string;
  type: ExerciseType;
  payload: unknown;
  sortOrder: number;
};

export type PlayableLesson = {
  lesson: Lesson;
  exercises: PlayableExercise[];
};

async function fetchLesson(lessonId: string): Promise<PlayableLesson> {
  if (!supabase) throw new Error('Supabase no configurado');

  const { data: lesson, error: lessonErr } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();
  if (lessonErr || !lesson) throw new Error(lessonErr?.message ?? 'Lección no encontrada');

  const { data: exercises, error: exErr } = await supabase
    .from('exercises')
    .select('id, exercise_key, type, payload, sort_order')
    .eq('lesson_id', lessonId)
    .order('sort_order', { ascending: true });
  if (exErr) throw new Error(exErr.message);

  return {
    lesson,
    exercises: (exercises ?? []).map((e) => ({
      id: e.id,
      exerciseKey: e.exercise_key,
      type: e.type,
      payload: e.payload,
      sortOrder: e.sort_order,
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
