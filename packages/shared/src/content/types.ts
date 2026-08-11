import type { Database } from '../database.types';

export type Unit = Database['public']['Tables']['units']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type ExerciseRow = Database['public']['Tables']['exercises']['Row'];
export type GrammarTopic = Database['public']['Tables']['grammar_topics']['Row'];
export type VocabItem = Database['public']['Tables']['vocab_items']['Row'];

export const EXERCISE_TYPES = [
  'multiple_choice',
  'fill_in_blank',
  'matching',
  'word_order',
  'listening',
  'translation',
  'dialogue',
] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];
