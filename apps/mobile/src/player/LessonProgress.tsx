import { Pressable, Text, View } from 'react-native';

type Props = {
  done: number;
  total: number;
  onClose: () => void;
};

export function LessonProgress({ done, total, onClose }: Props) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <View className="flex-row items-center gap-3 px-1 py-2">
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Salir de la lección"
        className="px-2 py-1"
      >
        <Text className="text-muted text-xl">✕</Text>
      </Pressable>
      <View className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
        <View className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </View>
      <Text className="text-muted text-xs w-12 text-right">
        {done}/{total}
      </Text>
    </View>
  );
}
