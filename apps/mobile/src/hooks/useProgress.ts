import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

export type LessonProgress = {
  lessonId: string;
  lessonTitle: string;
  sortOrder: number;
  completed: boolean;
};

export type UnitProgress = {
  unitId: string;
  unitTitle: string;
  unitSortOrder: number;
  totalLessons: number;
  completedLessons: number;
  lessons: LessonProgress[];
};

export type ProgressData = {
  perUnit: UnitProgress[];
  globalCompleted: number;
  globalTotal: number;
};

async function fetchProgress(userId: string): Promise<ProgressData> {
  if (!supabase) throw new Error('Supabase no configurado');

  // Unidades publicadas con sus lecciones (id + título + orden).
  const { data: units, error: unitsErr } = await supabase
    .from('units')
    .select('id, title, sort_order, lessons(id, title, sort_order)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (unitsErr) throw new Error(unitsErr.message);

  // Lecciones completadas por el usuario.
  const { data: completions, error: compErr } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('user_id', userId);
  if (compErr) throw new Error(compErr.message);

  const completedSet = new Set((completions ?? []).map((c) => c.lesson_id));

  let globalCompleted = 0;
  let globalTotal = 0;
  const perUnit: UnitProgress[] = (units ?? []).map((u) => {
    const rawLessons = (u.lessons ?? []) as { id: string; title: string; sort_order: number }[];
    const lessons: LessonProgress[] = [...rawLessons]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l) => ({
        lessonId: l.id,
        lessonTitle: l.title,
        sortOrder: l.sort_order,
        completed: completedSet.has(l.id),
      }));
    const completedLessons = lessons.filter((l) => l.completed).length;
    globalCompleted += completedLessons;
    globalTotal += lessons.length;
    return {
      unitId: u.id,
      unitTitle: u.title,
      unitSortOrder: u.sort_order,
      totalLessons: lessons.length,
      completedLessons,
      lessons,
    };
  });

  return { perUnit, globalCompleted, globalTotal };
}

export function useProgress() {
  const userId = useAuthStore((s) => (s.state.status === 'authenticated' ? s.state.userId : null));
  return useQuery({
    queryKey: ['progress', userId],
    queryFn: () => fetchProgress(userId ?? ''),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
