// Nivel de app derivado de la XP total. Fórmula MVP: lineal, 100 XP por nivel.
// OJO: este "nivel de app" es gamificación, distinto del nivel CEFR (A2→B1).

export const XP_PER_LEVEL = 100;

export type LevelInfo = {
  level: number; // arranca en 1
  xpIntoLevel: number; // XP dentro del nivel actual [0, XP_PER_LEVEL)
  xpForNextLevel: number; // XP total del nivel (constante en la fórmula lineal)
  progress: number; // [0, 1] hacia el próximo nivel
};

export function levelForXp(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXp));
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    progress: xpIntoLevel / XP_PER_LEVEL,
  };
}
