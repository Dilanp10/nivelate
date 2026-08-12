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

  // No filtramos por unidad publicada acá: la RLS de "exercises" ya exige que
  // la unidad esté publicada (ver spec 004), y exercises!inner descarta la
  // fila de srs_cards entera si el embed falla esa RLS. Un ejercicio de unidad
  // despublicada nunca llega a este resultado.
  const { data, error } = await supabase
    .from('srs_cards')
    .select(
      `interval_days, repetitions,
       exercise:exercises!inner ( id, exercise_key, type, payload, sort_order )`,
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
    };
  };

  return (data as unknown as Row[]).map((r) => ({
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
