# Spec 005 — Lesson Player

> **Estado:** Draft
> **Depende de:** 004-curriculum-content (contenido + tipos). Se integra con 003 (progreso) cuando exista.
> **Última actualización:** 2026-08-11

## Contexto

El motor que renderiza una lección de principio a fin: es donde el usuario pasa el 90% del tiempo. La UX de este módulo define si Nivelate se siente "no tedioso". Toma el contenido cargado en 004 y lo convierte en una experiencia jugable con feedback inmediato.

## Objetivos

1. **Motor de corrección puro** (`checkAnswer`) en `packages/shared`: dado un ejercicio + la respuesta del usuario, decide correcto/incorrecto. Sin UI, 100% testeable.
2. **7 renderers**, uno por tipo de ejercicio, con UI accesible.
3. **Flujo de lección**: intro → N ejercicios (uno por pantalla) → resumen.
4. **Feedback inmediato**: al responder, saber si acertó y ver una explicación breve en español.
5. **Re-intento sin castigo**: los ejercicios fallados vuelven al final de la cola hasta acertarlos. Sin vidas/corazones.
6. **Resultado de lección**: al terminar, un resumen (aciertos al primer intento, tiempo, XP estimada) y un callback `onLessonComplete` que 003 usará para persistir XP/racha.
7. **Listening con TTS**: los ejercicios `listening` reproducen el `audioText` con `SpeechSynthesis` del navegador.

## No-objetivos (fuera de alcance)

- Persistencia de XP/racha/progreso en la DB (módulo 003). Este módulo **emite** el resultado; 003 lo guarda.
- Repaso espaciado / SRS (módulo 006).
- Modo test cronometrado.
- Reanudar una lección a mitad tras cerrar la app (nice-to-have; si entra, es local con AsyncStorage).
- Selección de voz/idioma del TTS más allá de forzar inglés.

## Requisitos funcionales

### FR-001: Motor de corrección `checkAnswer`
Función pura en `shared`: `checkAnswer(exercise, userAnswer) → { correct: boolean; correctAnswer: string }`. Una implementación por tipo. Normaliza mayúsculas/espacios/puntuación en las respuestas de texto. **Must.**

### FR-002: Renderer por tipo
Un componente por cada uno de los 7 tipos, que recibe el payload tipado y un callback `onAnswer`. Todos accesibles (labels, foco, contraste AA). **Must.**

### FR-003: Pantalla de lección
Ruta `(protected)/lesson/[lessonId]`. Carga la lección + ejercicios ordenados desde Supabase (React Query). Muestra un ejercicio por pantalla con progress bar discreta arriba. **Must.**

### FR-004: Feedback inmediato
Tras responder: banner verde (correcto) o rojo (incorrecto) + la respuesta correcta + explicación en español (si el payload la trae). Botón "Continuar". **Must.**

### FR-005: Cola de re-intento
Ejercicio fallado → vuelve al final de la cola. La lección termina cuando todos se acertaron al menos una vez. Se trackea `firstTryCorrect` por ejercicio para el resumen. **Must.**

### FR-006: Pantalla de resumen
Al terminar: aciertos al primer intento / total, XP estimada, botón "Volver". Dispara `onLessonComplete(result)`. **Must.**

### FR-007: TTS para listening
Botón "▶ Escuchar" que reproduce `audioText` con `SpeechSynthesis`, voz en inglés (`en-US`/`en-GB` si está disponible). Se puede repetir. **Must.**

### FR-008: Estados de carga y error
Loading mientras trae la lección; error claro si falla; empty si la lección no tiene ejercicios. **Must.**

## Requisitos no funcionales

- **Accesibilidad**: navegable con teclado; `Enter` verifica; foco visible; opciones como `radio`/`button` con estado; screen-reader friendly. Contraste AA.
- **Rendimiento**: transición entre ejercicios instantánea (datos ya en memoria). Animaciones sutiles (fade), sin bloquear input.
- **Sin castigo**: nada de countdown, vidas, ni sonidos agresivos.
- **Feedback pedagógico**: explicación breve (≤ 2 oraciones) por default.
- **Offline-friendly**: una vez cargada la lección, completarla no requiere más red (la persistencia del resultado sí, y se maneja en 003/008).

## Criterios de aceptación

- [ ] AC-001: `checkAnswer` cubre los 7 tipos con tests (correcto e incorrecto).
- [ ] AC-002: Normalización de texto: "I Went." acierta contra "i went". 
- [ ] AC-003: La pantalla de lección carga la Unidad 1 L1 y muestra el primer ejercicio.
- [ ] AC-004: Responder correcto muestra feedback verde + explicación; incorrecto muestra rojo + respuesta correcta.
- [ ] AC-005: Un ejercicio fallado reaparece antes de terminar la lección.
- [ ] AC-006: Al terminar, el resumen muestra aciertos al primer intento y dispara `onLessonComplete`.
- [ ] AC-007: El botón de listening reproduce el audio (donde el navegador soporte TTS).
- [ ] AC-008: `pnpm typecheck && pnpm lint && pnpm test` verde; e2e del flujo de una lección.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| `SpeechSynthesis` no disponible / sin voz inglesa en algún browser | Medio | Feature-detect; si no hay TTS, mostrar el texto y avisar. No bloquear el ejercicio. |
| El contenido de la Unidad 1 está `is_published=false` y RLS lo oculta | Alto (dev) | Para probar 005, publicar temporalmente en dev o testear renderers en aislamiento. No publicar a prod sin revisión (T091 de 004). |
| Normalización de texto demasiado laxa/estricta | Medio | Reglas explícitas y testeadas: trim, colapsar espacios, lower, quitar puntuación final. |
| Matching/word_order con muchos ítems en pantallas chicas | Medio | Layout scrolleable; límites de cantidad ya en el schema (matching ≤ 6). |

## Preguntas abiertas

- [ ] ¿Al fallar, se muestra la respuesta correcta inmediatamente o se deja re-intentar en el momento antes de pasar? *Sugerido: mostrar la correcta y mandar el ejercicio al final de la cola (menos frustrante que trabar el avance).*
- [ ] ¿Duración target de lección (~5 min) o libre? *Sugerido: libre en MVP; medir después.*
- [ ] ¿XP por ejercicio fija o pesada por dificultad/tipo? *Sugerido: fija por ejercicio + bonus por lección completa; la fórmula final la define 003/007.*
