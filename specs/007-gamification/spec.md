# Spec 007 — Gamification (mínima adulta)

> **Estado:** Draft
> **Depende de:** 003 (progreso).
> **Última actualización:** 2026-08-11

## Contexto

Cerrar la parte de retención con **logros discretos adultos**. Sin mascotas, sin ligas, sin corazones. La racha, XP y % ya existen (003); esto agrega **medallas discretas** que se desbloquean al pasar hitos objetivos (racha, XP, lecciones, unidades) y un lugar donde verlas.

## Objetivos

1. **Definiciones estáticas en código** (`packages/shared/src/achievements/`): id, título ES, descripción, emoji, condición.
2. **Tabla `user_achievements`** en la DB — solo (user_id, achievement_id, unlocked_at).
3. **Unlock automático** dentro del RPC `complete_lesson`: tras actualizar XP/racha, chequea qué logros nuevos aplican y los inserta.
4. **`newly_unlocked`** en la respuesta del RPC — el player puede mostrar "🏅 Logro desbloqueado" al terminar una lección.
5. **Grid de logros** en `/(protected)/progress` — desbloqueados a color, bloqueados con silueta.
6. **Sin cambios de tono** en la UI — logros discretos, texto en español, sin celebraciones exageradas.

## Set inicial de logros (10)

| ID | Título | Condición |
|---|---|---|
| `first_lesson` | Primera lección | 1 lesson completion |
| `five_lessons` | Cinco lecciones | 5 lesson completions |
| `first_unit` | Primera unidad | 1 unit con todas las lessons completadas |
| `streak_3` | Tres días seguidos | current_streak ≥ 3 |
| `streak_7` | Una semana | current_streak ≥ 7 |
| `streak_30` | Un mes de racha | current_streak ≥ 30 |
| `xp_100` | 100 XP | total_xp ≥ 100 |
| `xp_500` | 500 XP | total_xp ≥ 500 |
| `xp_1000` | 1000 XP | total_xp ≥ 1000 |
| `perfect_lesson` | Lección perfecta | 1 lesson_completion con `best_first_try_correct == total` |

Todas evaluables desde SQL con reads baratos.

## No-objetivos

- Logros por skill (reading/listening) individual.
- Logros dinámicos "de temporada" o eventos limitados.
- XP-bonus al desbloquear (evita farmear).
- Notificaciones push.
- Compartir logros en redes.
- Toast/modal de celebración full-screen (queda solo un banner discreto en el resumen de lección).

## Requisitos funcionales

### FR-001: Definiciones en shared
`achievements/definitions.ts` exporta `ACHIEVEMENTS: Achievement[]` con id, title, description, emoji, condition. Puramente cliente-visible; el server chequea por id conocidos. **Must.**

### FR-002: Tabla `user_achievements`
`(user_id, achievement_id text) PK`, `unlocked_at`. RLS: lectura propia. **Must.**

### FR-003: Función `evaluate_achievements(user)` en SQL
Devuelve `text[]` con los ids de todos los logros que **deberían estar** desbloqueados según el estado actual del usuario (query sobre profiles/lesson_completions/units/lessons). Idempotente. **Must.**

### FR-004: Unlock en `complete_lesson`
Al final del RPC:
- Llama `evaluate_achievements(v_user)` → lista de ids.
- Inserta los que no están (`on conflict do nothing`).
- Devuelve `newly_unlocked text[]` en la respuesta del RPC.

**Must.**

### FR-005: Toast/banner de logro en el resumen de lección
Si `newly_unlocked` viene con ids, mostrar bajo la XP: "🏅 Desbloqueaste: {título}, {título}". Discreto, sin overlay. **Should.**

### FR-006: Grid en "Mi progreso"
Sección "Logros" con `AchievementCard` por cada definición. Bloqueado: silueta gris con "?"; desbloqueado: emoji + título en color. **Must.**

### FR-007: Hook `useAchievements`
Trae `user_achievements` del usuario y los cruza con `ACHIEVEMENTS` para renderizar. **Must.**

## Requisitos no funcionales

- **Server-side**: los criterios se evalúan en SQL. El cliente no puede forjar logros.
- **Idempotencia**: `insert on conflict do nothing` asegura que reejecutar no rompe nada.
- **Performance**: `evaluate_achievements` corre solo dentro de `complete_lesson`, no en cada render. La lectura del grid es un `select` chato con RLS.
- **Advisors** en cero.

## Criterios de aceptación

- [ ] AC-001: Al completar la primera lección se desbloquean `first_lesson` y `xp_100` (si aplica); ambos aparecen en `newly_unlocked`.
- [ ] AC-002: Un logro ya desbloqueado no reaparece en `newly_unlocked` en la próxima lección.
- [ ] AC-003: `perfect_lesson` se desbloquea solo si `best_first_try_correct == total` en al menos una completion.
- [ ] AC-004: `first_unit` solo aparece cuando todas las lecciones de una unidad publicada están completas.
- [ ] AC-005: El grid en "Mi progreso" muestra los 10 logros; los desbloqueados a color, el resto silueta.
- [ ] AC-006: Advisors en cero.
- [ ] AC-007: `pnpm typecheck && pnpm lint && pnpm test` verde con tests de la función pura `evaluateAchievements` (espejo del SQL).

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Definiciones y SQL divergen (agregás un logro solo en shared) | Medio | Un logro nuevo requiere PR con ambos: la definición y la lógica en `evaluate_achievements`. Documentado en CLAUDE.md. |
| Un logro se "desbloquea" y luego el criterio deja de cumplirse (racha rota) | Bajo | Los logros son sticky: una vez desbloqueados, no se "vuelven a bloquear" — el insert-on-conflict-do-nothing garantiza eso. |
| Farmeo de XP para desbloquear | Bajo | Los logros no dan XP-bonus. Farmear XP sigue siendo posible pero sin beneficio extra. |
| El grid crece a 30+ logros | Bajo | El componente scrollea; se puede agrupar por categoría cuando pase de N. |

## Preguntas abiertas

- [ ] ¿Toast de logro discreto en el resumen, o esconderlo detrás de un "1 nuevo logro" clickeable? *Sugerido: discreto abajo del resumen, texto una línea.*
- [ ] ¿Empty state del grid antes del primer logro? *Sí: "Empezá a completar lecciones y aparecerán logros acá."*
