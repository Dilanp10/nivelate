// Estado del usuario que determina qué logros están desbloqueados. Espeja las
// entradas del SQL evaluate_achievements(uuid).
export type AchievementState = {
  totalXp: number;
  currentStreak: number;
  lessonCompletions: number;
  hasPerfectLesson: boolean;
  firstUnitDone: boolean;
};

export type Achievement = {
  id: string;
  title: string; // en español
  description: string; // en español
  // Nombre del ícono del pack `apps/mobile/src/ui/Icon.tsx` (dirección "Tinta editorial").
  // String suelto para no acoplar el paquete shared al pack de la app móvil.
  icon: string;
};

export type AchievementWithStatus = Achievement & { unlocked: boolean };
