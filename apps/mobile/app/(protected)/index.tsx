import { APP_CEFR_RANGE } from '@nivelate/shared';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuthStore } from '../../src/stores/auth';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

export default function Home() {
  const profile = useAuthStore((s) =>
    s.state.status === 'authenticated' ? s.state.profile : null,
  );

  const name = profile?.display_name ?? 'estudiante';

  return (
    <ScreenLayout title={`Hola, ${name}`} subtitle={`Camino ${APP_CEFR_RANGE.join(' → ')}`}>
      <View className="bg-surface border border-border rounded-xl p-5 gap-2">
        <Text className="text-text text-base font-semibold">Empezá cuando quieras</Text>
        <Text className="text-muted text-sm">
          Meta diaria: {profile?.daily_goal_min ?? 10} min. Las lecciones llegan con el módulo 004.
        </Text>
      </View>

      <Link href="/settings" className="text-brand text-sm mt-auto py-4" accessibilityRole="link">
        Configuración
      </Link>
    </ScreenLayout>
  );
}
