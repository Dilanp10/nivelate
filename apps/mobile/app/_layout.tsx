import '../global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConnectionBanner } from '../src/components/ConnectionBanner';
import { UpdateAvailableBanner } from '../src/components/UpdateAvailableBanner';
import { queryClient } from '../src/lib/query-client';
import { registerServiceWorker } from '../src/lib/sw-register';
import { useAuthStore } from '../src/stores/auth';
import { Splash } from '../src/ui/Splash';

export default function RootLayout() {
  const status = useAuthStore((s) => s.state.status);
  const hydrate = useAuthStore((s) => s.hydrate);
  const subscribe = useAuthStore((s) => s.subscribe);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);

  useEffect(() => {
    hydrate();
    const unsubscribe = subscribe();
    return unsubscribe;
  }, [hydrate, subscribe]);

  useEffect(() => {
    registerServiceWorker({
      onUpdateAvailable: (worker) => {
        setUpdateDismissed(false);
        setWaitingWorker(worker);
      },
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View className="flex-1">
          <ConnectionBanner />
          {!updateDismissed ? (
            <UpdateAvailableBanner
              worker={waitingWorker}
              onDismiss={() => setUpdateDismissed(true)}
            />
          ) : null}
          {status === 'loading' ? <Splash /> : <Slot />}
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
