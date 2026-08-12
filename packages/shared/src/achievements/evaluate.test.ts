import { describe, expect, it } from 'vitest';
import { evaluateAchievements } from './evaluate';
import type { AchievementState } from './types';

const empty: AchievementState = {
  totalXp: 0,
  currentStreak: 0,
  lessonCompletions: 0,
  hasPerfectLesson: false,
  firstUnitDone: false,
};

describe('evaluateAchievements', () => {
  it('estado vacío no desbloquea nada', () => {
    expect(evaluateAchievements(empty)).toEqual([]);
  });

  it('1 lección desbloquea first_lesson', () => {
    const r = evaluateAchievements({ ...empty, lessonCompletions: 1 });
    expect(r).toContain('first_lesson');
    expect(r).not.toContain('five_lessons');
  });

  it('5 lecciones desbloquean first_lesson y five_lessons', () => {
    const r = evaluateAchievements({ ...empty, lessonCompletions: 5 });
    expect(r).toContain('first_lesson');
    expect(r).toContain('five_lessons');
  });

  it('rachas por umbral', () => {
    expect(evaluateAchievements({ ...empty, currentStreak: 3 })).toContain('streak_3');
    expect(evaluateAchievements({ ...empty, currentStreak: 7 })).toEqual(
      expect.arrayContaining(['streak_3', 'streak_7']),
    );
    expect(evaluateAchievements({ ...empty, currentStreak: 30 })).toEqual(
      expect.arrayContaining(['streak_3', 'streak_7', 'streak_30']),
    );
  });

  it('XP acumulativa por umbral', () => {
    expect(evaluateAchievements({ ...empty, totalXp: 100 })).toContain('xp_100');
    expect(evaluateAchievements({ ...empty, totalXp: 500 })).toContain('xp_500');
    expect(evaluateAchievements({ ...empty, totalXp: 1000 })).toEqual(
      expect.arrayContaining(['xp_100', 'xp_500', 'xp_1000']),
    );
  });

  it('perfect_lesson y first_unit son booleanos', () => {
    expect(evaluateAchievements({ ...empty, hasPerfectLesson: true })).toContain('perfect_lesson');
    expect(evaluateAchievements({ ...empty, firstUnitDone: true })).toContain('first_unit');
  });

  it('estado completo desbloquea los 10', () => {
    const full: AchievementState = {
      totalXp: 1500,
      currentStreak: 45,
      lessonCompletions: 20,
      hasPerfectLesson: true,
      firstUnitDone: true,
    };
    expect(evaluateAchievements(full)).toHaveLength(10);
  });
});
