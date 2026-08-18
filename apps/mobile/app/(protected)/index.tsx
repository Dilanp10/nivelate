import { APP_CEFR_RANGE, levelForXp } from '@nivelate/shared';
import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDueCardCount } from '../../src/hooks/useDueCardCount';
import { useFirstLesson } from '../../src/hooks/useFirstLesson';
import { useAuthStore } from '../../src/stores/auth';

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
  const pct = Math.round(level.progress * 100);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-4 pb-8 w-full max-w-md mx-auto gap-5"
      >
        {/* Header — los accesos a progreso y ajustes viven en la nav de abajo. */}
        <View>
          <Text className="text-text text-2xl font-bold">Hola, {name}</Text>
          <Text className="text-muted text-sm">Camino {APP_CEFR_RANGE.join(' → ')}</Text>
        </View>

        {/* Racha + XP: dos métricas, dos colores. Nivel vive en la barra. */}
        <View className="flex-row gap-3">
          {/* El valor va en el accessibilityLabel para que el lector de
              pantalla lo anuncie completo ("Racha: 5 días"), no suelto. */}
          <Link
            href="/progress"
            asChild
            accessibilityLabel={`Racha: ${streak} ${streak === 1 ? 'día' : 'días'}`}
          >
            <Pressable className="flex-1 flex-row items-center gap-3 bg-surface rounded-2xl border-2 border-b-4 border-border px-4 py-3 active:bg-surface-light active:border-b-2">
              <Text className="text-2xl">🔥</Text>
              <View>
                <Text className="text-streak text-xl font-bold leading-6">{streak}</Text>
                <Text className="text-muted text-xs">{streak === 1 ? 'día' : 'días'}</Text>
              </View>
            </Pressable>
          </Link>

          <Link href="/progress" asChild accessibilityLabel={`XP total: ${totalXp}`}>
            <Pressable className="flex-1 flex-row items-center gap-3 bg-surface rounded-2xl border-2 border-b-4 border-border px-4 py-3 active:bg-surface-light active:border-b-2">
              <Text className="text-2xl">⚡</Text>
              <View>
                <Text className="text-gold text-xl font-bold leading-6">{totalXp}</Text>
                <Text className="text-muted text-xs">XP total</Text>
              </View>
            </Pressable>
          </Link>
        </View>

        {/* Barra de nivel */}
        <View className="bg-surface rounded-2xl border-2 border-border px-4 py-3 gap-2">
          <View className="flex-row justify-between items-baseline">
            <Text className="text-text text-sm font-bold">Nivel {level.level}</Text>
            <Text className="text-muted text-xs">
              {pct}% al nivel {level.level + 1}
            </Text>
          </View>
          <View className="h-3.5 rounded-full bg-bg overflow-hidden border border-border">
            {/* En 0% no dibujamos nada: un sliver redondeado se ve como un
                punto suelto, no como el arranque de una barra. */}
            {pct > 0 ? (
              <View
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            ) : null}
          </View>
        </View>

        {/* Acción principal: la lección */}
        {firstLesson.data ? (
          <Link
            href={`/lesson/${firstLesson.data.lessonId}`}
            asChild
            accessibilityLabel={`Empezar lección: ${firstLesson.data.lessonTitle}`}
          >
            <Pressable className="bg-brand rounded-2xl border-b-4 border-brand-dark p-6 gap-1 active:border-b-0 active:translate-y-1">
              <Text className="text-bg/70 text-xs font-bold uppercase tracking-widest">
                {firstLesson.data.unitTitle}
              </Text>
              <Text className="text-bg text-2xl font-bold">{firstLesson.data.lessonTitle}</Text>
              <View className="bg-bg/20 self-start rounded-xl px-4 py-2 mt-2">
                <Text className="text-bg font-bold text-sm">Empezar →</Text>
              </View>
            </Pressable>
          </Link>
        ) : (
          <View className="bg-surface border-2 border-border rounded-2xl p-6 gap-2 items-center">
            <Text className="text-4xl">📚</Text>
            <Text className="text-text text-lg font-bold text-center">
              Todavía no hay lecciones publicadas
            </Text>
            <Text className="text-muted text-sm text-center">
              Meta diaria: {profile?.daily_goal_min ?? 10} min.
            </Text>
          </View>
        )}

        {/* Repaso: acción secundaria, en azul */}
        {dueCards > 0 && (
          <Link href="/review" asChild accessibilityLabel={`Repasar ${dueCards} cards`}>
            <Pressable className="bg-surface rounded-2xl border-2 border-b-4 border-info p-4 flex-row items-center gap-4 active:bg-surface-light active:border-b-2">
              <View className="w-12 h-12 rounded-full bg-info/20 items-center justify-center">
                <Text className="text-2xl">🔁</Text>
              </View>
              <View className="flex-1">
                <Text className="text-text text-base font-bold">
                  Repasar {dueCards} {dueCards === 1 ? 'card' : 'cards'}
                </Text>
                <Text className="text-info text-sm">Mantené lo aprendido →</Text>
              </View>
            </Pressable>
          </Link>
        )}

        {/* Nav */}
        <View className="flex-row gap-3 mt-2">
          <Link href="/progress" asChild accessibilityLabel="Mi progreso">
            <Pressable className="flex-1 bg-surface rounded-2xl border-2 border-b-4 border-border py-4 items-center gap-1 active:bg-surface-light active:border-b-2">
              <Text className="text-xl">📊</Text>
              <Text className="text-text text-sm font-bold">Mi progreso</Text>
            </Pressable>
          </Link>
          <Link href="/settings" asChild accessibilityLabel="Configuración">
            <Pressable className="flex-1 bg-surface rounded-2xl border-2 border-b-4 border-border py-4 items-center gap-1 active:bg-surface-light active:border-b-2">
              <Text className="text-xl">⚙️</Text>
              <Text className="text-muted text-sm font-bold">Configuración</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
