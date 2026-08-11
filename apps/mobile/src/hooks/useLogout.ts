import { toSpanishAuthError } from '@nivelate/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error('Supabase no configurado');
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(toSpanishAuthError(error));
    },
    onSuccess: () => {
      // Limpiar todo cache — la próxima cuenta que entre no debe ver datos ajenos.
      qc.clear();
    },
  });
}
