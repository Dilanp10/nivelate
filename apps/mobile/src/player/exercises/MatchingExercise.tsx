import type { MatchingPayload, UserAnswer } from '@nivelate/shared';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  payload: MatchingPayload;
  disabled?: boolean;
  onChange: (answer: UserAnswer) => void;
};

// Se elige un item de la izquierda y luego uno de la derecha para emparejar.
// La derecha se baraja para que no quede alineada con la izquierda.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

export function MatchingExercise({ payload, disabled, onChange }: Props) {
  const lefts = payload.pairs.map((p) => p.left);
  const rights = useMemo(() => shuffle(payload.pairs.map((p) => p.right)), [payload.pairs]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  // left → right elegido
  const [matches, setMatches] = useState<Record<string, string>>({});

  function emit(next: Record<string, string>) {
    const pairs = Object.entries(next).map(([left, right]) => ({ left, right }));
    onChange({ type: 'matching', pairs });
  }

  function pickRight(right: string) {
    if (disabled || selectedLeft === null) return;
    const next = { ...matches, [selectedLeft]: right };
    setMatches(next);
    setSelectedLeft(null);
    emit(next);
  }

  const usedRights = new Set(Object.values(matches));

  return (
    <View className="gap-4">
      <Text className="text-muted text-sm">Tocá una palabra y luego su pareja.</Text>
      <View className="flex-row gap-3">
        {/* Columna izquierda */}
        <View className="flex-1 gap-2">
          {lefts.map((left) => {
            const matched = matches[left];
            const active = selectedLeft === left;
            return (
              <Pressable
                key={left}
                disabled={disabled}
                onPress={() => setSelectedLeft(left)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={`rounded-lg border px-3 py-3 ${
                  active
                    ? 'border-brand bg-brand/10'
                    : matched
                      ? 'border-border bg-bg'
                      : 'border-border bg-surface'
                }`}
              >
                <Text className="text-text text-base">{left}</Text>
                {matched ? <Text className="text-muted text-xs mt-0.5">→ {matched}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        {/* Columna derecha (barajada) */}
        <View className="flex-1 gap-2">
          {rights.map((right) => {
            const used = usedRights.has(right);
            return (
              <Pressable
                key={right}
                disabled={disabled || used}
                onPress={() => pickRight(right)}
                accessibilityRole="button"
                className={`rounded-lg border px-3 py-3 ${
                  used ? 'border-border bg-bg opacity-40' : 'border-border bg-surface'
                }`}
              >
                <Text className="text-text text-base">{right}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
