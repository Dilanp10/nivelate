import type { DialoguePayload, UserAnswer } from '@nivelate/shared';
import { Text, View } from 'react-native';
import { OptionCard } from '../../ui/OptionCard';
import { optionState } from './MultipleChoiceExercise';

type Props = {
  payload: DialoguePayload;
  selectedIndex: number | null;
  disabled?: boolean;
  revealed?: boolean;
  onSelect: (answer: UserAnswer) => void;
};

export function DialogueExercise({
  payload,
  selectedIndex,
  disabled,
  revealed = false,
  onSelect,
}: Props) {
  return (
    <View className="gap-6">
      {/* Burbujas de conversación: alternadas para que se lea como un chat. */}
      <View className="gap-3">
        {payload.turns.map((turn, i) => {
          const isBlank = i === payload.blankTurnIndex;
          const isEven = i % 2 === 0;
          return (
            <View
              key={`${turn.speaker}-${i}`}
              className={`max-w-[85%] ${isEven ? 'self-start' : 'self-end'}`}
            >
              <Text className="text-muted text-xs font-bold mb-1 px-1">{turn.speaker}</Text>
              <View
                className={`rounded-2xl px-4 py-3 border-2 ${
                  isBlank
                    ? 'border-info border-dashed bg-info/10'
                    : isEven
                      ? 'border-border bg-surface'
                      : 'border-border bg-surface-light'
                }`}
              >
                <Text className={`text-base ${isBlank ? 'text-info' : 'text-text'}`}>
                  {isBlank ? '. . .' : turn.text}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text className="text-muted text-xs font-bold uppercase tracking-widest">
        Elegí la respuesta que falta
      </Text>
      <View className="gap-3">
        {payload.options.map((option, i) => (
          <OptionCard
            key={option}
            label={option}
            state={optionState(i, selectedIndex, payload.correctIndex, revealed)}
            disabled={disabled}
            onPress={() => onSelect({ type: 'dialogue', selectedIndex: i })}
          />
        ))}
      </View>
    </View>
  );
}
