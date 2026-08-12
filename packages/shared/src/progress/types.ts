import type { Database } from '../database.types';

export type XpEvent = Database['public']['Tables']['xp_events']['Row'];
export type LessonCompletion = Database['public']['Tables']['lesson_completions']['Row'];

/** Lo que devuelve el RPC complete_lesson. */
export type CompleteLessonResult = {
  xp_awarded: number;
  new_total_xp: number;
  current_streak: number;
  /** ids de logros recién desbloqueados en esta llamada. Añadido en 007. */
  newly_unlocked: string[];
};
