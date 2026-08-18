import type { DailyGoal, LearningGoal, SelfLevel } from '@nivelate/shared';
import { toSpanishAuthError } from '@nivelate/shared';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

type OnboardingInput = {
  displayName: string | null;
  dailyGoalMin: DailyGoal;
  learningGoal: LearningGoal | null;
  selfLevel: SelfLevel | null;
};

export function useOnboarding() {
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  return useMutation({
    mutationFn: async ({ displayName, dailyGoalMin, learningGoal, selfLevel }: OnboardingInput) => {
      if (!supabase) throw new Error('Supabase no configurado');

      const { data: sessionData } = await supabase.auth.getUser();
      const userId = sessionData.user?.id;
      if (!userId) throw new Error('Tu sesión expiró. Volvé a entrar.');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName && displayName.length > 0 ? displayName : null,
          daily_goal_min: dailyGoalMin,
          learning_goal: learningGoal,
          self_level: selfLevel,
          onboarded_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new Error(toSpanishAuthError(error));
      return data;
    },
    onSuccess: async () => {
      await refreshProfile();
    },
  });
}
