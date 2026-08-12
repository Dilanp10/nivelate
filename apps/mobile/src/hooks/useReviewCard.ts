import type { ReviewResult } from '@nivelate/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toFriendlyError } from '../lib/net';
import { supabase } from '../lib/supabase';

type Input = { exerciseId: string; correct: boolean };

// RPC review_card: solo mandamos correct/incorrect; el server aplica SM-2.
export function useReviewCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ exerciseId, correct }: Input): Promise<ReviewResult> => {
      if (!supabase) throw new Error('Supabase no configurado');
      try {
        const { data, error } = await supabase.rpc('review_card', {
          p_exercise_id: exerciseId,
          p_correct: correct,
        });
        if (error) throw new Error(toFriendlyError(error));
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) throw new Error('El servidor no devolvió el resultado');
        return row as ReviewResult;
      } catch (err) {
        throw new Error(toFriendlyError(err));
      }
    },
    onSuccess: () => {
      // El badge y la cola cambian tras cada review.
      qc.invalidateQueries({ queryKey: ['due-cards'] });
      qc.invalidateQueries({ queryKey: ['due-cards-count'] });
    },
  });
}
