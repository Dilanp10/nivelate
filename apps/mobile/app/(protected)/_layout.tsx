import { canAccessProtected, computeDestination } from '@nivelate/shared';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth';

export default function ProtectedLayout() {
  const state = useAuthStore((s) => s.state);

  if (!canAccessProtected(state)) {
    const dest = computeDestination(state);
    if (dest) return <Redirect href={dest} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FBFAF8' } }} />
  );
}
