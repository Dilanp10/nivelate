import { Text, View } from 'react-native';
import { useOnlineStatus } from '../lib/useOnlineStatus';

// Banner discreto arriba cuando el browser reporta offline. Sin overlay,
// sin bloquear la UI. La app sigue usable con lo cacheado.
export function ConnectionBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <View accessibilityRole="alert" className="bg-danger/90 px-4 py-2 items-center">
      <Text className="text-white text-xs font-semibold">
        Sin conexión — algunas acciones pueden fallar
      </Text>
    </View>
  );
}
