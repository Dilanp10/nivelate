import { Text, View } from 'react-native';

type Props = {
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
};

// Va dentro de la bandeja inferior, que ya aporta el color de fondo — acá
// sólo el ícono, el veredicto y la explicación, sin otra caja encima.
export function FeedbackBanner({ correct, correctAnswer, explanation }: Props) {
  const tone = correct ? 'text-brand' : 'text-danger';

  return (
    <View accessibilityRole="alert" className="flex-row gap-3">
      <View
        className={`w-9 h-9 rounded-full items-center justify-center ${
          correct ? 'bg-brand' : 'bg-danger'
        }`}
      >
        <Text className="text-bg text-lg font-bold">{correct ? '✓' : '✕'}</Text>
      </View>

      <View className="flex-1 gap-1">
        <Text className={`text-lg font-bold ${tone}`}>
          {correct ? '¡Muy bien!' : 'No exactamente'}
        </Text>
        {!correct ? (
          <Text className="text-text text-sm">
            Respuesta correcta: <Text className={`font-bold ${tone}`}>{correctAnswer}</Text>
          </Text>
        ) : null}
        {explanation ? <Text className="text-muted text-sm leading-5">{explanation}</Text> : null}
      </View>
    </View>
  );
}
