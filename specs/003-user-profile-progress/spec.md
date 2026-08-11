# Spec 003 — User Progress (XP, racha, avance)

> **Estado:** Draft
> **Depende de:** 002-auth (profiles), 004-curriculum (units/lessons), 005-lesson-player (emite el resultado).
> **Última actualización:** 2026-08-11

## Contexto

Hoy completar una lección no deja rastro: el `onLessonComplete` de 005 está stubeado. Este módulo persiste el progreso — XP, racha diaria, lecciones completadas — y lo muestra en una pantalla "Mi progreso". Es lo que convierte "hice ejercicios" en "estoy avanzando de A2 a B1".

## Objetivos

1. **Log inmutable de XP** (`xp_events`): cada evento que otorga XP queda registrado.
2. **Lecciones completadas** (`lesson_completions`): una fila por usuario+lección, con el mejor resultado.
3. **Racha diaria**: días consecutivos con al menos una lección completada.
4. **Contadores denormalizados** en `profiles`: `total_xp`, `current_streak`, `longest_streak`, `last_activity_date`.
5. **RPC atómico `complete_lesson`**: inserta el evento, upsertea la completion, actualiza racha y XP en una sola transacción, con la XP **calculada en el server**.
6. **Nivel de app** derivado de la XP (fórmula pura en `shared`, distinto del nivel CEFR).
7. **Pantalla "Mi progreso"**: nivel, XP, racha (actual y mejor), % de avance por unidad y global A2→B1.
8. **Widget en la home**: racha + barra de XP del nivel actual.
9. **Integración con 005**: `onLessonComplete` llama al RPC.

## No-objetivos (fuera de alcance)

- Logros/medallas (módulo 007).
- Ligas / comparación social.
- Nivel por skill (reading/listening/writing por separado): en MVP el nivel de app es único.
- Notificaciones push de racha (post-MVP; en PWA es irregular).
- "Congelar" racha pagando XP (post-MVP).
- Zonas horarias por usuario: la racha usa la fecha UTC del server (limitación documentada).

## Requisitos funcionales

### FR-001: `xp_events` inmutable
Tabla append-only: `user_id`, `source` (enum), `xp_delta`, `lesson_id` (nullable), `created_at`. El usuario solo puede leer los propios. **Must.**

### FR-002: `lesson_completions`
Una fila por (`user_id`, `lesson_id`): `total`, `best_first_try_correct`, `times_completed`, `first_completed_at`, `last_completed_at`. **Must.**

### FR-003: Contadores en `profiles`
Agregar `total_xp int`, `current_streak int`, `longest_streak int`, `last_activity_date date`. **Must.**

### FR-004: RPC `complete_lesson`
`complete_lesson(p_lesson_id uuid, p_total int, p_first_try_correct int)`:
- Valida sesión (`auth.uid()`), y que `0 ≤ p_first_try_correct ≤ p_total`.
- **Calcula la XP en el server** (`10 * firstTry + 5 * (total - firstTry)`), ignora cualquier XP del cliente.
- Inserta `xp_events`, upsertea `lesson_completions` (guarda el mejor `first_try_correct`), actualiza racha y `total_xp`.
- Devuelve `{ xp_awarded, new_total_xp, current_streak }`.
- `security definer`, `search_path=''`, con `EXECUTE` revocado de `public`/`anon` y otorgado solo a `authenticated`.

**Must.**

### FR-005: Regla de racha
Al completar una lección:
- Si `last_activity_date = hoy`: la racha no cambia.
- Si `last_activity_date = ayer`: `current_streak += 1`.
- Si no (o es NULL): `current_streak = 1`.
- Actualizar `last_activity_date = hoy` y `longest_streak = max(longest, current)`.

La lógica vive en el RPC (SQL) y también como función pura testeada en `shared` (documenta y valida la regla).

**Must.**

### FR-006: Nivel de app desde XP
`levelForXp(totalXp)` en `shared` → `{ level, xpIntoLevel, xpForNextLevel }`. Fórmula MVP: 100 XP por nivel, lineal. Con tests. **Must.**

### FR-007: Pantalla "Mi progreso"
`(protected)/progress`: nivel + barra de XP, racha actual y mejor, y por cada unidad publicada el % de lecciones completadas, más un % global A2→B1. Empty state si nunca completó nada. **Must.**

### FR-008: Widget en la home
Racha (🔥 N días) + barra de XP del nivel actual. **Should.**

### FR-009: Integración con 005
`onLessonComplete(result)` llama `supabase.rpc('complete_lesson', ...)` con `lessonId`, `total`, `firstTryCorrect`. En éxito, refresca el progreso y la racha. Si falla la red, el resultado no se pierde en silencio: se avisa y se puede reintentar. **Must.**

## Requisitos no funcionales

- **Atomicidad**: todo el efecto de completar una lección ocurre en una transacción (el RPC). Nada de estados a medias.
- **Seguridad**: la XP la calcula el server; el cliente no puede inflar XP. RLS: cada quien ve solo su progreso. Advisors en cero.
- **Idempotencia razonable**: completar la misma lección dos veces suma XP de nuevo (relecturas dan XP), pero `lesson_completions` guarda el mejor `first_try_correct` y cuenta `times_completed`. (Decisión: repetir da XP; si se vuelve farmeable, se ajusta en 007.)
- **Performance**: índices en `xp_events(user_id, created_at)` y `lesson_completions(user_id)`.

## Criterios de aceptación

- [ ] AC-001: Completar una lección inserta un `xp_events` y una `lesson_completions`, y sube `total_xp`.
- [ ] AC-002: La XP guardada es la calculada por el server, no la del cliente (probado mandando una XP falsa).
- [ ] AC-003: Racha: primer día = 1; completar al día siguiente = 2; saltarse un día resetea a 1.
- [ ] AC-004: `levelForXp` cubre bordes (0 XP = nivel 1; límites de nivel) con tests.
- [ ] AC-005: "Mi progreso" muestra nivel, XP, racha y % por unidad reales.
- [ ] AC-006: Empty state cuando no hay progreso.
- [ ] AC-007: Advisors de seguridad y performance en cero.
- [ ] AC-008: `pnpm typecheck && pnpm lint && pnpm test` verde.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Cliente mandando XP inflada | Alto | El RPC calcula la XP; el cliente solo manda conteos, validados (`0≤firstTry≤total`). |
| Racha mal calculada por timezone | Medio | MVP usa fecha UTC del server. Documentado. Migrar a tz por usuario post-MVP. |
| Drift entre `total_xp` denormalizado y `sum(xp_events)` | Medio | Solo el RPC escribe ambos, en la misma transacción. Un check opcional puede reconciliar. |
| Repetir lección para farmear XP | Bajo | Aceptado en MVP; `times_completed` lo hace visible; 007 puede capar. |

## Preguntas abiertas

- [ ] ¿Fórmula de nivel lineal (100/nivel) o curva creciente? *Sugerido: lineal en MVP, fácil de entender; se cambia sin migración (es cálculo).*
- [ ] ¿Repetir lección debe dar XP completa, reducida o cero? *Sugerido: completa en MVP; reevaluar con datos.*
- [ ] ¿El % global A2→B1 pesa todas las unidades igual o por cantidad de lecciones? *Sugerido: por lecciones (más justo).*
