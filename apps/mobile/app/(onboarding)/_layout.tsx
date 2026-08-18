import { ROUTES, computeDestination } from '@nivelate/shared';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth';

export default function OnboardingLayout() {
  const state = useAuthStore((s) => s.state);
  const dest = computeDestination(state);

  // Solo dejamos pasar si computeDestination coincide con onboarding.
  if (dest && dest !== ROUTES.onboarding) {
    return <Redirect href={dest} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#131f24' } }} />
  );
}
