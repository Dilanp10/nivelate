import { type UserAnswer, checkAnswer } from '@nivelate/shared';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DueCard } from '../hooks/useDueCards';
import { useReviewCard } from '../hooks/useReviewCard';
import { ExerciseRenderer, isAnswerComplete } from '../player/ExerciseRenderer';
import { FeedbackBanner } from '../player/FeedbackBanner';
import { LessonProgress } from '../player/LessonProgress';
import { Button } from '../ui/Button';
import { FormError } from '../ui/FormError';
import { ReviewSummary } from './ReviewSummary';

type PayloadWithExplanation = { explanation?: string };

type Props = {
  cards: DueCard[];
  onExit: () => void;
};

// Sesión de repaso: una respuesta por card (sin re-intento). Reusa los renderers
// y checkAnswer de 005; sin el reducer de lección.
export function ReviewRunner({ cards, onExit }: Props) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<UserAnswer | null>(null);
  const [lastResult, setLastResult] = useState<{ correct: boolean; correctAnswer: string } | null>(
    null,
  );
  const [correctCount, setCorrectCount] = useState(0);
  const review = useReviewCard();

  const total = cards.length;
  const done = index >= total;
  const current = cards[index];
  const phase: 'answering' | 'feedback' = lastResult ? 'feedback' : 'answering';

  if (done) {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
        <ReviewSummary total={total} correct={correctCount} onDone={onExit} />
      </SafeAreaView>
    );
  }
  if (!current) return null;

  const explanation = (current.exercise.payload as PayloadWithExplanation).explanation;

  function handleVerify() {
    if (!current || !answer) return;
    const result = checkAnswer(current.exercise, answer);
    setLastResult(result);
    if (result.correct) setCorrectCount((n) => n + 1);
    review.mutate({ exerciseId: current.exercise.id, correct: result.correct });
  }

  function handleRetryPersist() {
    if (!current || !lastResult) return;
    review.mutate({ exerciseId: current.exercise.id, correct: lastResult.correct });
  }

  function handleContinue() {
    setIndex((i) => i + 1);
    setAnswer(null);
    setLastResult(null);
    review.reset();
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className="px-4">
        <LessonProgress done={index} total={total} onClose={onExit} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-6 gap-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="self-start rounded-full bg-info/15 px-3 py-1">
          <Text className="text-info text-xs font-bold uppercase tracking-widest">Repaso</Text>
        </View>
        <ExerciseRenderer
          exercise={current.exercise}
          answer={answer}
          disabled={phase === 'feedback'}
          revealed={phase === 'feedback'}
          onAnswer={setAnswer}
        />
      </ScrollView>

      <View
        className={`px-6 pt-4 pb-5 gap-4 border-t-2 ${
          phase === 'feedback' && lastResult
            ? lastResult.correct
              ? 'bg-brand/10 border-brand/30'
              : 'bg-danger/10 border-danger/30'
            : 'border-transparent'
        }`}
      >
        {phase === 'feedback' && lastResult ? (
          <FeedbackBanner
            correct={lastResult.correct}
            correctAnswer={lastResult.correctAnswer}
            explanation={explanation}
          />
        ) : null}

        {phase === 'feedback' && review.isError ? (
          <View className="gap-2">
            <FormError message="No se pudo guardar este repaso. Podés reintentar o seguir sin guardarlo." />
            <Button
              label="Reintentar guardado"
              variant="secondary"
              loading={review.isPending}
              onPress={handleRetryPersist}
            />
          </View>
        ) : null}

        {phase === 'feedback' ? (
          <Button
            label="Continuar"
            variant={lastResult?.correct === false ? 'danger' : 'primary'}
            onPress={handleContinue}
          />
        ) : (
          <Button
            label="Verificar"
            onPress={handleVerify}
            disabled={!isAnswerComplete(current.exercise, answer)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
