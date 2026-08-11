import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

export type UnitProgress = {
  unitId: string;
  unitTitle: string;
  totalLessons: number;
  completedLessons: number;
};

export type ProgressData = {
  perUnit: UnitProgress[];
  globalCompleted: number;
  globalTotal: number;
};

async function fetchProgress(userId: string): Promise<ProgressData> {
  if (!supabase) throw new Error('Supabase no configurado');

  // Unidades publicadas con sus lecciones.
  const { data: units, error: unitsErr } = await supabase
    .from('units')
    .select('id, title, sort_order, lessons(id)')
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
    const lessons = (u.lessons ?? []) as { id: string }[];
    const completedLessons = lessons.filter((l) => completedSet.has(l.id)).length;
    globalCompleted += completedLessons;
    globalTotal += lessons.length;
    return {
      unitId: u.id,
      unitTitle: u.title,
      totalLessons: lessons.length,
      completedLessons,
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
