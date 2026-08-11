# Research — 006 Review System

## R-001: Algoritmo — SM-2 simplificado vs Leitner vs FSRS

**Decisión:** SM-2 simplificado (dos calidades: bien/mal en MVP).

**Por qué:**
- SM-2 es el estándar de facto (Anki, SuperMemo), suficiente para B1.
- La versión de 4 calidades (again/hard/good/easy) requiere UI extra por card; la de 2 es un botón "verificar" que ya existe.
- FSRS es más nuevo/mejor pero mucha maquinaria para MVP.

**Fórmula final (documentada también en spec.md):**
```
correct:  interval = max(1, round(interval * ease))    // 0 → 1 → 3 → 8 → 20 → 50 …
          repetitions += 1
incorrect: interval = 1
           repetitions = 0
           ease = max(1.3, ease - 0.20)
```
`ease` arranca en 2.5, cap `[1.3, 2.5]`.

## R-002: Siembra — en el RPC `complete_lesson` de 003

**Decisión:** modificar `complete_lesson` para que además de xp/completion, haga upsert de `srs_cards` (solo insert on conflict do nothing) para cada ejercicio de la lección.

**Por qué:**
- Un solo lugar de escritura, transacción única.
- `due_at = now() + '1 day'` para que aparezca al día siguiente (no interrumpe la lección de hoy).
- `on conflict do nothing` para no pisar el intervalo si el usuario ya tenía el card.

**Alternativa descartada:** un trigger sobre `lesson_completions`. Más magia; el RPC ya es la fuente de verdad de "completé".

## R-003: `review_card` como RPC — igual que `complete_lesson`

**Decisión:** RPC `review_card(exercise_id, correct) → { interval_days, due_at }`, security definer, atómico.

**Por qué:**
- Mismo argumento que 003: cálculo en el server, cliente solo dice "acerté / erré".
- Un round-trip por card.
- El RPC valida que el card exista para ese usuario.

Alternativa: dejar que el cliente calcule y haga `update`. Mismos problemas de siempre — se corrompe si el cliente miente.

## R-004: Cola de repaso — `useDueCards`

Query:
```sql
select c.*, e.type, e.payload, e.exercise_key
from srs_cards c
join exercises e on e.id = c.exercise_id
join lessons l on l.id = e.lesson_id
join units u on u.id = l.unit_id
where c.user_id = auth.uid()
  and c.due_at <= now()
  and u.is_published = true
order by c.due_at asc
limit 20;
```

- Filtra por unidad publicada (por si se despublica).
- Orden por `due_at` (los más viejos primero).
- Cap de 20.

## R-005: Sesión de repaso — reusar el `LessonRunner` o hacer una propia

**Decisión:** una pantalla propia `ReviewRunner`, más simple, que reusa **los renderers** y `checkAnswer` pero no el reducer de lección (no hay re-intento).

**Por qué:**
- El reducer de 005 fuerza acertar todo antes de terminar. En repaso queremos una única respuesta y avanzar.
- Estados: `answering → feedback → nextOrDone`. Suficiente con `useState`.
- Reusar renderers evita duplicación.

## R-006: Badge en home

`useDueCardCount()` — un `select count(*)` liviano con `head:true`. Si `> 0`, se muestra la card; si `0`, un pill discreto "Al día ✓" (o nada, decidido en la implementación).

## R-007: Ejercicios completos vs vocabulario

**Decisión:** SRS a nivel **ejercicio** (no vocab_items).

**Por qué:**
- El schema de 004 ya tiene `exercises`; una card por ejercicio es directo.
- `vocab_items` va a ser cubierto por otro sistema en un módulo futuro si se hace flashcards puras de vocabulario.
- Cada `exercise` ya tiene su feedback pedagógico (explicación en payload), no hace falta reinventar.

## R-008: Interacción con módulo 007 (gamificación)

XP por repaso: el RPC `review_card` **no** otorga XP en MVP (repasar es su propio incentivo, y no queremos incentivar farmeo). 007 puede introducir XP por racha de repaso si aparece la demanda.
