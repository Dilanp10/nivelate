import type { LessonSummary as Summary } from '@nivelate/shared';
import { Text, View } from 'react-native';
import { Button } from '../ui/Button';

type Props = {
  summary: Summary;
  onDone: () => void;
};

export function LessonSummary({ summary, onDone }: Props) {
  const { total, firstTryCorrect, estimatedXp } = summary;
  const pct = total === 0 ? 0 : Math.round((firstTryCorrect / total) * 100);

  return (
    <View className="flex-1 items-center justify-center gap-6 px-6">
      <Text className="text-5xl">🎉</Text>
      <Text className="text-text text-2xl font-bold">¡Lección completa!</Text>

      <View className="w-full max-w-xs gap-3">
        <Row label="Aciertos al primer intento" value={`${firstTryCorrect}/${total} (${pct}%)`} />
        <Row label="XP ganada" value={`+${estimatedXp}`} />
      </View>

      <View className="w-full max-w-xs">
        <Button label="Volver" onPress={onDone} />
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
      <Text className="text-muted text-sm">{label}</Text>
      <Text className="text-text text-base font-semibold">{value}</Text>
    </View>
  );
}
