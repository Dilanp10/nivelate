# Research — 003 User Progress

## R-001: Completar lección — RPC atómico vs. múltiples calls del cliente

**Decisión:** un RPC de Postgres `complete_lesson`, `security definer`.

**Por qué:**
- **Atomicidad**: insertar xp_event + upsert completion + actualizar racha/XP debe ser todo o nada. Desde el cliente serían 3-4 calls sin transacción → estados a medias ante fallo de red.
- **Seguridad**: la XP la calcula el server. Si el cliente mandara la XP, podría inflarla. El cliente solo manda conteos (`total`, `firstTryCorrect`) que el RPC valida.
- **Menos round-trips**: una llamada en vez de varias.

**Alternativa descartada:** hacerlo en el cliente con varias mutations. Inseguro y no atómico.

## R-002: `total_xp` denormalizado vs. `sum(xp_events)`

**Decisión:** denormalizar `total_xp` (y racha) en `profiles`, actualizado por el RPC en la misma transacción que inserta el evento.

**Por qué:**
- Leer el total y la racha es lo más frecuente (home + progreso). `sum()` sobre xp_events en cada render escala mal.
- El único escritor es el RPC, en transacción → no hay drift.

**Fuente de verdad:** `xp_events` es el log inmutable; `profiles.total_xp` es un cache derivado. Un job de reconciliación puede recomputar si hiciera falta (no en MVP).

## R-003: Regla de racha y timezone

**Decisión:** racha por **fecha UTC del server** (`current_date` en el RPC).

**Regla:** al completar,
- `last = hoy` → sin cambios.
- `last = ayer` → +1.
- otro / null → 1.
Actualiza `last_activity_date = hoy`, `longest = max(longest, current)`.

**Limitación:** un usuario en UTC-3 que juega a las 22h podría ver el "día" cambiar a medianoche UTC (21h local). Para MVP es aceptable. Post-MVP: guardar la tz del usuario y calcular con ella.

**Doble implementación:** la regla vive en el RPC (SQL, autoridad) y como función pura `nextStreak(last, today, current)` en `shared`, testeada. La función pura documenta la regla y sirve para display optimista; la autoridad es el RPC.

## R-004: Nivel de app — fórmula

**Decisión:** lineal, 100 XP por nivel, en `shared`.

```ts
levelForXp(totalXp) → { level, xpIntoLevel, xpForNextLevel }
// level = floor(totalXp / 100) + 1
// xpIntoLevel = totalXp % 100
// xpForNextLevel = 100
```

**Por qué lineal:** predecible y fácil de comunicar ("cada 100 XP subís de nivel"). Es cálculo puro, no está en la DB, así que cambiar a una curva después no requiere migración.

**Nota:** este "nivel de app" es un número de gamificación, **distinto del nivel CEFR** (A2→B1). En la UI se distingue claramente para no confundir.

## R-005: % de avance por unidad y global

**Decisión:**
- Por unidad: `lecciones_completadas / lecciones_totales` de la unidad (una lección cuenta como completada si existe fila en `lesson_completions`).
- Global A2→B1: `sum(completadas) / sum(totales)` sobre todas las unidades publicadas — pondera por cantidad de lecciones (una unidad con más lecciones pesa más). Más justo que promediar porcentajes.

**Query:** join `units → lessons` left join `lesson_completions` filtrando por `user_id`, agrupar por unidad.

## R-006: Repetir lección

**Decisión (MVP):** repetir una lección **da XP de nuevo** e incrementa `times_completed`; `best_first_try_correct` guarda el mejor.

**Por qué:** repasar es bueno; premiar el repaso no es malo. Si aparece farmeo, 007 (gamificación) puede introducir XP decreciente por repetición. `times_completed` deja el dato visible para decidir con evidencia.

## R-007: Integración con 005

`onLessonComplete(result)` (hoy stub) pasa a llamar `useCompleteLesson().mutate({ lessonId, total, firstTryCorrect })`, que invoca el RPC. La pantalla de resumen muestra la XP **que devuelve el server** (no la estimada localmente). Si el RPC falla, se muestra el error y un botón de reintento; el usuario no pierde el resultado en silencio.

La XP "estimada" que 005 calculaba (`summarize`) queda solo como preview; la oficial es la del RPC.
