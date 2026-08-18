import type { MultipleChoicePayload, UserAnswer } from '@nivelate/shared';
import { View } from 'react-native';
import { ExercisePrompt, OptionCard, type OptionState } from '../../ui/OptionCard';

type Props = {
  payload: MultipleChoicePayload;
  selectedIndex: number | null;
  disabled?: boolean;
  /** Tras verificar: pinta la correcta en verde y la elegida-errónea en rojo. */
  revealed?: boolean;
  onSelect: (answer: UserAnswer) => void;
};

export function optionState(
  index: number,
  selectedIndex: number | null,
  correctIndex: number,
  revealed: boolean,
): OptionState {
  if (!revealed) return selectedIndex === index ? 'selected' : 'idle';
  if (index === correctIndex) return 'correct';
  if (index === selectedIndex) return 'wrong';
  return 'idle';
}

export function MultipleChoiceExercise({
  payload,
  selectedIndex,
  disabled,
  revealed = false,
  onSelect,
}: Props) {
  return (
    <View className="gap-6">
      <ExercisePrompt hint="Elegí la opción correcta">{payload.prompt}</ExercisePrompt>
      <View className="gap-3">
        {payload.options.map((option, i) => (
          <OptionCard
            key={option}
            label={option}
            state={optionState(i, selectedIndex, payload.correctIndex, revealed)}
            disabled={disabled}
            onPress={() => onSelect({ type: 'multiple_choice', selectedIndex: i })}
          />
        ))}
      </View>
    </View>
  );
}
