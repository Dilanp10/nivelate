import type {
  DialoguePayload,
  FillInBlankPayload,
  ListeningPayload,
  MatchingPayload,
  MultipleChoicePayload,
  TranslationPayload,
  UserAnswer,
  WordOrderPayload,
} from '@nivelate/shared';
import type { PlayableExercise } from '../hooks/useLesson';
import { DialogueExercise } from './exercises/DialogueExercise';
import { FillInBlankExercise } from './exercises/FillInBlankExercise';
import { ListeningExercise } from './exercises/ListeningExercise';
import { MatchingExercise } from './exercises/MatchingExercise';
import { MultipleChoiceExercise } from './exercises/MultipleChoiceExercise';
import { TranslationExercise } from './exercises/TranslationExercise';
import { WordOrderExercise } from './exercises/WordOrderExercise';

type Props = {
  exercise: PlayableExercise;
  answer: UserAnswer | null;
  disabled?: boolean;
  /** Tras verificar: los tipos de opción pintan la correcta y la errónea. */
  revealed?: boolean;
  onAnswer: (answer: UserAnswer) => void;
};

export function ExerciseRenderer({ exercise, answer, disabled, revealed, onAnswer }: Props) {
  switch (exercise.type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceExercise
          payload={exercise.payload as MultipleChoicePayload}
          selectedIndex={answer?.type === 'multiple_choice' ? answer.selectedIndex : null}
          disabled={disabled}
          revealed={revealed}
          onSelect={onAnswer}
        />
      );
    case 'dialogue':
      return (
        <DialogueExercise
          payload={exercise.payload as DialoguePayload}
          selectedIndex={answer?.type === 'dialogue' ? answer.selectedIndex : null}
          disabled={disabled}
          revealed={revealed}
          onSelect={onAnswer}
        />
      );
    case 'translation':
      return (
        <TranslationExercise
          payload={exercise.payload as TranslationPayload}
          value={answer?.type === 'translation' ? answer.text : ''}
          disabled={disabled}
          onChange={onAnswer}
        />
      );
    case 'fill_in_blank':
      return (
        <FillInBlankExercise
          payload={exercise.payload as FillInBlankPayload}
          values={answer?.type === 'fill_in_blank' ? answer.values : []}
          disabled={disabled}
          onChange={onAnswer}
        />
      );
    case 'word_order':
      return (
        <WordOrderExercise
          payload={exercise.payload as WordOrderPayload}
          order={answer?.type === 'word_order' ? answer.order : []}
          disabled={disabled}
          onChange={onAnswer}
        />
      );
    case 'matching':
      return (
        <MatchingExercise
          payload={exercise.payload as MatchingPayload}
          disabled={disabled}
          onChange={onAnswer}
        />
      );
    case 'listening':
      return (
        <ListeningExercise
          payload={exercise.payload as ListeningPayload}
          sub={answer?.type === 'listening' ? answer.sub : null}
          disabled={disabled}
          revealed={revealed}
          onChange={onAnswer}
        />
      );
  }
}

/** ¿La respuesta actual es "completa" como para habilitar el botón Verificar? */
export function isAnswerComplete(exercise: PlayableExercise, answer: UserAnswer | null): boolean {
  if (!answer) return false;
  switch (answer.type) {
    case 'multiple_choice':
    case 'dialogue':
      return answer.selectedIndex >= 0;
    case 'translation':
      return answer.text.trim().length > 0;
    case 'fill_in_blank': {
      const blanks = (exercise.payload as FillInBlankPayload).answers.length;
      return answer.values.length === blanks && answer.values.every((v) => v.trim().length > 0);
    }
    case 'word_order': {
      const total = (exercise.payload as WordOrderPayload).tokens.length;
      return answer.order.length === total;
    }
    case 'matching': {
      const total = (exercise.payload as MatchingPayload).pairs.length;
      return answer.pairs.length === total;
    }
    case 'listening': {
      if (answer.sub.kind === 'multiple_choice') return answer.sub.selectedIndex >= 0;
      const blanks = (exercise.payload as ListeningPayload).sub;
      const need = blanks.kind === 'fill_in_blank' ? blanks.answers.length : 0;
      return (
        answer.sub.values.length === need && answer.sub.values.every((v) => v.trim().length > 0)
      );
    }
  }
}
