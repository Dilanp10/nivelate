import { computeDestination, shouldSeeAuthScreens } from '@nivelate/shared';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth';

export default function AuthLayout() {
  const state = useAuthStore((s) => s.state);

  // Si el usuario ya está autenticado (con o sin onboarding), lo mandamos donde corresponda.
  if (!shouldSeeAuthScreens(state)) {
    const dest = computeDestination(state);
    if (dest) return <Redirect href={dest} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#131f24' } }} />
  );
}
