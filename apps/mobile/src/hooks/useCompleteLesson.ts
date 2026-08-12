import type { CompleteLessonResult } from '@nivelate/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toFriendlyError } from '../lib/net';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

type Input = {
  lessonId: string;
  total: number;
  firstTryCorrect: number;
  /**
   * Uuid estable para este intento de completar la lección. El caller debe
   * generarlo una sola vez (ej. con crypto.randomUUID()) y reusarlo en los
   * reintentos del mismo intento — así un retry tras una respuesta perdida
   * no vuelve a otorgar XP. Ver spec 003 + fix de idempotencia en 20260817.
   */
  idempotencyKey: string;
};

// Llama al RPC atómico complete_lesson. La XP la calcula el server; acá solo
// mandamos los conteos + la idempotency key.
export function useCompleteLesson() {
  const qc = useQueryClient();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  return useMutation({
    mutationFn: async ({
      lessonId,
      total,
      firstTryCorrect,
      idempotencyKey,
    }: Input): Promise<CompleteLessonResult> => {
      if (!supabase) throw new Error('Supabase no configurado');
      try {
        const { data, error } = await supabase.rpc('complete_lesson', {
          p_lesson_id: lessonId,
          p_total: total,
          p_first_try_correct: firstTryCorrect,
          p_idempotency_key: idempotencyKey,
        });
        if (error) throw new Error(toFriendlyError(error));
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) throw new Error('El servidor no devolvió el resultado');
        return row as CompleteLessonResult;
      } catch (err) {
        throw new Error(toFriendlyError(err));
      }
    },
    onSuccess: async () => {
      await refreshProfile();
      qc.invalidateQueries({ queryKey: ['progress'] });
      // 007: si desbloqueó logros, invalidamos el grid.
      qc.invalidateQueries({ queryKey: ['user-achievements'] });
    },
  });
}
