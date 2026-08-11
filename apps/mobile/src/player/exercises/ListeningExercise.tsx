import type { ListeningPayload, SubAnswer, UserAnswer } from '@nivelate/shared';
import { Pressable, Text, TextInput, View } from 'react-native';
import { isTtsAvailable, speak } from '../../lib/tts';

type Props = {
  payload: ListeningPayload;
  sub: SubAnswer | null;
  disabled?: boolean;
  onChange: (answer: UserAnswer) => void;
};

export function ListeningExercise({ payload, sub, disabled, onChange }: Props) {
  const ttsOk = isTtsAvailable();

  return (
    <View className="gap-4">
      <View className="items-center gap-2">
        <Pressable
          onPress={() => speak(payload.audioText)}
          disabled={!ttsOk}
          accessibilityRole="button"
          accessibilityLabel="Escuchar el audio"
          className={`rounded-full px-6 py-4 ${ttsOk ? 'bg-brand' : 'bg-surface border border-border'}`}
        >
          <Text className={`text-lg font-semibold ${ttsOk ? 'text-bg' : 'text-muted'}`}>
            ▶ Escuchar
          </Text>
        </Pressable>
        {!ttsOk ? (
          <Text className="text-muted text-xs text-center">
            Tu navegador no reproduce audio. Texto: “{payload.audioText}”
          </Text>
        ) : null}
      </View>

      {payload.sub.kind === 'multiple_choice' ? (
        <View className="gap-3">
          <Text className="text-text text-lg font-semibold">{payload.sub.prompt}</Text>
          <View className="gap-2">
            {payload.sub.options.map((option, i) => {
              const selected = sub?.kind === 'multiple_choice' && sub.selectedIndex === i;
              return (
                <Pressable
                  key={option}
                  disabled={disabled}
                  onPress={() =>
                    onChange({
                      type: 'listening',
                      sub: { kind: 'multiple_choice', selectedIndex: i },
                    })
                  }
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled }}
                  className={`rounded-lg border px-4 py-3 ${
                    selected ? 'border-brand bg-brand/10' : 'border-border bg-surface'
                  }`}
                >
                  <Text className="text-text text-base">{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <ListeningFill payload={payload} sub={sub} disabled={disabled} onChange={onChange} />
      )}
    </View>
  );
}

function ListeningFill({ payload, sub, disabled, onChange }: Props) {
  if (payload.sub.kind !== 'fill_in_blank') return null;
  const blanks = payload.sub.answers.length;
  const values = sub?.kind === 'fill_in_blank' ? sub.values : [];

  function setBlank(i: number, text: string) {
    const next = [...values];
    while (next.length < blanks) next.push('');
    next[i] = text;
    onChange({ type: 'listening', sub: { kind: 'fill_in_blank', values: next } });
  }

  return (
    <View className="flex-row flex-wrap items-center gap-1">
      {payload.sub.segments.map((segment, i) => (
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
  );
}
