import { toSpanishAuthError } from '@nivelate/shared';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSignUp } from '../../src/hooks/useSignUp';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/stores/auth';
import { Button } from '../../src/ui/Button';
import { FormError } from '../../src/ui/FormError';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

const POLL_INTERVAL_MS = 5_000;

/**
 * Muestra "revisá tu email" y hace poll a getUser() cada 5s para detectar
 * cuando el usuario clickeó el link (posiblemente en otro dispositivo).
 * Cuando el email queda confirmado, el store se refresca y el layout de (auth)
 * lo redirige a /welcome o /home según corresponda.
 */
export default function VerifyEmail() {
  const params = useLocalSearchParams<{ email?: string }>();
  const emailFromParams = typeof params.email === 'string' ? params.email : '';
  const email = useAuthStore((s) =>
    s.state.status === 'authenticated' ? s.state.email : emailFromParams,
  );

  const resend = useSignUp();
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const interval = setInterval(async () => {
      // getUser() consulta el server; onAuthStateChange va a disparar USER_UPDATED
      // si el email pasó a confirmado y el store se actualiza solo.
      await supabase?.auth.getUser();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleResend() {
    if (!supabase || !email) return;
    setResendMsg(null);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      setResendMsg(toSpanishAuthError(error));
    } else {
      setResendMsg('Listo, te reenviamos el email.');
    }
  }

  return (
    <ScreenLayout
      title="Confirmá tu email"
      subtitle={email || 'Revisá la casilla que usaste al registrarte.'}
    >
      <View className="bg-surface border border-border rounded-xl p-5 gap-3">
        <Text className="text-text text-base">
          Te enviamos un link. Cuando lo abras, esta pantalla se va sola.
        </Text>
        <Text className="text-muted text-sm">
          Puede tardar un minuto. Revisá también la carpeta de spam.
        </Text>
      </View>

      {resendMsg ? (
        <View className="bg-surface border border-border rounded-lg px-3 py-2">
          <Text className="text-text text-sm">{resendMsg}</Text>
        </View>
      ) : null}
      <FormError message={resend.error instanceof Error ? resend.error.message : null} />

      <Button label="Reenviar email" variant="secondary" onPress={handleResend} disabled={!email} />

      <Link href="/login" className="text-muted text-sm self-center mt-2">
        Cambiar de cuenta
      </Link>
    </ScreenLayout>
  );
}
