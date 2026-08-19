import { Pressable, ScrollView, Text, View } from 'react-native';
import type { PlayableHighlight } from '../hooks/useLesson';
import { isTtsAvailable, speak } from '../lib/tts';
import { Button } from '../ui/Button';
import { ExercisePrompt } from '../ui/OptionCard';

type Props = {
  highlights: PlayableHighlight[];
  onContinue: () => void;
};

/**
 * Pantalla final de refuerzo, entre el último ejercicio y el summary de XP.
 * Muestra las frases clave de la lección con su respelling en español
 * (docs/pronunciation-guide.md) + audio real como modelo.
 */
export function PronunciationSummary({ highlights, onContinue }: Props) {
  const ttsOk = isTtsAvailable();

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-6 gap-6"
        keyboardShouldPersistTaps="handled"
      >
        <ExercisePrompt hint="Refuerzo">Cómo suena lo que aprendiste</ExercisePrompt>

        <View className="gap-3">
          {highlights.map((h, i) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: highlights estáticos por lección, sin reorder
              key={`hi-${i}`}
              className="flex-row items-center gap-3 rounded-2xl border-2 border-border bg-surface px-4 py-3"
            >
              <View className="flex-1 gap-1">
                <Text className="text-text text-lg font-semibold leading-6">{h.en}</Text>
                <Text className="text-info text-sm font-medium leading-5">{h.respelling_es}</Text>
              </View>
              <Pressable
                onPress={() => speak(h.en)}
                disabled={!ttsOk}
                accessibilityRole="button"
                accessibilityLabel={`Escuchar: ${h.en}`}
                className={`w-11 h-11 rounded-full items-center justify-center active:opacity-80 ${
                  ttsOk ? 'bg-info border-info-dark' : 'bg-surface-light border-border'
                }`}
              >
                <Text className={`text-lg ${ttsOk ? 'text-bg' : 'text-muted'}`}>▶</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="px-6 pt-4 pb-5 border-t-2 border-transparent">
        <Button label="Continuar" onPress={onContinue} />
      </View>
    </View>
  );
}
