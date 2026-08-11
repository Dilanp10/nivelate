import type { ForgotPasswordForm } from '@nivelate/shared';
import { toSpanishAuthError } from '@nivelate/shared';
import { useMutation } from '@tanstack/react-query';
import { getRedirectUrl } from '../lib/auth-redirect';
import { supabase } from '../lib/supabase';

export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email }: ForgotPasswordForm) => {
      if (!supabase) throw new Error('Supabase no configurado');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl('/reset-password'),
      });

      if (error) throw new Error(toSpanishAuthError(error));
      return { sent: true };
    },
  });
}
