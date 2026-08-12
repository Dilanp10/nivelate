# Plan — 007 Gamification

## Arquitectura

```
packages/shared/src/achievements/
├── definitions.ts       # ACHIEVEMENTS: Achievement[]
├── evaluate.ts          # evaluateAchievements(state) — puro, espeja el SQL
├── types.ts
├── index.ts
└── evaluate.test.ts

apps/mobile/src/
├── hooks/useAchievements.ts
└── components/AchievementsGrid.tsx

apps/mobile/app/(protected)/
└── progress.tsx         # + sección Logros al final

apps/mobile/src/player/
└── LessonSummary.tsx    # + banner discreto de newly_unlocked

apps/mobile/supabase/migrations/
└── 20260816000000_achievements.sql
```

## Orden

### Fase 1 — SQL
1. Migración: `user_achievements`, función `evaluate_achievements(uuid)` en SQL, reemplazo de `complete_lesson` para llamarla y devolver `newly_unlocked text[]` (agregando esa columna al return type).
2. Advisors → cero (esperados los mismos warnings de siempre por diseño). Regenerar tipos.
3. Probar por SQL: completar lección → newly_unlocked con `first_lesson` (y otros según XP). Repetir → newly_unlocked vacío.

### Fase 2 — Shared (con tests)
4. `types.ts` (Achievement, AchievementId).
5. `definitions.ts` (los 10 logros).
6. `evaluate.ts` — función pura `evaluateAchievements(state)` que espeja el SQL. Sirve para el grid (deriva estado bloqueado/desbloqueado sin round-trip extra) y para tests.
7. Tests: cada logro se desbloquea con el estado esperado, no antes.

### Fase 3 — Cliente
8. `useAchievements()` — trae ids desbloqueados; cruza con `ACHIEVEMENTS`.
9. `AchievementsGrid` — grid 2 columnas, `AchievementCard` (locked vs unlocked).
10. Sección "Logros" al final de `progress.tsx`.
11. Banner de `newly_unlocked` en `LessonSummary` (si viene ≥ 1, mostrar una línea con los títulos).

### Fase 4 — Verificación
12. Con usuario de prueba: completar lección → confirmar `first_lesson` desbloqueado, banner en el resumen, grid en Mi progreso.
13. Suite verde. PR.

## Decisiones (research)

- **Definiciones en código** (no en DB): son estáticas, versionadas, sin migración por edición de texto.
- **SQL es autoridad** para el criterio: el cliente no puede forjar unlocks.
- **Sticky**: una vez desbloqueado, se queda (insert on conflict do nothing).
- **Sin XP-bonus**: evita farmeo, mantiene el tono adulto.

## Fuera del plan

- Toast full-screen, ligas, notificaciones, logros por skill/tema.
