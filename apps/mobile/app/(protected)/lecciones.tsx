import { CEFR_LABELS } from '@nivelate/shared';
import { Link, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useProgress } from '../../src/hooks/useProgress';
import { Button } from '../../src/ui/Button';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

/**
 * Mapa del curso: todas las unidades publicadas con todas sus lecciones.
 * Cada lección lleva un ícono según su estado (completada, próxima, o
 * "adelante" con candado). El candado es visual — la lección igual se puede
 * abrir si el usuario quiere saltar (adultos, respetamos autonomía).
 */
export default function LessonsMapScreen() {
  const router = useRouter();
  const progress = useProgress();

  // La primera lección incompleta global es la "siguiente" oficial. A partir
  // de ahí, todo lo que venga después se marca con candado.
  const nextLessonId = (() => {
    if (!progress.data) return null;
    for (const u of progress.data.perUnit) {
      for (const l of u.lessons) {
        if (!l.completed) return l.lessonId;
      }
    }
    return null;
  })();

  return (
    <ScreenLayout title="Todas las lecciones" subtitle={`De ${CEFR_LABELS.A2} a ${CEFR_LABELS.B1}`}>
      {progress.isLoading ? (
        <Text className="text-muted text-sm">Cargando…</Text>
      ) : progress.isError ? (
        <Text className="text-danger text-sm">No se pudieron cargar las lecciones.</Text>
      ) : (progress.data?.perUnit.length ?? 0) === 0 ? (
        <View className="bg-surface border-2 border-border rounded-2xl p-6 gap-2 items-center">
          <Text className="text-4xl">📚</Text>
          <Text className="text-text text-base font-bold text-center">
            Todavía no hay unidades publicadas
          </Text>
        </View>
      ) : (
        <View className="gap-6">
          {progress.data?.perUnit.map((u) => {
            const pct =
              u.totalLessons === 0 ? 0 : Math.round((u.completedLessons / u.totalLessons) * 100);
            const unitDone = pct === 100;
            return (
              <View key={u.unitId} className="gap-2">
                <View className="flex-row items-baseline justify-between px-1">
                  <View className="flex-row items-center gap-2 flex-1">
                    {unitDone ? <Text className="text-brand text-sm">✓</Text> : null}
                    <Text className="text-text text-base font-bold" numberOfLines={1}>
                      {u.unitTitle}
                    </Text>
                  </View>
                  <Text className="text-muted text-xs font-semibold">
                    {u.completedLessons}/{u.totalLessons}
                  </Text>
                </View>

                <View className="gap-2">
                  {u.lessons.map((l) => {
                    const isNext = l.lessonId === nextLessonId;
                    const isAhead = !l.completed && !isNext;
                    return (
                      <Link key={l.lessonId} href={`/lesson/${l.lessonId}`} asChild>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            l.completed
                              ? `Repasar ${l.lessonTitle}`
                              : isNext
                                ? `Continuar con ${l.lessonTitle}`
                                : `Empezar ${l.lessonTitle} (adelantándote)`
                          }
                          className={`flex-row items-center gap-3 rounded-xl px-4 py-3 border-2 active:opacity-80 ${
                            isNext
                              ? 'bg-brand border-brand'
                              : l.completed
                                ? 'bg-brand/5 border-brand/30'
                                : 'bg-surface border-border'
                          }`}
                        >
                          <View
                            className={`w-8 h-8 rounded-full items-center justify-center ${
                              isNext
                                ? 'bg-bg/20'
                                : l.completed
                                  ? 'bg-brand/15'
                                  : 'bg-surface-light'
                            }`}
                          >
                            <Text
                              className={`text-sm ${
                                isNext
                                  ? 'text-bg font-bold'
                                  : l.completed
                                    ? 'text-brand'
                                    : 'text-muted'
                              }`}
                            >
                              {l.completed ? '✓' : isNext ? '▶' : '🔒'}
                            </Text>
                          </View>

                          <Text
                            className={`flex-1 text-base font-semibold ${
                              isNext ? 'text-bg' : isAhead ? 'text-muted' : 'text-text'
                            }`}
                            numberOfLines={1}
                          >
                            {l.lessonTitle}
                          </Text>

                          {l.completed ? (
                            <Text className="text-muted text-xs">Repasar</Text>
                          ) : isNext ? (
                            <Text className="text-bg text-xs font-bold uppercase tracking-widest">
                              Siguiente
                            </Text>
                          ) : null}
                        </Pressable>
                      </Link>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Button label="Volver" variant="ghost" onPress={() => router.back()} />
    </ScreenLayout>
  );
}
