import { Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

type Props = {
  total: number;
  correct: number;
  onDone: () => void;
};

export function ReviewSummary({ total, correct, onDone }: Props) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <View className="flex-1 items-center justify-center gap-7 px-6">
      <View className="items-center gap-3">
        <Icon name="repeat" size={64} color="#4F6D7A" strokeWidth={1.4} />
        <Text className="text-info text-3xl font-bold">¡Repaso listo!</Text>
      </View>

      <View className="w-full max-w-xs flex-row gap-3">
        <Box label="Revisados" value={`${total}`} tone="text-text" />
        <Box label="Aciertos" value={`${pct}%`} tone="text-brand" />
      </View>

      <Text className="text-muted text-sm">
        {correct} de {total} correctos
      </Text>

      <View className="w-full max-w-xs">
        <Button label="Volver" onPress={onDone} />
      </View>
    </View>
  );
}

function Box({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <View className="flex-1 items-center gap-1 bg-surface border-2 border-border rounded-2xl py-3">
      <Text className={`text-xl font-bold ${tone}`}>{value}</Text>
      <Text className="text-muted text-xs">{label}</Text>
    </View>
  );
}
