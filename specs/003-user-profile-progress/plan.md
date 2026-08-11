# Plan — 003 User Progress

## Arquitectura

```
packages/shared/src/progress/
├── types.ts            # XpEvent, LessonCompletion, CompleteLessonResult
├── level.ts            # levelForXp(totalXp) (puro)
├── streak.ts           # nextStreak(last, today, current) (puro, espeja el SQL)
├── index.ts
└── *.test.ts

apps/mobile/src/
├── hooks/
│   ├── useCompleteLesson.ts   # RPC complete_lesson (useMutation)
│   └── useProgress.ts         # profile counters + % por unidad
└── ...

apps/mobile/app/(protected)/
├── index.tsx           # + widget racha/XP
└── progress.tsx        # pantalla "Mi progreso"

apps/mobile/supabase/migrations/
└── 20260814000000_progress.sql
```

## Orden de implementación

### Fase 1 — Schema + RPC
1. Migración `progress.sql` (enum, xp_events, lesson_completions, columnas en profiles, RLS, RPC `complete_lesson`).
2. Aplicar vía MCP. Advisors (security + performance) → cero. Regenerar tipos.
3. Probar el RPC vía SQL: completar una lección, verificar xp_event + completion + racha + total_xp. Probar que un `first_try_correct > total` es rechazado, y que la XP la fija el server.

### Fase 2 — Lógica pura (shared, con tests)
4. `progress/level.ts` (`levelForXp`) + tests (bordes).
5. `progress/streak.ts` (`nextStreak`) + tests (primer día, consecutivo, corte, mismo día).
6. `progress/types.ts` + `index.ts` + re-export.

### Fase 3 — Hooks + integración con 005
7. `hooks/useCompleteLesson.ts` (RPC).
8. `hooks/useProgress.ts` (counters + % por unidad + global).
9. Enchufar `onLessonComplete` en `(protected)/lesson/[lessonId].tsx`: llamar al RPC; el resumen muestra la XP del server; error + reintento si falla.

### Fase 4 — UI
10. `(protected)/progress.tsx` (nivel + XP + racha + % por unidad + global + empty state).
11. Home: widget racha (🔥) + barra XP del nivel. Link a "Mi progreso".

### Fase 5 — Verificación
12. Con el usuario de prueba: completar una lección, ver XP/racha en resumen y en "Mi progreso".
13. `pnpm typecheck && pnpm lint && pnpm test` verde.
14. Quickstart + PR.

## Decisiones clave (de research.md)

- RPC atómico `complete_lesson`, XP calculada en el server.
- `total_xp`/racha denormalizados en profiles; `xp_events` es la fuente de verdad.
- Racha por fecha UTC (limitación documentada); regla espejada en función pura testeada.
- Nivel de app lineal (100/nivel), distinto del nivel CEFR.
- % global ponderado por lecciones.

## Fuera del plan

- Logros/medallas (007), notificaciones, ligas, tz por usuario.
