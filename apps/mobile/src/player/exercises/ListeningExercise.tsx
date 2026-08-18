import type { ListeningPayload, SubAnswer, UserAnswer } from '@nivelate/shared';
import { Pressable, Text, TextInput, View } from 'react-native';
import { isTtsAvailable, speak } from '../../lib/tts';
import { OptionCard } from '../../ui/OptionCard';
import { optionState } from './MultipleChoiceExercise';

type Props = {
  payload: ListeningPayload;
  sub: SubAnswer | null;
  disabled?: boolean;
  revealed?: boolean;
  onChange: (answer: UserAnswer) => void;
};

export function ListeningExercise({ payload, sub, disabled, revealed = false, onChange }: Props) {
  const ttsOk = isTtsAvailable();

  return (
    <View className="gap-6">
      <View className="items-center gap-3">
        <Pressable
          onPress={() => speak(payload.audioText)}
          disabled={!ttsOk}
          accessibilityRole="button"
          accessibilityLabel="Escuchar el audio"
          className={`w-24 h-24 rounded-full items-center justify-center border-b-4 active:border-b-0 active:translate-y-1 ${
            ttsOk ? 'bg-info border-info-dark' : 'bg-surface border-border'
          }`}
        >
          <Text className={`text-4xl ${ttsOk ? 'text-bg' : 'text-muted'}`}>▶</Text>
        </Pressable>
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">
          {ttsOk ? 'Tocá para escuchar' : 'Audio no disponible'}
        </Text>
        {!ttsOk ? (
          <Text className="text-muted text-sm text-center italic">“{payload.audioText}”</Text>
        ) : null}
      </View>

      {payload.sub.kind === 'multiple_choice' ? (
        <View className="gap-4">
          <Text className="text-text text-xl font-bold">{payload.sub.prompt}</Text>
          <View className="gap-3">
            {payload.sub.options.map((option, i) => (
              <OptionCard
                key={option}
                label={option}
                state={optionState(
                  i,
                  sub?.kind === 'multiple_choice' ? sub.selectedIndex : null,
                  payload.sub.kind === 'multiple_choice' ? payload.sub.correctIndex : -1,
                  revealed,
                )}
                disabled={disabled}
                onPress={() =>
                  onChange({
                    type: 'listening',
                    sub: { kind: 'multiple_choice', selectedIndex: i },
                  })
                }
              />
            ))}
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
    <View className="flex-row flex-wrap items-center gap-x-1 gap-y-3 rounded-2xl border-2 border-border bg-surface/40 p-4">
      {payload.sub.segments.map((segment, i) => (
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
  );
}
