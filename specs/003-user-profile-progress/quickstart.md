# Quickstart — 003 User Progress

## Probar el progreso

1. `pnpm --filter mobile web` y logueate (usuario de prueba: `tester@nivelate.local` / `nivelate123`).
2. Completá una lección desde la home.
3. En la pantalla de resumen, la XP mostrada es la que devuelve el server (RPC `complete_lesson`).
4. Entrá a "Mi progreso" (desde la home): deberías ver nivel, XP total, racha y % por unidad.

## Verificar por SQL (opcional)

```sql
-- Eventos de XP del usuario
select source, xp_delta, created_at from xp_events order by created_at desc limit 5;

-- Contadores
select total_xp, current_streak, longest_streak, last_activity_date from profiles;

-- Lecciones completadas
select lesson_id, total, best_first_try_correct, times_completed from lesson_completions;
```

## Verificar

```bash
pnpm typecheck && pnpm lint && pnpm test   # incluye levelForXp + nextStreak
```

## Notas

- La **XP la calcula el server** (RPC). El cliente solo manda conteos; mandar XP falsa no tiene efecto.
- La **racha usa fecha UTC** del server. Un usuario en otra zona horaria puede ver el "día" cambiar a medianoche UTC. Limitación conocida del MVP.
- El **nivel de app** (cada 100 XP) es distinto del **nivel CEFR** (A2→B1). La UI los distingue.
