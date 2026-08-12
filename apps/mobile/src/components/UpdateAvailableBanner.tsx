import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { activateWaitingSw } from '../lib/sw-register';

type Props = {
  worker: ServiceWorker | null;
  onDismiss: () => void;
};

// Aparece cuando el SW detectó una versión nueva instalada. Tocar "Actualizar"
// hace skipWaiting + reload.
export function UpdateAvailableBanner({ worker, onDismiss }: Props) {
  const [applying, setApplying] = useState(false);
  if (!worker) return null;

  function handleUpdate() {
    if (!worker) return;
    setApplying(true);
    activateWaitingSw(worker);
    // Cuando el SW nuevo pasa a "activated" y toma control, recargamos.
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (typeof window !== 'undefined') window.location.reload();
      });
    }
  }

  return (
    <View
      accessibilityRole="alert"
      className="bg-brand/90 px-4 py-2 flex-row items-center justify-between gap-2"
    >
      <Text className="text-bg text-xs font-semibold flex-1">Nueva versión disponible</Text>
      <Pressable
        onPress={handleUpdate}
        disabled={applying}
        accessibilityRole="button"
        className="bg-bg px-3 py-1 rounded-md"
      >
        <Text className="text-brand text-xs font-semibold">
          {applying ? 'Actualizando…' : 'Actualizar'}
        </Text>
      </Pressable>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Descartar"
        className="px-2 py-1"
      >
        <Text className="text-bg text-sm">✕</Text>
      </Pressable>
    </View>
  );
}
