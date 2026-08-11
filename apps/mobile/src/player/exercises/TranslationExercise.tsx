import type { TranslationPayload, UserAnswer } from '@nivelate/shared';
import { Text, TextInput, View } from 'react-native';

type Props = {
  payload: TranslationPayload;
  value: string;
  disabled?: boolean;
  onChange: (answer: UserAnswer) => void;
};

export function TranslationExercise({ payload, value, disabled, onChange }: Props) {
  const label = payload.direction === 'es_to_en' ? 'Traducí al inglés:' : 'Traducí al español:';
  return (
    <View className="gap-3">
      <Text className="text-muted text-sm">{label}</Text>
      <Text className="text-text text-xl font-semibold">{payload.prompt}</Text>
      <TextInput
        value={value}
        editable={!disabled}
        onChangeText={(text) => onChange({ type: 'translation', text })}
        placeholder="Escribí tu traducción"
        placeholderTextColor="#64748b"
        multiline
        accessibilityLabel="Tu traducción"
        className="bg-surface border border-border rounded-lg px-3 py-3 text-text text-base min-h-[80px]"
      />
    </View>
  );
}
