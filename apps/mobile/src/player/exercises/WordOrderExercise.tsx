import type { UserAnswer, WordOrderPayload } from '@nivelate/shared';
import { Pressable, Text, View } from 'react-native';

type Props = {
  payload: WordOrderPayload;
  order: number[]; // índices ya elegidos, en orden
  disabled?: boolean;
  onChange: (answer: UserAnswer) => void;
};

// Tap para agregar un token a la oración; tap en la oración para sacarlo.
export function WordOrderExercise({ payload, order, disabled, onChange }: Props) {
  const used = new Set(order);

  function add(i: number) {
    if (used.has(i)) return;
    onChange({ type: 'word_order', order: [...order, i] });
  }
  function removeAt(pos: number) {
    onChange({ type: 'word_order', order: order.filter((_, k) => k !== pos) });
  }

  return (
    <View className="gap-5">
      <Text className="text-muted text-sm">Ordená las palabras para armar la oración:</Text>

      {/* Oración en construcción */}
      <View className="min-h-[52px] flex-row flex-wrap items-center gap-2 border-b border-border pb-2">
        {order.length === 0 ? (
          <Text className="text-muted text-base">Tocá las palabras de abajo…</Text>
        ) : (
          order.map((tokenIdx, pos) => (
            <Pressable
              key={`chosen-${pos}-${tokenIdx}`}
              disabled={disabled}
              onPress={() => removeAt(pos)}
              accessibilityRole="button"
              accessibilityLabel={`Quitar ${payload.tokens[tokenIdx]}`}
              className="rounded-lg bg-brand/15 border border-brand px-3 py-2"
            >
              <Text className="text-text text-base">{payload.tokens[tokenIdx]}</Text>
            </Pressable>
          ))
        )}
      </View>

      {/* Banco de tokens */}
      <View className="flex-row flex-wrap gap-2">
        {payload.tokens.map((token, i) => {
          const isUsed = used.has(i);
          return (
            <Pressable
              key={`token-${i}-${token}`}
              disabled={disabled || isUsed}
              onPress={() => add(i)}
              accessibilityRole="button"
              accessibilityLabel={`Agregar ${token}`}
              className={`rounded-lg border px-3 py-2 ${
                isUsed ? 'border-border bg-bg opacity-40' : 'border-border bg-surface'
              }`}
            >
              <Text className="text-text text-base">{token}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
