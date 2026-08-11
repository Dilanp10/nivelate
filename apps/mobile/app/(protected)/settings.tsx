import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useLogout } from '../../src/hooks/useLogout';
import { useAuthStore } from '../../src/stores/auth';
import { Button } from '../../src/ui/Button';
import { FormError } from '../../src/ui/FormError';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

export default function Settings() {
  const router = useRouter();
  const email = useAuthStore((s) => (s.state.status === 'authenticated' ? s.state.email : ''));
  const logout = useLogout();

  const error = logout.error instanceof Error ? logout.error.message : null;

  return (
    <ScreenLayout title="Configuración" subtitle={email}>
      <FormError message={error} />

      <View className="gap-2">
        <Text className="text-muted text-xs uppercase tracking-wider">Cuenta</Text>
        <Button
          label="Cerrar sesión"
          variant="secondary"
          loading={logout.isPending}
          loadingLabel="Cerrando…"
          onPress={() => logout.mutate()}
        />
      </View>

      <Button
        label="Volver"
        variant="ghost"
        onPress={() => router.back()}
        accessibilityLabel="Volver a la home"
      />
    </ScreenLayout>
  );
}
