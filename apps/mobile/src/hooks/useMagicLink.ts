import type { MagicLinkForm } from '@nivelate/shared';
import { toSpanishAuthError } from '@nivelate/shared';
import { useMutation } from '@tanstack/react-query';
import { getRedirectUrl } from '../lib/auth-redirect';
import { supabase } from '../lib/supabase';

export function useMagicLink() {
  return useMutation({
    mutationFn: async ({ email }: MagicLinkForm) => {
      if (!supabase) throw new Error('Supabase no configurado');

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: getRedirectUrl('/callback'),
        },
      });

      if (error) throw new Error(toSpanishAuthError(error));
      // No revelamos si el email existe — el UI muestra siempre el mismo mensaje.
      return { sent: true };
    },
  });
}
