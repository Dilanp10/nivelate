export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const APP_CEFR_RANGE = ['A2', 'B1'] as const satisfies readonly CEFRLevel[];

export type AppCEFRLevel = (typeof APP_CEFR_RANGE)[number];

export const CEFR_LABELS: Record<CEFRLevel, string> = {
  A1: 'Principiante',
  A2: 'Básico',
  B1: 'Intermedio',
  B2: 'Intermedio-alto',
  C1: 'Avanzado',
  C2: 'Dominio',
};
