import { Pressable, Text, View } from 'react-native';

type Props = {
  done: number;
  total: number;
  onClose: () => void;
  /** Volver a la card de enseñanza anterior. Solo se muestra si está definido. */
  onBack?: () => void;
};

export function LessonProgress({ done, total, onClose, onBack }: Props) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <View className="flex-row items-center gap-3 px-1 py-2">
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Salir de la lección"
        className="w-10 h-10 rounded-full bg-surface items-center justify-center active:bg-surface-light"
      >
        <Text className="text-muted text-lg">✕</Text>
      </Pressable>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Volver al paso anterior"
          className="w-10 h-10 rounded-full bg-surface items-center justify-center active:bg-surface-light"
        >
          <Text className="text-muted text-lg">←</Text>
        </Pressable>
      ) : null}
      <View className="flex-1 h-3 rounded-full bg-surface overflow-hidden">
        <View className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </View>
      <Text className="text-muted text-xs font-semibold w-12 text-right">
        {done}/{total}
      </Text>
    </View>
  );
}
