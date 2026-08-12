import type { Achievement } from './types';

// Definiciones estáticas de los logros. Un logro nuevo requiere:
// 1) agregar acá, 2) sumar el caso en evaluate.ts, 3) sumar el caso en la
// función SQL public.evaluate_achievements(uuid). Los tres deben coincidir.
export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first_lesson',
    title: 'Primera lección',
    description: 'Completaste tu primera lección.',
    emoji: '🎯',
  },
  {
    id: 'five_lessons',
    title: 'Cinco lecciones',
    description: 'Completaste cinco lecciones.',
    emoji: '📚',
  },
  {
    id: 'first_unit',
    title: 'Primera unidad',
    description: 'Terminaste una unidad completa.',
    emoji: '🏁',
  },
  {
    id: 'streak_3',
    title: 'Tres días',
    description: 'Tres días seguidos de estudio.',
    emoji: '🔥',
  },
  {
    id: 'streak_7',
    title: 'Una semana',
    description: 'Siete días seguidos de estudio.',
    emoji: '🔥',
  },
  {
    id: 'streak_30',
    title: 'Un mes',
    description: 'Treinta días seguidos. Nivel constancia.',
    emoji: '🏆',
  },
  { id: 'xp_100', title: '100 XP', description: 'Alcanzaste 100 XP.', emoji: '✨' },
  { id: 'xp_500', title: '500 XP', description: 'Alcanzaste 500 XP.', emoji: '⭐' },
  { id: 'xp_1000', title: '1000 XP', description: 'Alcanzaste 1000 XP.', emoji: '🌟' },
  {
    id: 'perfect_lesson',
    title: 'Lección perfecta',
    description: 'Acertaste todos los ejercicios al primer intento.',
    emoji: '💯',
  },
];

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
