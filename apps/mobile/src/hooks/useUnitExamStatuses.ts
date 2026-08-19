import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

export type UnitExamStatus = {
  unitId: string;
  bestCorrect: number;
  bestTotal: number;
  bestPassed: boolean;
  attemptsCount: number;
  firstPassedAt: string | null;
};

async function fetchStatuses(userId: string): Promise<Map<string, UnitExamStatus>> {
  if (!supabase) throw new Error('Supabase no configurado');
  const { data, error } = await supabase
    .from('unit_exam_completions')
    .select('unit_id, best_correct, best_total, best_passed, attempts_count, first_passed_at')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  const map = new Map<string, UnitExamStatus>();
  for (const r of data ?? []) {
    map.set(r.unit_id, {
      unitId: r.unit_id,
      bestCorrect: r.best_correct,
      bestTotal: r.best_total,
      bestPassed: r.best_passed,
      attemptsCount: r.attempts_count,
      firstPassedAt: r.first_passed_at,
    });
  }
  return map;
}

export function useUnitExamStatuses() {
  const userId = useAuthStore((s) => (s.state.status === 'authenticated' ? s.state.userId : null));
  return useQuery({
    queryKey: ['unit-exams', userId],
    queryFn: () => fetchStatuses(userId ?? ''),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
