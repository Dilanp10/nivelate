import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../../src/stores/auth';

/**
 * Landing de los deep links de Supabase (signup, magic link).
 * Supabase captura los tokens del hash/query automáticamente
 * (detectSessionInUrl: true) y dispara SIGNED_IN.
 *
 * Nosotros solo esperamos a que el store se actualice y redirigimos
 * a donde corresponda según el estado real.
 */
export default function Callback() {
  const state = useAuthStore((s) => s.state);

  if (state.status === 'loading') {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#0E7C7B" />
      </View>
    );
  }

  // Si por alguna razón el token no aterrizó, volvemos a login.
  if (state.status === 'anonymous') {
    return <Redirect href="/login" />;
  }

  // Autenticado — el layout de (auth) va a redirigir a donde corresponda
  // (verify-email si falta confirmar, welcome si falta onboarding, o home).
  return <Redirect href="/" />;
}
