import '../global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
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

  // Inyectar Google Fonts en el head de web (Inter + Space Grotesk). Metro descarta
  // `@import` en global.css, y app.json no soporta `web.head` en SDK 52. useEffect
  // agrega el <link> una vez en runtime; en native es no-op.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    if (document.getElementById('nivelate-google-fonts')) return;
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.gstatic.com';
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);
    const link = document.createElement('link');
    link.id = 'nivelate-google-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
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
