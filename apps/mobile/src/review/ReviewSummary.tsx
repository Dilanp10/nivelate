import { Text, View } from 'react-native';
import { Button } from '../ui/Button';

type Props = {
  total: number;
  correct: number;
  onDone: () => void;
};

export function ReviewSummary({ total, correct, onDone }: Props) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return (
    <View className="flex-1 items-center justify-center gap-6 px-6">
      <Text className="text-5xl">🔁</Text>
      <Text className="text-text text-2xl font-bold">¡Repaso listo!</Text>
      <View className="w-full max-w-xs gap-3">
        <Row label="Cards revisados" value={`${total}`} />
        <Row label="Aciertos" value={`${correct}/${total} (${pct}%)`} />
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
