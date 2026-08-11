import '../global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '../src/lib/query-client';
import { useAuthStore } from '../src/stores/auth';
import { Splash } from '../src/ui/Splash';

export default function RootLayout() {
  const status = useAuthStore((s) => s.state.status);
  const hydrate = useAuthStore((s) => s.hydrate);
  const subscribe = useAuthStore((s) => s.subscribe);

  useEffect(() => {
    hydrate();
    const unsubscribe = subscribe();
    return unsubscribe;
  }, [hydrate, subscribe]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {status === 'loading' ? <Splash /> : <Slot />}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
