import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

async function fetchDueCount(userId: string): Promise<number> {
  if (!supabase) throw new Error('Supabase no configurado');
  const { count, error } = await supabase
    .from('srs_cards')
    .select('exercise_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('due_at', new Date().toISOString());
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Cuenta de cards due (para el badge de la home). Barato: count con head:true. */
export function useDueCardCount() {
  const userId = useAuthStore((s) => (s.state.status === 'authenticated' ? s.state.userId : null));
  return useQuery({
    queryKey: ['due-cards-count', userId],
    queryFn: () => fetchDueCount(userId ?? ''),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
