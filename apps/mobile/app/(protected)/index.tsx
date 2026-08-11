import { APP_CEFR_RANGE, levelForXp } from '@nivelate/shared';
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
  const totalXp = profile?.total_xp ?? 0;
  const streak = profile?.current_streak ?? 0;
  const level = levelForXp(totalXp);

  return (
    <ScreenLayout title={`Hola, ${name}`} subtitle={`Camino ${APP_CEFR_RANGE.join(' → ')}`}>
      {/* Widget racha + nivel/XP */}
      <Pressable
        onPress={() => router.push('/progress')}
        accessibilityRole="button"
        accessibilityLabel="Ver mi progreso"
        className="flex-row items-center gap-4 bg-surface border border-border rounded-xl p-4 active:opacity-90"
      >
        <View className="items-center">
          <Text className="text-2xl">🔥</Text>
          <Text className="text-text text-lg font-bold">{streak}</Text>
          <Text className="text-muted text-[10px]">{streak === 1 ? 'día' : 'días'}</Text>
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row justify-between">
            <Text className="text-text text-sm font-semibold">Nivel {level.level}</Text>
            <Text className="text-muted text-xs">{totalXp} XP</Text>
          </View>
          <View className="h-2 rounded-full bg-bg overflow-hidden">
            <View
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.round(level.progress * 100)}%` }}
            />
          </View>
        </View>
      </Pressable>

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

      <View className="flex-row gap-4 mt-auto">
        <Link href="/progress" className="text-brand text-sm py-4" accessibilityRole="link">
          Mi progreso
        </Link>
        <Link href="/settings" className="text-muted text-sm py-4" accessibilityRole="link">
          Configuración
        </Link>
      </View>
    </ScreenLayout>
  );
}
