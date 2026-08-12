import { CEFR_LABELS, levelForXp } from '@nivelate/shared';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { AchievementsGrid } from '../../src/components/AchievementsGrid';
import { useAchievements } from '../../src/hooks/useAchievements';
import { useProgress } from '../../src/hooks/useProgress';
import { useAuthStore } from '../../src/stores/auth';
import { Button } from '../../src/ui/Button';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

export default function ProgressScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) =>
    s.state.status === 'authenticated' ? s.state.profile : null,
  );
  const progress = useProgress();
  const achievements = useAchievements();

  const totalXp = profile?.total_xp ?? 0;
  const level = levelForXp(totalXp);
  const currentStreak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;

  const hasProgress = totalXp > 0 || (progress.data?.globalCompleted ?? 0) > 0;

  return (
    <ScreenLayout title="Mi progreso" subtitle={`De ${CEFR_LABELS.A2} a ${CEFR_LABELS.B1}`}>
      {!hasProgress ? (
        <View className="bg-surface border border-border rounded-xl p-5 gap-2">
          <Text className="text-text text-base font-semibold">Todavía no arrancaste</Text>
          <Text className="text-muted text-sm">
            Completá tu primera lección y acá vas a ver tu nivel, tu racha y cuánto te falta para
            B1.
          </Text>
        </View>
      ) : (
        <>
          {/* Nivel + XP */}
          <View className="bg-surface border border-border rounded-xl p-5 gap-3">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-text text-lg font-bold">Nivel {level.level}</Text>
              <Text className="text-muted text-sm">{totalXp} XP</Text>
            </View>
            <View className="h-2 rounded-full bg-bg overflow-hidden">
              <View
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.round(level.progress * 100)}%` }}
              />
            </View>
            <Text className="text-muted text-xs">
              {level.xpIntoLevel}/{level.xpForNextLevel} XP para el nivel {level.level + 1}
            </Text>
          </View>

          {/* Racha */}
          <View className="flex-row gap-3">
            <Stat
              emoji="🔥"
              value={`${currentStreak}`}
              label={currentStreak === 1 ? 'día' : 'días'}
            />
            <Stat emoji="🏆" value={`${longestStreak}`} label="mejor racha" />
          </View>

          {/* Avance por unidad */}
          <View className="gap-2">
            <Text className="text-text text-sm font-semibold">Avance por unidad</Text>
            {progress.data?.perUnit.map((u) => {
              const pct =
                u.totalLessons === 0 ? 0 : Math.round((u.completedLessons / u.totalLessons) * 100);
              return (
                <View
                  key={u.unitId}
                  className="bg-surface border border-border rounded-lg p-3 gap-1.5"
                >
                  <View className="flex-row justify-between">
                    <Text className="text-text text-sm">{u.unitTitle}</Text>
                    <Text className="text-muted text-xs">
                      {u.completedLessons}/{u.totalLessons}
                    </Text>
                  </View>
                  <View className="h-1.5 rounded-full bg-bg overflow-hidden">
                    <View className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Global */}
          {progress.data && progress.data.globalTotal > 0 ? (
            <View className="bg-brand/10 border border-brand rounded-xl p-4 gap-1">
              <Text className="text-text text-sm font-semibold">Camino A2 → B1</Text>
              <Text className="text-brand text-2xl font-bold">
                {Math.round((progress.data.globalCompleted / progress.data.globalTotal) * 100)}%
              </Text>
              <Text className="text-muted text-xs">
                {progress.data.globalCompleted} de {progress.data.globalTotal} lecciones
              </Text>
            </View>
          ) : null}
        </>
      )}

      {achievements.data ? <AchievementsGrid achievements={achievements.data} /> : null}

      <Button label="Volver" variant="ghost" onPress={() => router.back()} />
    </ScreenLayout>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <View className="flex-1 bg-surface border border-border rounded-xl p-4 items-center gap-0.5">
      <Text className="text-2xl">{emoji}</Text>
      <Text className="text-text text-xl font-bold">{value}</Text>
      <Text className="text-muted text-xs">{label}</Text>
    </View>
  );
}
