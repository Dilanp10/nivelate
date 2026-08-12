import { ACHIEVEMENTS, type AchievementWithStatus } from '@nivelate/shared';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

async function fetchUnlocked(userId: string): Promise<Set<string>> {
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r) => r.achievement_id));
}

export function useAchievements() {
  const userId = useAuthStore((s) => (s.state.status === 'authenticated' ? s.state.userId : null));
  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: async (): Promise<AchievementWithStatus[]> => {
      const unlocked = await fetchUnlocked(userId ?? '');
      return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: unlocked.has(a.id) }));
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}
