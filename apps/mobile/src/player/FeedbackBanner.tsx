import { Text, View } from 'react-native';

type Props = {
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
  /** true si fue aceptada por tolerancia de tipeo — mostramos "Casi" pero
   * igual dejamos ver la escritura correcta para que la aprenda. */
  typo?: boolean;
};

// Va dentro de la bandeja inferior, que ya aporta el color de fondo — acá
// sólo el ícono, el veredicto y la explicación, sin otra caja encima.
export function FeedbackBanner({ correct, correctAnswer, explanation, typo }: Props) {
  const tone = correct ? 'text-brand' : 'text-danger';
  const verdict = !correct ? 'No exactamente' : typo ? 'Casi' : '¡Muy bien!';
  // Mostrar la respuesta correcta cuando fue error, y también cuando pasó por
  // tipo tolerance — así el usuario aprende la escritura correcta.
  const showCorrectAnswer = !correct || typo;

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
        <Text className={`text-lg font-bold ${tone}`}>{verdict}</Text>
        {showCorrectAnswer ? (
          <Text className="text-text text-sm">
            {typo ? 'Se escribe: ' : 'Respuesta correcta: '}
            <Text className={`font-bold ${tone}`}>{correctAnswer}</Text>
          </Text>
        ) : null}
        {explanation ? <Text className="text-muted text-sm leading-5">{explanation}</Text> : null}
      </View>
    </View>
  );
}
