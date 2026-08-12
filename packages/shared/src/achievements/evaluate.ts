import type { AchievementState } from './types';

// Espeja la función SQL public.evaluate_achievements(uuid). El SQL es la
// autoridad; esta versión sirve para tests y para display optimista.
// Un logro nuevo requiere sumarlo acá Y en el SQL.
export function evaluateAchievements(state: AchievementState): string[] {
  const ids: string[] = [];

  if (state.lessonCompletions >= 1) ids.push('first_lesson');
  if (state.lessonCompletions >= 5) ids.push('five_lessons');
  if (state.firstUnitDone) ids.push('first_unit');
  if (state.currentStreak >= 3) ids.push('streak_3');
  if (state.currentStreak >= 7) ids.push('streak_7');
  if (state.currentStreak >= 30) ids.push('streak_30');
  if (state.totalXp >= 100) ids.push('xp_100');
  if (state.totalXp >= 500) ids.push('xp_500');
  if (state.totalXp >= 1000) ids.push('xp_1000');
  if (state.hasPerfectLesson) ids.push('perfect_lesson');

  return ids;
}
