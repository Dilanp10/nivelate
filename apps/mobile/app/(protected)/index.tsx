import { APP_CEFR_RANGE, levelForXp } from '@nivelate/shared';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useDueCardCount } from '../../src/hooks/useDueCardCount';
import { useFirstLesson } from '../../src/hooks/useFirstLesson';
import { useAuthStore } from '../../src/stores/auth';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

// Nota: todos los targets de navegación usan <Link asChild><Pressable>. En
// Expo Router web con output:'single', los Pressable con router.push a veces
// no navegan al primer tap; el Link emite el anchor real y funciona siempre.
export default function Home() {
  const profile = useAuthStore((s) =>
    s.state.status === 'authenticated' ? s.state.profile : null,
  );
  const firstLesson = useFirstLesson();
  const dueCount = useDueCardCount();

  const name = profile?.display_name ?? 'estudiante';
  const dueCards = dueCount.data ?? 0;
  const totalXp = profile?.total_xp ?? 0;
  const streak = profile?.current_streak ?? 0;
  const level = levelForXp(totalXp);

  return (
    <ScreenLayout title={`Hola, ${name}`} subtitle={`Camino ${APP_CEFR_RANGE.join(' → ')}`}>
      {/* Widget racha + nivel/XP */}
      <Link href="/progress" asChild accessibilityLabel="Ver mi progreso">
        <Pressable className="flex-row items-center gap-4 bg-surface border border-border rounded-xl p-4 active:opacity-90">
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
      </Link>

      {dueCards > 0 ? (
        <Link href="/review" asChild accessibilityLabel={`Repasar ${dueCards} cards`}>
          <Pressable className="bg-surface border border-brand rounded-xl p-4 flex-row items-center gap-3 active:opacity-90">
            <Text className="text-2xl">🔁</Text>
            <View className="flex-1">
              <Text className="text-text text-base font-semibold">
                Tenés {dueCards} para repasar
              </Text>
              <Text className="text-muted text-xs">Mantener lo aprendido → tocá para empezar</Text>
            </View>
            <Text className="text-brand text-lg">›</Text>
          </Pressable>
        </Link>
      ) : null}

      {firstLesson.data ? (
        <Link
          href={`/lesson/${firstLesson.data.lessonId}`}
          asChild
          accessibilityLabel={`Empezar lección: ${firstLesson.data.lessonTitle}`}
        >
          <Pressable className="bg-brand rounded-xl p-5 gap-1 active:opacity-90">
            <Text className="text-bg text-xs font-semibold uppercase tracking-wider">
              {firstLesson.data.unitTitle}
            </Text>
            <Text className="text-bg text-lg font-bold">{firstLesson.data.lessonTitle}</Text>
            <Text className="text-bg/80 text-sm">Empezar lección →</Text>
          </Pressable>
        </Link>
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
