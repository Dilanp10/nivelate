# Spec 006 — Review System (SRS)

> **Estado:** Draft
> **Depende de:** 003 (progreso), 004 (contenido), 005 (player).
> **Última actualización:** 2026-08-11

## Contexto

Sin repaso, lo aprendido se olvida. Este módulo agrega repaso espaciado (SRS): cada ejercicio hecho se convierte en un card con intervalo creciente; el usuario ve cada día una cola de "cards due" y los repite hasta acertar. Es la diferencia entre "hice el curso" y "aprendí de verdad".

Reutiliza el motor y los renderers de 005 (nada nuevo del lado del render). El aporte de 006 es la **cola de repaso** y el **algoritmo SM-2 simplificado** que decide cuándo vuelve cada ejercicio.

## Objetivos

1. **Tabla `srs_cards`** — una por (`user_id`, `exercise_id`).
2. **Siembra automática al completar lección** — el RPC `complete_lesson` crea/actualiza los cards de los ejercicios de esa lección.
3. **Algoritmo SM-2 simplificado** (regla en SQL + espejo puro en `shared` con tests).
4. **Cola de repaso** — cards `due_at ≤ now()` para el usuario, ordenados.
5. **Pantalla `/review`** — reusa el player: por cada card muestra el ejercicio, corrige, y aplica el algoritmo.
6. **Badge en home** — "N cards para repasar hoy" que linkea a `/review`.
7. **Cap diario opcional** — máximo N cards por sesión de repaso (default 20) para no abrumar.

## No-objetivos

- SRS ultra-configurable tipo Anki (intervalos, ease manual). SM-2 default alcanza para B1.
- "Congelar" cards.
- Reprogramar por tema/tag específico (post-MVP; por ahora es global).
- Notificaciones push de repaso pendiente (post-MVP; PWA en iOS es irregular).

## Algoritmo — SM-2 simplificado

Cada card:
- `ease_factor` (default 2.5, min 1.3, max 2.5)
- `interval_days` (default 0)
- `repetitions` (default 0)
- `due_at` (default `now()`)

Al responder un card en una sesión de repaso:

| Calidad | Regla |
|---------|-------|
| **Bien** (acertó al primer intento) | `interval = max(1, interval * ease)`, `repetitions++` |
| **Regular** (acertó tras re-intento) | `interval = max(1, interval)`, `ease -= 0.15` |
| **Mal** (no acertó ni con re-intento) | `interval = 1`, `repetitions = 0`, `ease -= 0.20` |

`ease` se cap-ea en `[1.3, 2.5]`. `due_at = now() + interval_days`.

Nota: en 005 el player fuerza acertar todos los ejercicios (fallar reencola). En un card de repaso interpretamos:
- **Bien** = acertó al primer intento del card (una única respuesta).
- **Regular** = acertó al segundo intento (usó "mostrar respuesta" / re-intento).
- **Mal** = pidió ver la respuesta / marcó "no lo sabía".

Para MVP, la sesión de repaso es más simple: **una sola respuesta por card** (sin re-intento). Correcto/incorrecto. Sin castigo por fallar más allá del reset del intervalo. Esto colapsa a 2 casos (Bien / Mal) y sigue siendo SM-2 válido.

## Requisitos funcionales

### FR-001: Tabla `srs_cards`
`(user_id, exercise_id)` PK. Campos: `ease_factor`, `interval_days`, `repetitions`, `due_at`, `last_reviewed_at`. RLS: cada quien lee/actualiza los propios (updates solo vía RPC). **Must.**

### FR-002: Siembra en `complete_lesson`
El RPC de 003 crea/actualiza cards para los ejercicios de la lección: si no existe, se crea con defaults y `due_at = now() + 1 day`; si existe, no toca (el repaso los actualiza por su cuenta). **Must.**

### FR-003: RPC `review_card`
`review_card(p_card_id (user, exercise), p_correct bool) → { new_interval, new_due_at }`. Aplica SM-2 y persiste. Security definer, EXECUTE a authenticated. **Must.**

### FR-004: Cola de repaso
`useDueCards()` — trae hasta N (default 20) cards con `due_at ≤ now()` para el usuario, con su ejercicio asociado (join a `exercises`, filtrando `is_published`). **Must.**

### FR-005: Pantalla `/(protected)/review`
Reusa el player: por cada card renderiza el ejercicio, al responder llama al RPC y avanza al siguiente. Muestra progreso y resumen al final (aciertos, cuánto crece el intervalo promedio). **Must.**

### FR-006: Badge en home
Card "🔁 Tenés N para repasar" que linkea a `/review`. Si no hay cards due, no aparece (o muestra "Al día ✓"). **Must.**

### FR-007: Cap diario
Sesión de repaso trae **hasta 20 cards**. Si hay más, quedan para mañana. **Should.**

## Requisitos no funcionales

- **Atomicidad** en el review: cada `review_card` corre en una transacción.
- **Idempotencia razonable**: si el usuario responde el mismo card dos veces en la misma sesión (network glitch), el segundo `review_card` aplica sobre el estado ya movido — aceptable, el cliente evita el double-tap con `isPending`.
- **Performance**: índice `(user_id, due_at)` para la cola.
- **Seguridad**: advisors en cero.

## Criterios de aceptación

- [ ] AC-001: Completar una lección crea cards para sus ejercicios con `due_at ≈ now() + 1 día`.
- [ ] AC-002: `review_card(correct=true)` con card nuevo → `interval=1`, `repetitions=1`, `due_at ≈ now() + 1d`.
- [ ] AC-003: 2ª respuesta correcta → `interval = 1 * 2.5 = 2.5 → 3 días` (redondeo hacia arriba), `repetitions=2`.
- [ ] AC-004: Respuesta incorrecta → `interval=1`, `repetitions=0`, `ease-=0.20` (min 1.3).
- [ ] AC-005: `/review` toma cards due, corre 005 sobre ellos, y muestra resumen al final.
- [ ] AC-006: Badge de home aparece cuando hay cards due y desaparece cuando la cola queda vacía.
- [ ] AC-007: Advisors seguridad+performance en cero.
- [ ] AC-008: `pnpm typecheck && pnpm lint && pnpm test` verde con tests de SM-2.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Cola de repaso mata la motivación (muchos cards) | Medio | Cap diario (20). Si sobra, mañana. |
| Ejercicio de una unidad despublicada aparece en repaso | Bajo | Query filtra por `units.is_published`. |
| SM-2 en cliente y en SQL se desincronizan | Medio | SQL es autoridad; función pura en `shared` está testeada para documentar y para display optimista. |
| RPC review con card inexistente | Bajo | Validación en el RPC. |

## Preguntas abiertas

- [ ] ¿Sesión de repaso con re-intento (2ª chance antes de resetear) o una sola respuesta? *Elegido MVP: una sola.*
- [ ] ¿Sembrar cards al completar (elegido) o solo al aprobar la lección (>= 70% al primer intento)? *Sembrar siempre: repasar lo que costó también sirve.*
- [ ] ¿Cap diario 20 fijo o configurable? *20 default MVP; a settings después.*
