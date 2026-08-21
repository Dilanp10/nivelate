import type { Achievement } from './types';

// Definiciones estáticas de los logros. Un logro nuevo requiere:
// 1) agregar acá, 2) sumar el caso en evaluate.ts, 3) sumar el caso en la
// función SQL public.evaluate_achievements(uuid). Los tres deben coincidir.
export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first_lesson',
    title: 'Primera lección',
    description: 'Completaste tu primera lección.',
    icon: 'target',
  },
  {
    id: 'five_lessons',
    title: 'Cinco lecciones',
    description: 'Completaste cinco lecciones.',
    icon: 'book',
  },
  {
    id: 'first_unit',
    title: 'Primera unidad',
    description: 'Terminaste una unidad completa.',
    icon: 'flag',
  },
  {
    id: 'streak_3',
    title: 'Tres días',
    description: 'Tres días seguidos de estudio.',
    icon: 'flame',
  },
  {
    id: 'streak_7',
    title: 'Una semana',
    description: 'Siete días seguidos de estudio.',
    icon: 'flame',
  },
  {
    id: 'streak_30',
    title: 'Un mes',
    description: 'Treinta días seguidos. Nivel constancia.',
    icon: 'trophy',
  },
  { id: 'xp_100', title: '100 XP', description: 'Alcanzaste 100 XP.', icon: 'sparkle' },
  { id: 'xp_500', title: '500 XP', description: 'Alcanzaste 500 XP.', icon: 'star' },
  { id: 'xp_1000', title: '1000 XP', description: 'Alcanzaste 1000 XP.', icon: 'medal' },
  {
    id: 'perfect_lesson',
    title: 'Lección perfecta',
    description: 'Acertaste todos los ejercicios al primer intento.',
    icon: 'star',
  },
];

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
