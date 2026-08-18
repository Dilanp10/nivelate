import {
  DAILY_GOAL_LABELS,
  DAILY_GOAL_OPTIONS,
  DEFAULT_DAILY_GOAL,
  type DailyGoal,
  LEARNING_GOAL_META,
  LEARNING_GOAL_OPTIONS,
  type LearningGoal,
  SELF_LEVEL_META,
  SELF_LEVEL_OPTIONS,
  type SelfLevel,
} from '@nivelate/shared';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../src/hooks/useOnboarding';
import { useAuthStore } from '../../src/stores/auth';
import { Button } from '../../src/ui/Button';
import { FormError } from '../../src/ui/FormError';
import { Input } from '../../src/ui/Input';

const STEP_IDS = ['name', 'goal', 'level', 'time'] as const;
const TOTAL_STEPS = STEP_IDS.length;

function defaultNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  return local.replace(/[._-]/g, ' ').slice(0, 40);
}

/** Una sola convención de color: azul = lo que elegiste. En los 4 pasos. */
function pickClasses(selected: boolean): string {
  return selected
    ? 'border-info border-b-4 bg-info/15'
    : 'border-border border-b-4 bg-surface active:bg-surface-light';
}

export default function Welcome() {
  const email = useAuthStore((s) => (s.state.status === 'authenticated' ? s.state.email : ''));
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(defaultNameFromEmail(email));
  const [learningGoal, setLearningGoal] = useState<LearningGoal | null>(null);
  const [selfLevel, setSelfLevel] = useState<SelfLevel | null>(null);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(DEFAULT_DAILY_GOAL);
  const onboarding = useOnboarding();

  const submitError = onboarding.error instanceof Error ? onboarding.error.message : null;

  function handleNext() {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else submit(true);
  }

  function submit(withAnswers: boolean) {
    onboarding.reset();
    onboarding.mutate({
      displayName: withAnswers ? displayName.trim() || null : null,
      dailyGoalMin: withAnswers ? dailyGoal : DEFAULT_DAILY_GOAL,
      learningGoal: withAnswers ? learningGoal : null,
      selfLevel: withAnswers ? selfLevel : null,
    });
  }

  const canAdvance =
    step === 0
      ? displayName.trim().length > 0
      : step === 1
        ? learningGoal !== null
        : step === 2
          ? selfLevel !== null
          : true;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className="flex-1 px-6 pt-4 pb-6 w-full max-w-md mx-auto">
        {/* Progreso del wizard */}
        <View className="flex-row items-center gap-3 mb-6">
          <View className="flex-1 flex-row gap-1.5">
            {STEP_IDS.map((id, i) => (
              <View
                key={id}
                className={`flex-1 h-2.5 rounded-full ${i <= step ? 'bg-brand' : 'bg-surface'}`}
              />
            ))}
          </View>
          <Text className="text-muted text-xs font-bold">
            {step + 1}/{TOTAL_STEPS}
          </Text>
        </View>

        <FormError message={submitError} />

        <ScrollView className="flex-1" contentContainerClassName="gap-6 pb-4">
          {step === 0 && (
            <>
              <StepHeader
                emoji="👋"
                title="¿Cómo te llamás?"
                subtitle="Para saludarte por tu nombre."
              />
              <Input
                label=""
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                maxLength={40}
                placeholder="Tu nombre"
                editable={!onboarding.isPending}
              />
            </>
          )}

          {step === 1 && (
            <>
              <StepHeader
                emoji="🎯"
                title="¿Para qué querés el inglés?"
                subtitle="Nos ayuda a priorizar el vocabulario."
              />
              <View className="gap-3">
                {LEARNING_GOAL_OPTIONS.map((goal) => {
                  const selected = goal === learningGoal;
                  const meta = LEARNING_GOAL_META[goal];
                  return (
                    <Pressable
                      key={goal}
                      onPress={() => setLearningGoal(goal)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className={`flex-row items-center gap-4 rounded-2xl border-2 px-5 py-4 ${pickClasses(selected)}`}
                    >
                      <Text className="text-2xl">{meta.emoji}</Text>
                      <Text
                        className={`flex-1 text-lg font-bold ${selected ? 'text-info' : 'text-text'}`}
                      >
                        {meta.label}
                      </Text>
                      {selected ? <Text className="text-info text-lg font-bold">✓</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <StepHeader
                emoji="📊"
                title="¿Cuánto inglés sabés hoy?"
                subtitle="Sé honesto — no hay respuesta incorrecta."
              />
              <View className="gap-3">
                {SELF_LEVEL_OPTIONS.map((lvl) => {
                  const selected = lvl === selfLevel;
                  const meta = SELF_LEVEL_META[lvl];
                  return (
                    <Pressable
                      key={lvl}
                      onPress={() => setSelfLevel(lvl)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className={`flex-row items-center gap-4 rounded-2xl border-2 px-5 py-4 ${pickClasses(selected)}`}
                    >
                      <Text className="text-2xl">{meta.emoji}</Text>
                      <View className="flex-1">
                        <Text
                          className={`text-lg font-bold ${selected ? 'text-info' : 'text-text'}`}
                        >
                          {meta.label}
                        </Text>
                        <Text className="text-muted text-sm">{meta.description}</Text>
                      </View>
                      {selected ? <Text className="text-info text-lg font-bold">✓</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <StepHeader
                emoji="⏱️"
                title="¿Cuánto tiempo por día?"
                subtitle="Podés cambiarlo cuando quieras."
              />
              <View className="gap-3">
                {DAILY_GOAL_OPTIONS.map((goal) => {
                  const selected = goal === dailyGoal;
                  return (
                    <Pressable
                      key={goal}
                      onPress={() => setDailyGoal(goal)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className={`flex-row items-center justify-between rounded-2xl border-2 px-5 py-4 ${pickClasses(selected)}`}
                    >
                      <Text className={`text-lg font-bold ${selected ? 'text-info' : 'text-text'}`}>
                        {DAILY_GOAL_LABELS[goal]}
                      </Text>
                      {selected ? <Text className="text-info text-lg font-bold">✓</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        <View className="gap-2 pt-2">
          <Button
            label={step === TOTAL_STEPS - 1 ? '¡Empezar!' : 'Continuar'}
            onPress={handleNext}
            loading={onboarding.isPending}
            loadingLabel="Guardando…"
            disabled={!canAdvance}
          />
          <View className="flex-row justify-between items-center">
            {step > 0 ? (
              <Pressable onPress={() => setStep(step - 1)} className="px-2 py-3">
                <Text className="text-muted text-sm font-semibold">← Atrás</Text>
              </Pressable>
            ) : (
              <View />
            )}
            <Pressable
              onPress={() => submit(false)}
              disabled={onboarding.isPending}
              className="px-2 py-3"
            >
              <Text className="text-muted text-sm font-semibold">Saltar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function StepHeader({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="gap-2">
      <Text className="text-5xl">{emoji}</Text>
      <Text className="text-text text-2xl font-bold leading-8">{title}</Text>
      <Text className="text-muted text-base">{subtitle}</Text>
    </View>
  );
}
