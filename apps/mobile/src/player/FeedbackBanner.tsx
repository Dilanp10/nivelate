import { Text, View } from 'react-native';

type Props = {
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
};

export function FeedbackBanner({ correct, correctAnswer, explanation }: Props) {
  return (
    <View
      accessibilityRole="alert"
      className={`rounded-xl px-4 py-3 gap-1 border ${
        correct ? 'bg-brand/10 border-brand' : 'bg-danger/10 border-danger'
      }`}
    >
      <Text className={`text-base font-semibold ${correct ? 'text-brand' : 'text-danger'}`}>
        {correct ? '¡Correcto!' : 'No exactamente'}
      </Text>
      {!correct ? (
        <Text className="text-text text-sm">
          Respuesta: <Text className="font-semibold">{correctAnswer}</Text>
        </Text>
      ) : null}
      {explanation ? <Text className="text-muted text-sm">{explanation}</Text> : null}
    </View>
  );
}
