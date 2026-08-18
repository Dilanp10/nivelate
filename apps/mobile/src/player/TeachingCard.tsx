import { type LearningGoal, filterByGoal } from '@nivelate/shared';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { PlayableTeachingCard } from '../hooks/useLesson';
import { isTtsAvailable, speak } from '../lib/tts';
import { Button } from '../ui/Button';
import { ExercisePrompt } from '../ui/OptionCard';

type Props = {
  card: PlayableTeachingCard;
  userGoal: LearningGoal | null | undefined;
  onContinue: () => void;
};

/**
 * Fase de "enseñar" antes de los ejercicios. Presenta la regla o vocabulario
 * en español y 3-5 ejemplos con audio. Los ejemplos se filtran por el
 * `learning_goal` del perfil: si hay al menos 2 que matchean, mostramos solo
 * esos; si no, completamos con los agnósticos.
 */
export function TeachingCard({ card, userGoal, onContinue }: Props) {
  const ttsOk = isTtsAvailable();
  // Mostrar solo los ejemplos del goal si hay al menos 2; si no, completar con
  // agnósticos. Nunca mezclar con otros goals.
  const examples = filterByGoal(card.examples, userGoal, 2);

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-6 gap-6"
        keyboardShouldPersistTaps="handled"
      >
        <ExercisePrompt hint="Aprendé esto">{card.titleEs}</ExercisePrompt>

        <Text className="text-text/90 text-base leading-6">{card.bodyEs}</Text>

        <View className="gap-3">
          <Text className="text-muted text-xs font-bold uppercase tracking-widest">Ejemplos</Text>
          {examples.map((ex, i) => (
            <View
              key={`${card.id}-ex-${i}`}
              className="flex-row items-center gap-3 rounded-2xl border-2 border-b-4 border-border bg-surface px-4 py-3"
            >
              <View className="flex-1 gap-1">
                <Text className="text-text text-lg font-semibold leading-6">{ex.en}</Text>
                <Text className="text-muted text-sm leading-5">{ex.es}</Text>
              </View>
              <Pressable
                onPress={() => speak(ex.en)}
                disabled={!ttsOk}
                accessibilityRole="button"
                accessibilityLabel={`Escuchar: ${ex.en}`}
                className={`w-11 h-11 rounded-full items-center justify-center border-b-4 active:border-b-0 active:translate-y-1 ${
                  ttsOk ? 'bg-info border-info-dark' : 'bg-surface-light border-border'
                }`}
              >
                <Text className={`text-lg ${ttsOk ? 'text-bg' : 'text-muted'}`}>▶</Text>
              </Pressable>
            </View>
          ))}
          {!ttsOk ? (
            <Text className="text-muted text-xs italic">
              Audio no disponible en este navegador.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View className="px-6 pt-4 pb-5 border-t-2 border-transparent">
        <Button label="Entendido" onPress={onContinue} />
      </View>
    </View>
  );
}
