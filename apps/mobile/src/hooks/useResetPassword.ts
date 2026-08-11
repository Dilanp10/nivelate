import { toSpanishAuthError } from '@nivelate/shared';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!supabase) throw new Error('Supabase no configurado');

      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(toSpanishAuthError(error));
      return data;
    },
  });
}
