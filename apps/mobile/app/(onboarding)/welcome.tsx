import {
  DAILY_GOAL_LABELS,
  DAILY_GOAL_OPTIONS,
  DEFAULT_DAILY_GOAL,
  type DailyGoal,
} from '@nivelate/shared';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useOnboarding } from '../../src/hooks/useOnboarding';
import { useAuthStore } from '../../src/stores/auth';
import { Button } from '../../src/ui/Button';
import { FormError } from '../../src/ui/FormError';
import { Input } from '../../src/ui/Input';
import { ScreenLayout } from '../../src/ui/ScreenLayout';

function defaultNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  return local.replace(/[._-]/g, ' ').slice(0, 40);
}

export default function Welcome() {
  const email = useAuthStore((s) => (s.state.status === 'authenticated' ? s.state.email : ''));
  const [displayName, setDisplayName] = useState(defaultNameFromEmail(email));
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(DEFAULT_DAILY_GOAL);
  const onboarding = useOnboarding();

  const submitError = onboarding.error instanceof Error ? onboarding.error.message : null;

  function handleStart(withName: boolean) {
    onboarding.reset();
    onboarding.mutate({
      displayName: withName ? displayName.trim() : null,
      dailyGoalMin: withName ? dailyGoal : DEFAULT_DAILY_GOAL,
    });
  }

  return (
    <ScreenLayout title="Bienvenido" subtitle="Un par de datos y arrancamos.">
      <FormError message={submitError} />

      <Input
        label="¿Cómo querés que te llamemos?"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
        maxLength={40}
        editable={!onboarding.isPending}
      />

      <View className="gap-2">
        <Text className="text-text text-sm font-medium">Meta diaria</Text>
        <View className="gap-2">
          {DAILY_GOAL_OPTIONS.map((goal) => {
            const selected = goal === dailyGoal;
            return (
              <Pressable
                key={goal}
                onPress={() => setDailyGoal(goal)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={`flex-row items-center justify-between rounded-lg border px-4 py-3 ${
                  selected ? 'border-brand bg-brand/10' : 'border-border bg-surface'
                }`}
              >
                <Text className="text-text text-base">{DAILY_GOAL_LABELS[goal]}</Text>
                {selected ? <Text className="text-brand text-base">●</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        label="Empezar"
        loading={onboarding.isPending}
        loadingLabel="Guardando…"
        onPress={() => handleStart(true)}
      />

      <Button
        label="Saltar"
        variant="ghost"
        onPress={() => handleStart(false)}
        disabled={onboarding.isPending}
      />
    </ScreenLayout>
  );
}
