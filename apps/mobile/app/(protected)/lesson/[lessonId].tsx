import {
  type UserAnswer,
  checkAnswer,
  currentExerciseId,
  initLesson,
  lessonReducer,
  summarize,
} from '@nivelate/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompleteLesson } from '../../../src/hooks/useCompleteLesson';
import { type PlayableExercise, useLesson } from '../../../src/hooks/useLesson';
import { ExerciseRenderer, isAnswerComplete } from '../../../src/player/ExerciseRenderer';
import { FeedbackBanner } from '../../../src/player/FeedbackBanner';
import { LessonProgress } from '../../../src/player/LessonProgress';
import { LessonSummary } from '../../../src/player/LessonSummary';
import { Button } from '../../../src/ui/Button';

type PayloadWithExplanation = { explanation?: string };

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const query = useLesson(lessonId ?? '');

  if (query.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#22d3ee" />
      </SafeAreaView>
    );
  }

  if (query.isError || !query.data) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6 gap-4">
        <Text className="text-text text-base text-center">
          No se pudo cargar la lección.
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
          Esta lección todavía no tiene ejercicios.
        </Text>
        <Button label="Volver" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <LessonRunner
      lessonId={lessonId ?? ''}
      exercises={query.data.exercises}
      onExit={() => router.back()}
    />
  );
}

function LessonRunner({
  lessonId,
  exercises,
  onExit,
}: {
  lessonId: string;
  exercises: PlayableExercise[];
  onExit: () => void;
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
  const [lastResult, setLastResult] = useState<{ correct: boolean; correctAnswer: string } | null>(
    null,
  );
  const complete = useCompleteLesson();
  const completeMutate = complete.mutate;
  const [submitted, setSubmitted] = useState(false);

  const total = exercises.length;
  const doneCount = Object.values(state.results).filter((r) => r.done).length;

  // Persistir el resultado una sola vez al entrar al resumen (RPC atómico).
  useEffect(() => {
    if (state.phase === 'summary' && !submitted) {
      setSubmitted(true);
      const summary = summarize(state);
      completeMutate({
        lessonId,
        total: summary.total,
        firstTryCorrect: summary.firstTryCorrect,
      });
    }
  }, [state, submitted, completeMutate, lessonId]);

  if (state.phase === 'summary') {
    const summary = summarize(state);

    // La XP oficial es la del server; mientras carga, mostramos la estimada.
    const serverXp = complete.data?.xp_awarded;
    const streak = complete.data?.current_streak;
    const newlyUnlocked = complete.data?.newly_unlocked;
    const errored = complete.isError;

    return (
      <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
        <LessonSummary
          summary={{ ...summary, estimatedXp: serverXp ?? summary.estimatedXp }}
          streak={streak}
          newlyUnlocked={newlyUnlocked}
          saving={complete.isPending}
          error={errored ? 'No se pudo guardar tu progreso.' : null}
          onRetry={() =>
            complete.mutate({
              lessonId,
              total: summary.total,
              firstTryCorrect: summary.firstTryCorrect,
            })
          }
          onDone={onExit}
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
        <LessonProgress done={doneCount} total={total} onClose={onExit} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-4"
        keyboardShouldPersistTaps="handled"
      >
        <ExerciseRenderer
          exercise={exercise}
          answer={answer}
          disabled={inFeedback}
          onAnswer={setAnswer}
        />
      </ScrollView>

      <View className="px-6 pb-4 gap-3">
        {inFeedback && lastResult ? (
          <FeedbackBanner
            correct={lastResult.correct}
            correctAnswer={lastResult.correctAnswer}
            explanation={explanation}
          />
        ) : null}

        {inFeedback ? (
          <Button label="Continuar" onPress={handleContinue} />
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
