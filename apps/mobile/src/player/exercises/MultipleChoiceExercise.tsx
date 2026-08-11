import type { MultipleChoicePayload, UserAnswer } from '@nivelate/shared';
import { Pressable, Text, View } from 'react-native';

type Props = {
  payload: MultipleChoicePayload;
  selectedIndex: number | null;
  disabled?: boolean;
  onSelect: (answer: UserAnswer) => void;
};

export function MultipleChoiceExercise({ payload, selectedIndex, disabled, onSelect }: Props) {
  return (
    <View className="gap-4">
      <Text className="text-text text-xl font-semibold">{payload.prompt}</Text>
      <View className="gap-2">
        {payload.options.map((option, i) => {
          const selected = selectedIndex === i;
          return (
            <Pressable
              key={option}
              disabled={disabled}
              onPress={() => onSelect({ type: 'multiple_choice', selectedIndex: i })}
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
