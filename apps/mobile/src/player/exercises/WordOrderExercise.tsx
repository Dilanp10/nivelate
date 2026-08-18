import { type UserAnswer, type WordOrderPayload, shuffleTokenIndices } from '@nivelate/shared';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { TokenChip } from '../../ui/OptionCard';

type Props = {
  payload: WordOrderPayload;
  order: number[]; // índices ya elegidos, en orden
  disabled?: boolean;
  onChange: (answer: UserAnswer) => void;
};

// Tap para agregar un token a la oración; tap en la oración para sacarlo.
export function WordOrderExercise({ payload, order, disabled, onChange }: Props) {
  const used = new Set(order);
  // Los tokens del payload suelen venir en el orden correcto (así el content es
  // legible al autorearlo). Los presentamos siempre barajados con permutación
  // determinística por ejercicio, así el UI no depende de que el/la autor/a se
  // acuerde de desordenarlos y el orden es estable entre renders y tests.
  const displayOrder = useMemo(() => shuffleTokenIndices(payload.tokens), [payload.tokens]);

  function add(i: number) {
    if (used.has(i)) return;
    onChange({ type: 'word_order', order: [...order, i] });
  }
  function removeAt(pos: number) {
    onChange({ type: 'word_order', order: order.filter((_, k) => k !== pos) });
  }

  return (
    <View className="gap-6">
      <Text className="text-muted text-xs font-bold uppercase tracking-widest">
        Ordená las palabras
      </Text>

      {/* Renglones guía: dan la sensación de "escribir sobre la línea". */}
      <View className="min-h-[104px] gap-2 rounded-2xl border-2 border-border bg-surface/40 p-4">
        {order.length === 0 ? (
          <Text className="text-muted text-base italic">Tocá las palabras de abajo…</Text>
        ) : (
          <View className="flex-row flex-wrap items-center gap-2">
            {order.map((tokenIdx, pos) => (
              <TokenChip
                key={`chosen-${pos}-${tokenIdx}`}
                label={payload.tokens[tokenIdx] ?? ''}
                accessibilityLabel={`Quitar ${payload.tokens[tokenIdx]}`}
                tone="chosen"
                disabled={disabled}
                onPress={() => removeAt(pos)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Banco de tokens — barajados con permutación estable por ejercicio.
          Los índices sobre los que trabaja la lógica (used/add/order) siguen
          siendo los del payload original; sólo el orden visual cambia. */}
      <View className="flex-row flex-wrap gap-2">
        {displayOrder.map((i) => (
          <TokenChip
            key={`token-${i}-${payload.tokens[i]}`}
            label={payload.tokens[i] ?? ''}
            accessibilityLabel={`Agregar ${payload.tokens[i]}`}
            used={used.has(i)}
            disabled={disabled}
            onPress={() => add(i)}
          />
        ))}
      </View>
    </View>
  );
}
