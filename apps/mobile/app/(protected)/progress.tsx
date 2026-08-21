import { CEFR_LABELS, levelForXp } from '@nivelate/shared';
import { Link, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { AchievementsGrid } from '../../src/components/AchievementsGrid';
import { useAchievements } from '../../src/hooks/useAchievements';
import { useFirstUnitEntry } from '../../src/hooks/useFirstUnitEntry';
import { useProgress } from '../../src/hooks/useProgress';
import { useStartingUnit } from '../../src/hooks/useStartingUnit';
import { useAuthStore } from '../../src/stores/auth';
import { Button } from '../../src/ui/Button';
import { Icon, type IconName } from '../../src/ui/Icon';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

export default function ProgressScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) =>
    s.state.status === 'authenticated' ? s.state.profile : null,
  );
  const progress = useProgress();
  const achievements = useAchievements();
  const { startingUnit, units } = useStartingUnit();
  const firstUnitEntry = useFirstUnitEntry();
  // No basta con mirar la intención del self_level: si el catálogo publicado
  // no llega a la unidad objetivo (ej. self_level='intermediate' pero solo
  // hay U1), no hubo salto real y el enlace "empezá desde el principio" no
  // tiene sentido (ya está ahí).
  const firstPublishedUnit = units[0];
  const showBackToBasics =
    startingUnit != null &&
    firstPublishedUnit != null &&
    startingUnit.sortOrder > firstPublishedUnit.sortOrder;

  const totalXp = profile?.total_xp ?? 0;
  const level = levelForXp(totalXp);
  const currentStreak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;

  const hasProgress = totalXp > 0 || (progress.data?.globalCompleted ?? 0) > 0;

  return (
    <ScreenLayout title="Mi progreso" subtitle={`De ${CEFR_LABELS.A2} a ${CEFR_LABELS.B1}`}>
      {!hasProgress ? (
        <View className="bg-surface border-2 border-border rounded-2xl p-6 gap-3 items-center">
          <Icon name="sprout" size={40} color="#0E7C7B" />
          <Text className="text-text text-base font-bold text-center">Todavía no arrancaste</Text>
          <Text className="text-muted text-sm text-center">
            Completá tu primera lección y acá vas a ver tu nivel, tu racha y cuánto te falta para
            B1.
          </Text>
        </View>
      ) : (
        <>
          {/* Camino global: lo primero, es la respuesta a "¿cuánto me falta?" */}
          {progress.data && progress.data.globalTotal > 0 ? (
            <View className="bg-brand/10 border-2 border-brand rounded-2xl p-5 gap-1 items-center">
              <Text className="text-muted text-xs font-bold uppercase tracking-widest">
                Camino A2 → B1
              </Text>
              <Text className="text-brand text-5xl font-bold">
                {Math.round((progress.data.globalCompleted / progress.data.globalTotal) * 100)}%
              </Text>
              <Text className="text-muted text-sm">
                {progress.data.globalCompleted} de {progress.data.globalTotal} lecciones
              </Text>
            </View>
          ) : null}

          {/* Nivel + XP */}
          <View className="bg-surface border-2 border-border rounded-2xl p-5 gap-3">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-text text-lg font-bold">Nivel {level.level}</Text>
              <Text className="text-gold text-sm font-bold">{totalXp} XP</Text>
            </View>
            <View className="h-3 rounded-full bg-bg overflow-hidden border border-border">
              {level.progress > 0 ? (
                <View
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.max(Math.round(level.progress * 100), 4)}%` }}
                />
              ) : null}
            </View>
            <Text className="text-muted text-xs">
              {level.xpIntoLevel}/{level.xpForNextLevel} XP para el nivel {level.level + 1}
            </Text>
          </View>

          {/* Racha */}
          <View className="flex-row gap-3">
            <Stat
              icon="flame"
              iconColor="#C55A2A"
              value={`${currentStreak}`}
              label={currentStreak === 1 ? 'día' : 'días'}
              tone="text-streak"
            />
            <Stat
              icon="trophy"
              iconColor="#B88A2E"
              value={`${longestStreak}`}
              label="mejor racha"
              tone="text-gold"
            />
          </View>

          {/* Avance por unidad */}
          <View className="gap-3">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-text text-base font-bold">Avance por unidad</Text>
              {showBackToBasics && firstUnitEntry.data ? (
                <Link
                  href={`/lesson/${firstUnitEntry.data.lessonId}`}
                  className="text-info text-xs font-semibold"
                >
                  ¿Muy difícil? Empezá desde el principio →
                </Link>
              ) : null}
            </View>
            {progress.data?.perUnit.map((u) => {
              const pct =
                u.totalLessons === 0 ? 0 : Math.round((u.completedLessons / u.totalLessons) * 100);
              const done = pct === 100;
              const isOptionalReview =
                startingUnit != null && u.unitSortOrder < startingUnit.sortOrder;
              return (
                <View
                  key={u.unitId}
                  className={`rounded-2xl border-2 p-4 gap-2 ${
                    done ? 'border-brand/50 bg-brand/5' : 'border-border bg-surface'
                  }`}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-text text-sm font-bold" numberOfLines={1}>
                        {done ? '✓' : ''}
                        {u.unitTitle}
                      </Text>
                      {isOptionalReview ? (
                        <View className="bg-info/15 rounded-full px-2 py-0.5">
                          <Text className="text-info text-[10px] font-bold uppercase tracking-wide">
                            Opcional — repaso
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="text-muted text-xs font-semibold">
                      {u.completedLessons}/{u.totalLessons}
                    </Text>
                  </View>
                  <View className="h-2 rounded-full bg-bg overflow-hidden">
                    <View className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {achievements.data ? <AchievementsGrid achievements={achievements.data} /> : null}

      <Button label="Volver" variant="ghost" onPress={() => router.back()} />
    </ScreenLayout>
  );
}

function Stat({
  icon,
  iconColor,
  value,
  label,
  tone,
}: {
  icon: IconName;
  iconColor: string;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <View className="flex-1 bg-surface border-2 border-border rounded-2xl p-4 items-center gap-1">
      <Icon name={icon} size={30} color={iconColor} />
      <Text className={`text-2xl font-bold ${tone}`}>{value}</Text>
      <Text className="text-muted text-xs">{label}</Text>
    </View>
  );
}
