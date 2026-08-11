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
