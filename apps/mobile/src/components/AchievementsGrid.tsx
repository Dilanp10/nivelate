import type { AchievementWithStatus } from '@nivelate/shared';
import { Text, View } from 'react-native';

type Props = {
  achievements: AchievementWithStatus[];
};

export function AchievementsGrid({ achievements }: Props) {
  const anyUnlocked = achievements.some((a) => a.unlocked);
  return (
    <View className="gap-2">
      <Text className="text-text text-sm font-semibold">Logros</Text>

      {!anyUnlocked ? (
        <Text className="text-muted text-xs">
          Empezá a completar lecciones y aparecerán logros acá.
        </Text>
      ) : null}

      <View className="flex-row flex-wrap gap-2">
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
      className={`w-[48%] rounded-lg border p-3 gap-1 ${
        a.unlocked ? 'border-brand bg-brand/10' : 'border-border bg-surface opacity-50'
      }`}
      accessibilityLabel={
        a.unlocked ? `Logro desbloqueado: ${a.title}` : `Logro bloqueado: ${a.title}`
      }
    >
      <Text className="text-2xl">{a.unlocked ? a.emoji : '❔'}</Text>
      <Text className="text-text text-sm font-semibold">{a.unlocked ? a.title : '???'}</Text>
      <Text className="text-muted text-xs">{a.unlocked ? a.description : 'Aún por descubrir'}</Text>
    </View>
  );
}
