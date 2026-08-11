import type { DialoguePayload, UserAnswer } from '@nivelate/shared';
import { Pressable, Text, View } from 'react-native';

type Props = {
  payload: DialoguePayload;
  selectedIndex: number | null;
  disabled?: boolean;
  onSelect: (answer: UserAnswer) => void;
};

export function DialogueExercise({ payload, selectedIndex, disabled, onSelect }: Props) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        {payload.turns.map((turn, i) => {
          const isBlank = i === payload.blankTurnIndex;
          return (
            <View
              key={`${turn.speaker}-${i}`}
              className={`rounded-lg px-3 py-2 ${isBlank ? 'bg-brand/10 border border-brand' : 'bg-surface'}`}
            >
              <Text className="text-muted text-xs mb-0.5">{turn.speaker}</Text>
              <Text className="text-text text-base">{isBlank ? '…' : turn.text}</Text>
            </View>
          );
        })}
      </View>

      <Text className="text-muted text-sm">Elegí la respuesta que falta:</Text>
      <View className="gap-2">
        {payload.options.map((option, i) => {
          const selected = selectedIndex === i;
          return (
            <Pressable
              key={option}
              disabled={disabled}
              onPress={() => onSelect({ type: 'dialogue', selectedIndex: i })}
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
  );
}
