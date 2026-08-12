import type { LoginForm } from '@nivelate/shared';
import { toSpanishAuthError } from '@nivelate/shared';
import { useMutation } from '@tanstack/react-query';
import { isNetworkError } from '../lib/net';
import { supabase } from '../lib/supabase';

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: LoginForm) => {
      if (!supabase) throw new Error('Supabase no configurado');
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(toSpanishAuthError(error));
        return data;
      } catch (err) {
        if (isNetworkError(err)) {
          throw new Error('Sin conexión. Volvé a intentar cuando tengas red.');
        }
        throw err;
      }
    },
  });
}
