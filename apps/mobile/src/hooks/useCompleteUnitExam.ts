import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toFriendlyError } from '../lib/net';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

export type CompleteUnitExamResult = {
  xp_awarded: number;
  new_total_xp: number;
  best_correct: number;
  best_total: number;
  passed: boolean;
  best_passed: boolean;
};

type Input = {
  unitId: string;
  total: number;
  correct: number;
  /** Uuid estable — mismo intento no re-otorga XP (idempotencia server-side). */
  idempotencyKey: string;
};

export function useCompleteUnitExam() {
  const qc = useQueryClient();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  return useMutation({
    mutationFn: async ({
      unitId,
      total,
      correct,
      idempotencyKey,
    }: Input): Promise<CompleteUnitExamResult> => {
      if (!supabase) throw new Error('Supabase no configurado');
      try {
        const { data, error } = await supabase.rpc('complete_unit_exam', {
          p_unit_id: unitId,
          p_total: total,
          p_correct: correct,
          p_idempotency_key: idempotencyKey,
        });
        if (error) throw new Error(toFriendlyError(error));
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) throw new Error('El servidor no devolvió el resultado');
        return row as CompleteUnitExamResult;
      } catch (err) {
        throw new Error(toFriendlyError(err));
      }
    },
    onSuccess: async () => {
      await refreshProfile();
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['unit-exams'] });
    },
  });
}
