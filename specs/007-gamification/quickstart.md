# Quickstart — 007 Gamification

## Probar logros

1. `pnpm --filter mobile web`, login con el usuario de prueba.
2. Completá la lección de la Unidad 1.
3. En el resumen de lección debería aparecer: **"🏅 Desbloqueaste: Primera lección, 100 XP"** (o los que correspondan según tu XP total).
4. Volvé a la home → **Mi progreso** → al final ves el grid de **Logros** (desbloqueados a color, resto silueta).

## Set inicial

10 logros basados en hitos objetivos (racha, XP, lecciones, unidades). Ver `packages/shared/src/achievements/definitions.ts`.

## Verificar

```bash
pnpm typecheck && pnpm lint && pnpm test   # incluye evaluateAchievements
```

## Notas

- **Server-side**: el desbloqueo lo hace SQL dentro de `complete_lesson`. El cliente no puede forjar logros.
- **Sticky**: una vez desbloqueado, se queda.
- **Sin XP-bonus** por desbloquear (evita farmeo).
- Agregar un logro nuevo requiere PR con ambos: la definición en `shared` **y** la lógica en `evaluate_achievements(uuid)` del SQL.
