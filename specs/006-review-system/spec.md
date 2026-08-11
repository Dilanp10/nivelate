# Spec 006 — Review System (SRS)

> **Estado:** Stub.
> **Depende de:** 003, 004, 005.

## Contexto

Repaso espaciado (Spaced Repetition System). Los ejercicios que ya se hicieron vuelven a aparecer con intervalos crecientes según qué tan bien los recordás. Es lo que hace la diferencia entre "hice un curso" y "aprendí de verdad".

## Objetivos (borrador)

1. Algoritmo SM-2 (SuperMemo 2) o variante simplificada.
2. Tabla `srs_cards` — un card por (`user_id`, `exercise_id`).
3. Cola de repaso diaria: mostrar los cards "due today".
4. Sección "Repaso" en el home — badge con cantidad pendiente.
5. Integración con el player: los repasos usan el mismo motor de 005.
6. Nunca >30 min de repaso por día — cap sobre lo agendado.

## Algoritmo SM-2 simplificado

Cada card guarda:
- `ease_factor` (default 2.5)
- `interval_days` (default 0)
- `repetitions` (default 0)
- `due_date`

Al responder:
- **Bien (2/2 al primer intento):** `interval = interval * ease_factor`, `repetitions++`.
- **Regular (acierta pero con re-intento):** `interval = interval` (no crece), `ease_factor -= 0.15`.
- **Mal (no acierta ni con re-intento):** `interval = 1`, `repetitions = 0`, `ease_factor -= 0.2`.

Cap `ease_factor` en [1.3, 2.5].

## No-objetivos

- SRS ultra-configurable (Anki-style). SM-2 default alcanza para B1.
- Repaso por tema seleccionable (post-MVP — por ahora es global).

## Preguntas abiertas

- [ ] ¿Usamos SM-2 o algo aún más simple (Leitner 5 boxes)?
- [ ] ¿"Días" son días de calendario o "sesiones" (más útil si el usuario no entra todos los días)?
- [ ] ¿Mostramos el intervalo próximo al usuario ("Vuelve en 7 días") o queda opaco?
