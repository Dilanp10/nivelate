import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type LessonLink = {
  lessonId: string;
  lessonTitle: string;
  unitTitle: string;
};

// Trae la primera lección de la primera unidad publicada (por sort_order).
// Sirve como punto de entrada rápido desde la home mientras no hay pantalla
// de índice de unidades (eso llega en un módulo posterior).
async function fetchFirstLesson(): Promise<LessonLink | null> {
  if (!supabase) return null;

  const { data: unit, error: unitErr } = await supabase
    .from('units')
    .select('id, title')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (unitErr || !unit) return null;

  const { data: lesson, error: lessonErr } = await supabase
    .from('lessons')
    .select('id, title')
    .eq('unit_id', unit.id)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (lessonErr || !lesson) return null;

  return { lessonId: lesson.id, lessonTitle: lesson.title, unitTitle: unit.title };
}

export function useFirstLesson() {
  return useQuery({
    queryKey: ['first-lesson'],
    queryFn: fetchFirstLesson,
    staleTime: 5 * 60_000,
  });
}
