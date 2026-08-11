import type { FillInBlankPayload, UserAnswer } from '@nivelate/shared';
import { Text, TextInput, View } from 'react-native';

type Props = {
  payload: FillInBlankPayload;
  values: string[];
  disabled?: boolean;
  onChange: (answer: UserAnswer) => void;
};

// Renderiza segmentos y huecos intercalados. N answers ⇒ N+1 segmentos.
export function FillInBlankExercise({ payload, values, disabled, onChange }: Props) {
  const blanks = payload.answers.length;

  function setBlank(i: number, text: string) {
    const next = [...values];
    while (next.length < blanks) next.push('');
    next[i] = text;
    onChange({ type: 'fill_in_blank', values: next });
  }

  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap items-center gap-1">
        {payload.segments.map((segment, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: los segmentos son estáticos y nunca se reordenan
          <View key={`seg-${i}`} className="flex-row items-center gap-1">
            {segment ? <Text className="text-text text-lg">{segment}</Text> : null}
            {i < blanks ? (
              <TextInput
                value={values[i] ?? ''}
                editable={!disabled}
                onChangeText={(text) => setBlank(i, text)}
                placeholder="…"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                accessibilityLabel={`Hueco ${i + 1}`}
                className="bg-surface border border-border rounded-md px-2 py-1 text-text text-lg min-w-[90px]"
              />
            ) : null}
          </View>
        ))}
      </View>

      {payload.bank ? (
        <View className="gap-1">
          <Text className="text-muted text-xs">Opciones: {payload.bank.join(' · ')}</Text>
        </View>
      ) : null}
    </View>
  );
}
