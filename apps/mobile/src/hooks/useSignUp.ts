import type { SignupForm } from '@nivelate/shared';
import { toSpanishAuthError } from '@nivelate/shared';
import { useMutation } from '@tanstack/react-query';
import { getRedirectUrl } from '../lib/auth-redirect';
import { isNetworkError } from '../lib/net';
import { supabase } from '../lib/supabase';

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password }: SignupForm) => {
      if (!supabase) throw new Error('Supabase no configurado');
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: getRedirectUrl('/callback') },
        });
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
