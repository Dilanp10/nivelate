import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

type Props = {
  correct: number;
  total: number;
  passed: boolean;
  bestCorrect?: number;
  bestPassed?: boolean;
  xpAwarded?: number;
  saving: boolean;
  error: string | null;
  onRetry: () => void;
  onExit: () => void;
  onRedo: () => void;
};

/**
 * Resumen del examen de unidad. A diferencia del summary de lección, acá el
 * eje es aprobado/reprobado (umbral 80%), y el CTA principal cambia según:
 * - Aprobó: "Volver al mapa" y opción de repetir.
 * - No aprobó: "Repetir el examen" como acción principal.
 */
export function UnitExamSummary({
  correct,
  total,
  passed,
  bestCorrect,
  bestPassed,
  xpAwarded,
  saving,
  error,
  onRetry,
  onExit,
  onRedo,
}: Props) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const isImprovement =
    bestCorrect !== undefined && correct > bestCorrect;

  return (
    <View className="flex-1 justify-between px-6 py-8">
      <View className="items-center gap-4 mt-8">
        <Icon
          name={passed ? 'cap' : 'note'}
          size={68}
          color={passed ? '#0E7C7B' : '#4F6D7A'}
          strokeWidth={1.4}
        />
        <Text className="text-text text-3xl font-bold text-center">
          {passed ? '¡Aprobado!' : 'Todavía no'}
        </Text>
        <Text className="text-muted text-base text-center">
          {passed
            ? 'Entendiste bien el tema — podés seguir con la próxima unidad.'
            : 'Necesitás al menos 80% para aprobar. Repasá las lecciones y probá de nuevo.'}
        </Text>

        <View
          className={`w-full max-w-xs rounded-2xl border-2 p-5 gap-1 items-center ${
            passed ? 'bg-brand/10 border-brand' : 'bg-danger/10 border-danger'
          }`}
        >
          <Text className={`text-5xl font-bold ${passed ? 'text-brand' : 'text-danger'}`}>
            {correct}
            <Text className="text-2xl text-muted font-semibold">/{total}</Text>
          </Text>
          <Text className="text-muted text-sm">{pct}% correctas</Text>
        </View>

        {saving ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#0E7C7B" />
            <Text className="text-muted text-sm">Guardando…</Text>
          </View>
        ) : xpAwarded && xpAwarded > 0 ? (
          <View className="bg-gold/10 border-2 border-gold rounded-2xl px-4 py-2">
            <Text className="text-gold text-sm font-bold">+{xpAwarded} XP · primera vez que aprobás</Text>
          </View>
        ) : isImprovement ? (
          <Text className="text-muted text-sm italic">Mejor score que la vez anterior</Text>
        ) : bestPassed && !passed ? (
          <Text className="text-muted text-sm italic">
            Ya lo habías aprobado antes con {bestCorrect}/{total}.
          </Text>
        ) : null}

        {error ? (
          <View className="w-full max-w-xs gap-2 items-center">
            <Text className="text-danger text-sm text-center">{error}</Text>
            <Button label="Reintentar guardado" variant="secondary" onPress={onRetry} />
          </View>
        ) : null}
      </View>

      <View className="gap-3">
        {passed ? (
          <>
            <Button label="Volver al mapa" onPress={onExit} />
            <Button label="Repetir el examen" variant="ghost" onPress={onRedo} />
          </>
        ) : (
          <>
            <Button label="Repetir el examen" onPress={onRedo} />
            <Button label="Volver al mapa" variant="ghost" onPress={onExit} />
          </>
        )}
      </View>
    </View>
  );
}
