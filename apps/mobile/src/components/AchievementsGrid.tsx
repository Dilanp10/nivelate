import type { AchievementWithStatus } from '@nivelate/shared';
import { Text, View } from 'react-native';

type Props = {
  achievements: AchievementWithStatus[];
};

export function AchievementsGrid({ achievements }: Props) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <View className="gap-3">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-text text-base font-bold">Logros</Text>
        <Text className="text-muted text-xs font-semibold">
          {unlockedCount}/{achievements.length}
        </Text>
      </View>

      {unlockedCount === 0 ? (
        <Text className="text-muted text-sm">
          Empezá a completar lecciones y aparecerán logros acá.
        </Text>
      ) : null}

      <View className="flex-row flex-wrap gap-3">
        {achievements.map((a) => (
          <AchievementCard key={a.id} a={a} />
        ))}
      </View>
    </View>
  );
}

function AchievementCard({ a }: { a: AchievementWithStatus }) {
  return (
    <View
      className={`w-[47%] rounded-2xl border-2 border-b-4 p-4 gap-1 ${
        a.unlocked ? 'border-gold bg-gold/10' : 'border-border bg-surface opacity-40'
      }`}
      accessibilityLabel={
        a.unlocked ? `Logro desbloqueado: ${a.title}` : `Logro bloqueado: ${a.title}`
      }
    >
      <Text className="text-3xl">{a.unlocked ? a.emoji : '🔒'}</Text>
      <Text className={`text-sm font-bold ${a.unlocked ? 'text-gold' : 'text-text'}`}>
        {a.unlocked ? a.title : '???'}
      </Text>
      <Text className="text-muted text-xs leading-4">
        {a.unlocked ? a.description : 'Aún por descubrir'}
      </Text>
    </View>
  );
}
