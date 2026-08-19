import {
  type LearningGoal,
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
import { useCompleteLesson } from '../../../src/hooks/useCompleteLesson';
import type { PlayableHighlight, PlayableTeachingCard } from '../../../src/hooks/useLesson';
import { type PlayableExercise, useLesson } from '../../../src/hooks/useLesson';
import { randomUUID } from '../../../src/lib/uuid';
import { ExerciseRenderer, isAnswerComplete } from '../../../src/player/ExerciseRenderer';
import { FeedbackBanner } from '../../../src/player/FeedbackBanner';
import { LessonProgress } from '../../../src/player/LessonProgress';
import { LessonSummary } from '../../../src/player/LessonSummary';
import { PronunciationSummary } from '../../../src/player/PronunciationSummary';
import { TeachingCard } from '../../../src/player/TeachingCard';
import { useAuthStore } from '../../../src/stores/auth';
import { Button } from '../../../src/ui/Button';

type PayloadWithExplanation = { explanation?: string };

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const query = useLesson(lessonId ?? '');

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
      teachingCards={query.data.teachingCards}
      pronunciationHighlights={query.data.pronunciationHighlights}
      onExit={() => router.back()}
    />
  );
}

function LessonRunner({
  lessonId,
  exercises,
  teachingCards,
  pronunciationHighlights,
  onExit,
}: {
  lessonId: string;
  exercises: PlayableExercise[];
  teachingCards: PlayableTeachingCard[];
  pronunciationHighlights: PlayableHighlight[];
  onExit: () => void;
}) {
  const userGoal = useAuthStore((s) =>
    s.state.status === 'authenticated'
      ? ((s.state.profile?.learning_goal as LearningGoal | null) ?? null)
      : null,
  );

  // Fase de enseñanza: se completa antes de los ejercicios. Estado local
  // simple (no comparte reducer con los ejercicios — no hay reintento acá).
  const [cardIndex, setCardIndex] = useState(0);
  const inTeaching = cardIndex < teachingCards.length;

  // Pantalla de pronunciación: se muestra una vez, entre el último ejercicio
  // y el resumen de XP.
  const [pronunciationSeen, setPronunciationSeen] = useState(pronunciationHighlights.length === 0);
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
  const complete = useCompleteLesson();
  const completeMutate = complete.mutate;
  const [submitted, setSubmitted] = useState(false);
  // Una sola key por intento de completar esta lección: se genera al llegar al
  // resumen y se reusa en reintentos, para que un retry tras respuesta perdida
  // no vuelva a otorgar XP (idempotencia server-side).
  const idempotencyKeyRef = useRef<string | null>(null);

  const total = teachingCards.length + exercises.length;
  const exerciseDoneCount = Object.values(state.results).filter((r) => r.done).length;
  const progressDone = inTeaching ? cardIndex : teachingCards.length + exerciseDoneCount;

  // Persistir el resultado una sola vez al entrar al resumen (RPC atómico).
  useEffect(() => {
    if (state.phase === 'summary' && !submitted) {
      setSubmitted(true);
      if (!idempotencyKeyRef.current) idempotencyKeyRef.current = randomUUID();
      const summary = summarize(state);
      completeMutate({
        lessonId,
        total: summary.total,
        firstTryCorrect: summary.firstTryCorrect,
        idempotencyKey: idempotencyKeyRef.current,
      });
    }
  }, [state, submitted, completeMutate, lessonId]);

  if (inTeaching) {
    const card = teachingCards[cardIndex];
    if (!card) return null;
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
        <View className="px-4">
          <LessonProgress
            done={progressDone}
            total={total}
            onClose={onExit}
            onBack={cardIndex > 0 ? () => setCardIndex((i) => i - 1) : undefined}
          />
        </View>
        <TeachingCard
          card={card}
          userGoal={userGoal}
          onContinue={() => setCardIndex((i) => i + 1)}
        />
      </SafeAreaView>
    );
  }

  if (state.phase === 'summary' && !pronunciationSeen) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
        <PronunciationSummary
          highlights={pronunciationHighlights}
          onContinue={() => setPronunciationSeen(true)}
        />
      </SafeAreaView>
    );
  }

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
              // Misma key que el intento original — el server detecta el
              // duplicado y devuelve el resultado ya calculado sin re-otorgar XP.
              idempotencyKey: idempotencyKeyRef.current ?? randomUUID(),
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

  // Durante "answering" (esperando respuesta), permitir volver a la última
  // teaching card para releer la regla. El reducer no se toca — al continuar
  // vuelven al mismo ejercicio con el `answer` local intacto. En feedback ya
  // comprometieron respuesta, no tiene sentido volver.
  const canRevisitTeaching =
    !inFeedback && teachingCards.length > 0 && state.phase === 'answering';

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className="px-4">
        <LessonProgress
          done={progressDone}
          total={total}
          onClose={onExit}
          onBack={
            canRevisitTeaching ? () => setCardIndex(teachingCards.length - 1) : undefined
          }
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <ExerciseRenderer
          exercise={exercise}
          answer={answer}
          disabled={inFeedback}
          revealed={inFeedback}
          onAnswer={setAnswer}
        />
      </ScrollView>

      {/* Bandeja inferior: en feedback se tiñe del color del resultado, así el
          acierto/error se lee sin tener que buscar el texto. */}
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
