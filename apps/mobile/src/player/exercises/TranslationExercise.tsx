import type { TranslationPayload, UserAnswer } from '@nivelate/shared';
import { TextInput, View } from 'react-native';
import { ExercisePrompt } from '../../ui/OptionCard';

type Props = {
  payload: TranslationPayload;
  value: string;
  disabled?: boolean;
  onChange: (answer: UserAnswer) => void;
};

export function TranslationExercise({ payload, value, disabled, onChange }: Props) {
  const hint = payload.direction === 'es_to_en' ? 'Traducí al inglés' : 'Traducí al español';
  return (
    <View className="gap-6">
      <ExercisePrompt hint={hint}>{payload.prompt}</ExercisePrompt>
      <TextInput
        value={value}
        editable={!disabled}
        onChangeText={(text) => onChange({ type: 'translation', text })}
        placeholder="Escribí tu traducción"
        placeholderTextColor="#8fa3ad"
        multiline
        textAlignVertical="top"
        accessibilityLabel="Tu traducción"
        className="bg-surface border-2 border-b-4 border-border rounded-2xl px-4 py-4 text-text text-lg min-h-[112px]"
      />
    </View>
  );
}
