import type { Database } from '../database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const DAILY_GOAL_OPTIONS = [5, 10, 15, 20] as const;
export type DailyGoal = (typeof DAILY_GOAL_OPTIONS)[number];

export const DEFAULT_DAILY_GOAL: DailyGoal = 10;

export const DAILY_GOAL_LABELS: Record<DailyGoal, string> = {
  5: '5 min — algo es algo',
  10: '10 min — constante',
  15: '15 min — en serio',
  20: '20 min — a fondo',
};

export const LEARNING_GOAL_OPTIONS = [
  'travel',
  'work',
  'study',
  'entertainment',
  'general',
] as const;
export type LearningGoal = (typeof LEARNING_GOAL_OPTIONS)[number];

export const LEARNING_GOAL_META: Record<LearningGoal, { emoji: string; label: string }> = {
  travel: { emoji: '✈️', label: 'Viajar' },
  work: { emoji: '💼', label: 'Trabajo' },
  study: { emoji: '🎓', label: 'Estudiar' },
  entertainment: { emoji: '🎬', label: 'Series y música' },
  general: { emoji: '🌍', label: 'Cultura general' },
};

export const SELF_LEVEL_OPTIONS = ['zero', 'basic', 'conversational', 'intermediate'] as const;
export type SelfLevel = (typeof SELF_LEVEL_OPTIONS)[number];

export const SELF_LEVEL_META: Record<
  SelfLevel,
  { emoji: string; label: string; description: string }
> = {
  zero: { emoji: '🌱', label: 'Empiezo de cero', description: 'No sé nada o casi nada' },
  basic: { emoji: '🔤', label: 'Sé lo básico', description: 'Saludos, colores, números' },
  conversational: { emoji: '💬', label: 'Me defiendo', description: 'Puedo armar frases simples' },
  intermediate: { emoji: '📖', label: 'Nivel intermedio', description: 'Leo y entiendo bastante' },
};

/** Estado de sesión que expone el store de auth. */
export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | {
      status: 'authenticated';
      userId: string;
      email: string;
      emailConfirmedAt: string | null;
      profile: Profile | null;
    };
