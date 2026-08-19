import {
  type UserAnswer,
  checkAnswer,
  currentExerciseId,
  initLesson,
  lessonReducer,
  summarize,
} from '@nivelate/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompleteUnitExam } from '../../../src/hooks/useCompleteUnitExam';
import type { PlayableExercise } from '../../../src/hooks/useLesson';
import { useUnitExam } from '../../../src/hooks/useUnitExam';
import { randomUUID } from '../../../src/lib/uuid';
import { ExerciseRenderer, isAnswerComplete } from '../../../src/player/ExerciseRenderer';
import { FeedbackBanner } from '../../../src/player/FeedbackBanner';
import { LessonProgress } from '../../../src/player/LessonProgress';
import { UnitExamSummary } from '../../../src/player/UnitExamSummary';
import { Button } from '../../../src/ui/Button';

type PayloadWithExplanation = { explanation?: string };

export default function UnitExamScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();
  // Nonce que fuerza remount del runner al pedir "repetir" — regenera el mix
  // aleatorio y resetea el reducer/idempotencyKey.
  const [runNonce, setRunNonce] = useState(0);
  const query = useUnitExam(unitId ?? '');

  if (query.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#0E7C7B" />
      </SafeAreaView>
    );
  }

  if (query.isError || !query.data) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6 gap-4">
        <Text className="text-text text-base text-center">
          No se pudo cargar el examen.
          {query.error instanceof Error ? `\n${query.error.message}` : ''}
        </Text>
        <Button label="Volver" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (query.data.exercises.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6 gap-4">
        <Text className="text-text text-base text-center">
          Esta unidad todavía no tiene ejercicios para armar el examen.
        </Text>
        <Button label="Volver" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <UnitExamRunner
      key={runNonce}
      unitId={unitId ?? ''}
      unitTitle={query.data.unitTitle}
      exercises={query.data.exercises}
      onExit={() => router.back()}
      onRedo={() => {
        query.refetch();
        setRunNonce((n) => n + 1);
      }}
    />
  );
}

function UnitExamRunner({
  unitId,
  unitTitle: _unitTitle,
  exercises,
  onExit,
  onRedo,
}: {
  unitId: string;
  unitTitle: string;
  exercises: PlayableExercise[];
  onExit: () => void;
  onRedo: () => void;
}) {
  const byId = useMemo(() => {
    const m: Record<string, PlayableExercise> = {};
    for (const e of exercises) m[e.id] = e;
    return m;
  }, [exercises]);

  const [state, dispatch] = useReducer(
    lessonReducer,
    exercises.map((e) => e.id),
    initLesson,
  );
  const [answer, setAnswer] = useState<UserAnswer | null>(null);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    correctAnswer: string;
    typo?: boolean;
  } | null>(null);
  const complete = useCompleteUnitExam();
  const completeMutate = complete.mutate;
  const [submitted, setSubmitted] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  const total = exercises.length;
  const done = Object.values(state.results).filter((r) => r.done).length;

  // Persistir el resultado una sola vez al entrar al resumen.
  useEffect(() => {
    if (state.phase === 'summary' && !submitted) {
      setSubmitted(true);
      if (!idempotencyKeyRef.current) idempotencyKeyRef.current = randomUUID();
      const summary = summarize(state);
      completeMutate({
        unitId,
        total: summary.total,
        correct: summary.firstTryCorrect,
        idempotencyKey: idempotencyKeyRef.current,
      });
    }
  }, [state, submitted, completeMutate, unitId]);

  if (state.phase === 'summary') {
    const summary = summarize(state);
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
        <UnitExamSummary
          correct={summary.firstTryCorrect}
          total={summary.total}
          passed={complete.data?.passed ?? summary.firstTryCorrect >= Math.ceil(summary.total * 0.8)}
          bestCorrect={complete.data?.best_correct}
          bestPassed={complete.data?.best_passed}
          xpAwarded={complete.data?.xp_awarded}
          saving={complete.isPending}
          error={complete.isError ? 'No se pudo guardar el resultado.' : null}
          onRetry={() =>
            complete.mutate({
              unitId,
              total: summary.total,
              correct: summary.firstTryCorrect,
              idempotencyKey: idempotencyKeyRef.current ?? randomUUID(),
            })
          }
          onExit={onExit}
          onRedo={onRedo}
        />
      </SafeAreaView>
    );
  }

  const currentId = currentExerciseId(state);
  const exercise = currentId ? byId[currentId] : null;
  if (!exercise) return null;

  const inFeedback = state.phase === 'feedback';

  function handleVerify() {
    if (!exercise || !answer) return;
    const result = checkAnswer(exercise, answer);
    setLastResult(result);
    dispatch({ kind: 'ANSWER', correct: result.correct });
  }

  function handleContinue() {
    dispatch({ kind: 'CONTINUE' });
    setAnswer(null);
    setLastResult(null);
  }

  const explanation = (exercise.payload as PayloadWithExplanation).explanation;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className="px-4">
        <LessonProgress done={done} total={total} onClose={onExit} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-brand text-xs font-bold uppercase tracking-widest mb-3">
          Examen · ejercicio {done + (inFeedback ? 0 : 1)}/{total}
        </Text>
        <ExerciseRenderer
          exercise={exercise}
          answer={answer}
          disabled={inFeedback}
          revealed={inFeedback}
          onAnswer={setAnswer}
        />
      </ScrollView>

      <View
        className={`px-6 pt-4 pb-5 gap-4 border-t-2 ${
          inFeedback && lastResult
            ? lastResult.correct
              ? 'bg-brand/10 border-brand/30'
              : 'bg-danger/10 border-danger/30'
            : 'border-transparent'
        }`}
      >
        {inFeedback && lastResult ? (
          <FeedbackBanner
            correct={lastResult.correct}
            correctAnswer={lastResult.correctAnswer}
            explanation={explanation}
            typo={lastResult.typo}
          />
        ) : null}

        {inFeedback ? (
          <Button
            label="Continuar"
            variant={lastResult?.correct === false ? 'danger' : 'primary'}
            onPress={handleContinue}
          />
        ) : (
          <Button
            label="Verificar"
            onPress={handleVerify}
            disabled={!isAnswerComplete(exercise, answer)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
