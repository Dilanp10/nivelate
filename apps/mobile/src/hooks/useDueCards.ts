import { SRS_MAX_DAILY_CARDS } from '@nivelate/shared';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';
import type { PlayableExercise } from './useLesson';

export type DueCard = {
  cardId: string; // (user_id, exercise_id) — usamos exercise_id como id de card
  exercise: PlayableExercise;
  intervalDays: number;
  repetitions: number;
};

async function fetchDueCards(userId: string): Promise<DueCard[]> {
  if (!supabase) throw new Error('Supabase no configurado');

  // Nota: no podemos joinar hasta units en un select simple; el filtro por
  // is_published lo hacemos abajo con un segundo lookup barato. RLS ya bloquea
  // ejercicios de unidades no publicadas para el rol authenticated, así que en
  // la práctica el join no devuelve filas si la unidad se despublica.
  const { data, error } = await supabase
    .from('srs_cards')
    .select(
      `interval_days, repetitions,
       exercise:exercises!inner (
         id, exercise_key, type, payload, sort_order,
         lesson:lessons!inner (
           unit:units!inner ( is_published )
         )
       )`,
    )
    .eq('user_id', userId)
    .lte('due_at', new Date().toISOString())
    .order('due_at', { ascending: true })
    .limit(SRS_MAX_DAILY_CARDS);

  if (error) throw new Error(error.message);

  type Row = {
    interval_days: number;
    repetitions: number;
    exercise: {
      id: string;
      exercise_key: string;
      type: PlayableExercise['type'];
      payload: unknown;
      sort_order: number;
      lesson: { unit: { is_published: boolean } };
    };
  };

  return (data as unknown as Row[])
    .filter((r) => r.exercise?.lesson?.unit?.is_published)
    .map((r) => ({
      cardId: r.exercise.id,
      exercise: {
        id: r.exercise.id,
        exerciseKey: r.exercise.exercise_key,
        type: r.exercise.type,
        payload: r.exercise.payload,
        sortOrder: r.exercise.sort_order,
      },
      intervalDays: r.interval_days,
      repetitions: r.repetitions,
    }));
}

export function useDueCards() {
  const userId = useAuthStore((s) => (s.state.status === 'authenticated' ? s.state.userId : null));
  return useQuery({
    queryKey: ['due-cards', userId],
    queryFn: () => fetchDueCards(userId ?? ''),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
