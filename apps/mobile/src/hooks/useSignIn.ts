import type { LoginForm } from '@nivelate/shared';
import { toSpanishAuthError } from '@nivelate/shared';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: LoginForm) => {
      if (!supabase) throw new Error('Supabase no configurado');

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(toSpanishAuthError(error));
      return data;
    },
  });
}
