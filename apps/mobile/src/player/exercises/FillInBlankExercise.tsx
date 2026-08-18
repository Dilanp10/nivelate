import type { FillInBlankPayload, UserAnswer } from '@nivelate/shared';
import { Text, TextInput, View } from 'react-native';
import { ExercisePrompt } from '../../ui/OptionCard';

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
    <View className="gap-6">
      <ExercisePrompt hint="Completá la frase">{'Escribí lo que falta'}</ExercisePrompt>

      <View className="flex-row flex-wrap items-center gap-x-1 gap-y-3 rounded-2xl border-2 border-border bg-surface/40 p-4">
        {payload.segments.map((segment, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: los segmentos son estáticos y nunca se reordenan
          <View key={`seg-${i}`} className="flex-row items-center gap-1">
            {segment ? <Text className="text-text text-lg leading-7">{segment}</Text> : null}
            {i < blanks ? (
              <TextInput
                value={values[i] ?? ''}
                editable={!disabled}
                onChangeText={(text) => setBlank(i, text)}
                placeholder="…"
                placeholderTextColor="#8fa3ad"
                autoCapitalize="none"
                accessibilityLabel={`Hueco ${i + 1}`}
                className="bg-surface border-2 border-b-4 border-info/60 rounded-xl px-3 py-1.5 text-info text-lg font-semibold min-w-[110px] text-center"
              />
            ) : null}
          </View>
        ))}
      </View>

      {payload.bank ? (
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className="text-muted text-xs font-bold uppercase tracking-widest w-full">
            Opciones
          </Text>
          {payload.bank.map((word) => (
            <View key={word} className="rounded-lg border border-border bg-surface px-3 py-1.5">
              <Text className="text-muted text-sm font-semibold">{word}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
