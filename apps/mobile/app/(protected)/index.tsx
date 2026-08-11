import { APP_CEFR_RANGE } from '@nivelate/shared';
import { Link, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useFirstLesson } from '../../src/hooks/useFirstLesson';
import { useAuthStore } from '../../src/stores/auth';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

export default function Home() {
  const router = useRouter();
  const profile = useAuthStore((s) =>
    s.state.status === 'authenticated' ? s.state.profile : null,
  );
  const firstLesson = useFirstLesson();

  const name = profile?.display_name ?? 'estudiante';

  return (
    <ScreenLayout title={`Hola, ${name}`} subtitle={`Camino ${APP_CEFR_RANGE.join(' → ')}`}>
      {firstLesson.data ? (
        <Pressable
          onPress={() => router.push(`/lesson/${firstLesson.data?.lessonId}`)}
          accessibilityRole="button"
          className="bg-brand rounded-xl p-5 gap-1 active:opacity-90"
        >
          <Text className="text-bg text-xs font-semibold uppercase tracking-wider">
            {firstLesson.data.unitTitle}
          </Text>
          <Text className="text-bg text-lg font-bold">{firstLesson.data.lessonTitle}</Text>
          <Text className="text-bg/80 text-sm">Empezar lección →</Text>
        </Pressable>
      ) : (
        <View className="bg-surface border border-border rounded-xl p-5 gap-2">
          <Text className="text-text text-base font-semibold">
            Todavía no hay lecciones publicadas
          </Text>
          <Text className="text-muted text-sm">
            El contenido llega con el módulo de currículum. Meta diaria:{' '}
            {profile?.daily_goal_min ?? 10} min.
          </Text>
        </View>
      )}

      <Link href="/settings" className="text-brand text-sm mt-auto py-4" accessibilityRole="link">
        Configuración
      </Link>
    </ScreenLayout>
  );
}
