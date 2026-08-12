import type { CompleteLessonResult } from '@nivelate/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

type Input = {
  lessonId: string;
  total: number;
  firstTryCorrect: number;
};

// Llama al RPC atómico complete_lesson. La XP la calcula el server; acá solo
// mandamos los conteos.
export function useCompleteLesson() {
  const qc = useQueryClient();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  return useMutation({
    mutationFn: async ({
      lessonId,
      total,
      firstTryCorrect,
    }: Input): Promise<CompleteLessonResult> => {
      if (!supabase) throw new Error('Supabase no configurado');
      const { data, error } = await supabase.rpc('complete_lesson', {
        p_lesson_id: lessonId,
        p_total: total,
        p_first_try_correct: firstTryCorrect,
      });
      if (error) throw new Error(error.message);
      // El RPC devuelve un array de una fila.
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error('El servidor no devolvió el resultado');
      return row as CompleteLessonResult;
    },
    onSuccess: async () => {
      await refreshProfile();
      qc.invalidateQueries({ queryKey: ['progress'] });
      // 007: si desbloqueó logros, invalidamos el grid.
      qc.invalidateQueries({ queryKey: ['user-achievements'] });
    },
  });
}
