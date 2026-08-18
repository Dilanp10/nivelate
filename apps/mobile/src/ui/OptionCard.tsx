import { Pressable, Text, View } from 'react-native';

/**
 * Estado visual de una opción elegible.
 * - idle:     sin tocar
 * - selected: elegida, todavía sin verificar
 * - correct:  revelada como correcta
 * - wrong:    elegida y revelada como incorrecta
 */
export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

const containerByState: Record<OptionState, string> = {
  idle: 'border-border border-b-4 bg-surface active:bg-surface-light',
  selected: 'border-info border-b-4 bg-info/15',
  correct: 'border-brand border-b-4 bg-brand/15',
  wrong: 'border-danger border-b-4 bg-danger/15',
};

const labelByState: Record<OptionState, string> = {
  idle: 'text-text',
  selected: 'text-info',
  correct: 'text-brand',
  wrong: 'text-danger',
};

const markByState: Record<OptionState, string | null> = {
  idle: null,
  selected: null,
  correct: '✓',
  wrong: '✕',
};

type Props = {
  label: string;
  state: OptionState;
  disabled?: boolean;
  onPress: () => void;
};

export function OptionCard({ label, state, disabled, onPress }: Props) {
  const mark = markByState[state];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: state !== 'idle', disabled }}
      className={`flex-row items-center gap-3 rounded-2xl border-2 px-5 py-4 ${containerByState[state]}`}
    >
      <Text className={`flex-1 text-base font-semibold ${labelByState[state]}`}>{label}</Text>
      {mark ? <Text className={`text-lg font-bold ${labelByState[state]}`}>{mark}</Text> : null}
    </Pressable>
  );
}

/** Ficha de palabra (word order, banco de tokens). */
export function TokenChip({
  label,
  used,
  disabled,
  onPress,
  tone = 'neutral',
  accessibilityLabel,
}: {
  label: string;
  used?: boolean;
  disabled?: boolean;
  onPress: () => void;
  tone?: 'neutral' | 'chosen';
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      disabled={disabled || used}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      className={`rounded-xl border-2 border-b-4 px-4 py-2.5 ${
        used
          ? 'border-border/40 bg-bg opacity-30'
          : tone === 'chosen'
            ? 'border-info bg-info/15 active:translate-y-0.5'
            : 'border-border bg-surface active:bg-surface-light active:translate-y-0.5'
      }`}
    >
      <Text className={`text-base font-semibold ${tone === 'chosen' ? 'text-info' : 'text-text'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Encabezado de consigna, consistente en todos los tipos de ejercicio. */
export function ExercisePrompt({ children, hint }: { children: string; hint?: string }) {
  return (
    <View className="gap-1.5">
      {hint ? (
        <Text className="text-muted text-xs font-bold uppercase tracking-widest">{hint}</Text>
      ) : null}
      <Text className="text-text text-2xl font-bold leading-8">{children}</Text>
    </View>
  );
}
