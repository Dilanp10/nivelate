# Spec 009 — Aprendizaje adaptativo

> **Estado:** Draft
> **Depende de:** 003 (perfiles con `learning_goal`/`self_level`), 004 (contenido curado), 005 (lesson player), 007 (gamificación)
> **Última actualización:** 2026-08-18

## Contexto

El onboarding (spec 002 + rediseño del polish) pregunta 4 cosas al usuario: nombre, objetivo de aprendizaje (`learning_goal`), nivel autopercibido (`self_level`) y meta diaria. Hoy esas respuestas **se guardan en `profiles` pero no influyen en nada**: todos los usuarios ven las mismas unidades en el mismo orden, con los mismos ejemplos, y sin fase explícita de enseñanza previa a los ejercicios. El wizard es puro formulario sin consecuencia.

Este módulo cierra ese loop: la app enseña primero (teaching cards con audio), después evalúa con ejercicios, y **todo el contenido — ejemplos, orden de unidades, resumen fonético final — se adapta a lo que el usuario dijo en el onboarding**.

## Objetivos

1. **Teaching cards antes de ejercicios**: cada lección arranca con 3-5 cards de teoría (regla o vocabulario) explicadas en español, con ejemplos en inglés y botón 🔊 para escuchar (Web Speech API — ya integrada en `listening`).
2. **Ejemplos contextualizados por `learning_goal`**: cada teaching card y cada ejercicio lleva un tag de contexto (`travel`, `work`, `study`, `entertainment`, `general`). El player selecciona los ítems que matchean el goal del perfil (con fallback a `general`). Estructura idéntica; contenido temático distinto.
3. **Punto de arranque por `self_level`**: el mapa/dashboard arranca en la unidad apropiada al nivel autopercibido. Las unidades saltadas quedan como opcionales de repaso, no bloqueadas.
4. **Pantalla final de pronunciación**: al terminar cada lección, antes del summary de XP, una pantalla con las 5-10 frases clave y su respelling en español (ej. "hello → je-lóu") + 🔊 por frase. Refuerzo pedagógico y valor diferencial para hispanohablantes.

## No-objetivos (fuera de alcance)

- **Personalización on-runtime con LLM**. El currículum sigue siendo curado (ver [[project-ingles-a2-b1]]). Los ejemplos y respellings se escriben a mano en los JSON.
- **Recalcular el nivel automáticamente por performance**. Nada de "test diagnóstico" ni de "subir/bajar de nivel según respuestas". Si el usuario quiere cambiar su nivel autopercibido, se hace desde perfil (no en este módulo — queda para 010+).
- **Speaking practice / grabación de voz**. Solo escucha (TTS via Web Speech API). Fuera del alcance del MVP.
- **IPA formal**. Solo respelling en español (más accesible para el público objetivo). Si más adelante se quiere IPA como opción avanzada, versión posterior.
- **Multi-goal**. Cada usuario tiene UN `learning_goal` a la vez. Cambiar de goal cambia los ejemplos que ve; no hay "mostrar todos los goals" ni mezcla.
- **Unidades bloqueadas por prerequisito**. Las unidades siguen siendo todas navegables — el `self_level` solo elige por cuál arrancar, pero cualquiera puede visitar U1 aunque haya empezado en U3.

## Requisitos funcionales

### FR-001: Nuevo tipo de bloque `teaching_card` en el schema de contenido
Extender `content/units/*.json` para que cada `lesson` opcionalmente contenga un array `teachingCards` **antes** de `exercises`:

```json
{
  "slug": "present-perfect-intro",
  "teachingCards": [
    {
      "key": "u3l1-t1",
      "titleEs": "Cuándo usar el Present Perfect",
      "bodyEs": "Se usa para acciones que empezaron en el pasado y siguen teniendo efecto ahora, o para experiencias de vida sin momento específico.",
      "examples": [
        { "en": "I have visited Paris twice.", "es": "He visitado París dos veces.", "goal": "travel" },
        { "en": "She has worked here for five years.", "es": "Ella trabajó acá durante cinco años.", "goal": "work" },
        { "en": "We have seen that movie.", "es": "Vimos esa película.", "goal": "entertainment" }
      ]
    }
  ],
  "exercises": [ ... ]
}
```

- Tipos correspondientes en `packages/shared/src/content/types.ts` (`TeachingCard`, `TeachingExample`).
- Validación Zod actualizada en `packages/shared/src/content/authoring.ts`.
- Migración de DB: tabla `teaching_cards` con FK a `lessons`, columnas `key`, `title_es`, `body_es`, `sort_order`; tabla `teaching_examples` con FK a `teaching_cards`, columnas `en`, `es`, `goal`.

**Must.**

### FR-002: Tag `goal` en ejercicios existentes
Agregar campo opcional `goal: LearningGoal | null` al payload de cada ejercicio del JSON (top-level de cada exercise, no dentro del payload). Null = agnóstico al goal (aplica a todos). Migración: columna `goal text null` en `exercises`. Re-etiquetar el contenido de U1/U2/U3 (mayormente `general`; algunos ejercicios que ya son claramente de un contexto reciben su tag).

**Must.**

### FR-003: Renderer `TeachingCardScreen` en el player
Nuevo componente en `apps/mobile/src/player/TeachingCard.tsx`:
- Título de la card, cuerpo explicativo en español.
- Lista de ejemplos filtrados por `learning_goal` del perfil (con fallback a `general` si no hay match — nunca queda sin ejemplos).
- Cada ejemplo: frase en inglés grande, traducción en español debajo, botón 🔊 que dispara `speak(en)` (misma API que `ListeningExercise`).
- Botón "Entendido" al pie que avanza a la siguiente card o al primer ejercicio.

**Must.**

### FR-004: Integración de teaching cards en el flujo de lección
En `apps/mobile/src/player/ExerciseRenderer.tsx` (o donde vive el orquestador de lección):
- Al cargar una lección, si tiene `teachingCards`, mostrarlas en orden **antes** del primer ejercicio.
- Progress bar contempla teaching cards + ejercicios (total = suma). Cada card completada avanza el progreso.
- Volver atrás dentro de la lección permite revisar cards ya vistas (sin XP extra por revisitarlas).

**Must.**

### FR-005: Filtro de ejemplos y ejercicios por `learning_goal`
Función pura en `packages/shared/src/player/goal-filter.ts`:
- Input: lista de items (examples o exercises) + `learning_goal` del perfil.
- Output: subconjunto priorizando el goal exacto, completando con `general` si hay menos de N items, ignorando `null` como equivalente a `general`.
- Usar en `TeachingCard` (filtrar `examples`) y en el runtime del player (elegir de un pool de ejercicios cuando haya más ítems disponibles que el objetivo por lección).

**Must.**

### FR-006: Punto de arranque por `self_level` en el dashboard
En `apps/mobile/app/(protected)/index.tsx`:
- Función `getStartingUnit(selfLevel: SelfLevel, units: Unit[]): Unit` con mapping:
  - `zero` → U1
  - `basic` → U1 (mismo — sabe saludos pero necesita el refresh gramatical)
  - `conversational` → U2
  - `intermediate` → U3
- La CTA "Empezar lección" apunta a la primera lección **no completada** de esa unidad de arranque en adelante.
- Las unidades previas al arranque siguen visibles y navegables desde `/progress`, marcadas como "Opcional — repaso".

**Must.**

### FR-007: Pantalla final de pronunciación (`PronunciationSummary`)
Nuevo componente `apps/mobile/src/player/PronunciationSummary.tsx`, mostrado **entre** el último ejercicio y `LessonSummary`:
- Título: "Cómo suena lo que aprendiste".
- Lista de 5-10 frases clave de la lección: por cada una, frase en inglés grande, respelling en español debajo (ej. `hello` → `je-lóu`), botón 🔊.
- Botón "Continuar" al pie que avanza al summary de XP.

Las frases y respellings vienen del contenido curado — nuevo campo opcional `pronunciationHighlights` en cada `lesson` del JSON:

```json
{
  "pronunciationHighlights": [
    { "en": "I have been", "respellingEs": "ái hav bin" },
    { "en": "she's worked", "respellingEs": "shis wérkt" }
  ]
}
```

- Migración: tabla `pronunciation_highlights` con FK a `lessons`, columnas `en`, `respelling_es`, `sort_order`.
- Si una lección no tiene highlights (contenido viejo o simple), la pantalla se salta.

**Must.**

### FR-008: Contenido nuevo — teaching cards + highlights en U1/U2/U3
- Escribir teaching cards para las lecciones existentes (mínimo la primera de cada unidad; ideal todas).
- Escribir `pronunciationHighlights` para al menos las lecciones ya publicadas (U1) y las de U2/U3 cuando el usuario apruebe pedagógicamente.
- Etiquetar con `goal` los ejemplos y ejercicios donde aplique un contexto claro (mucho quedará como `general`).

**Must** (sin contenido nuevo el módulo no se ve).

## Requisitos no funcionales

- **Sin regresiones**: las lecciones existentes sin `teachingCards`/`pronunciationHighlights` siguen funcionando (mostrando solo ejercicios + summary, como hoy).
- **TTS silencioso si no hay Web Speech API**: en navegadores sin soporte, el botón 🔊 queda deshabilitado con tooltip "Audio no disponible en este navegador". No romper la pantalla.
- **Bundle**: sin dependencias nuevas más allá de lo ya usado. TeachingCard y PronunciationSummary son componentes React puros.
- **Advisors** (Supabase): sin nuevas RLS policies problemáticas — las tablas nuevas son públicas de lectura como el resto del contenido.
- **Performance**: precargar teaching cards + highlights junto a la lección (mismo query o adjacent, sin round-trip extra por card).

## Criterios de aceptación

- [ ] AC-001: Un usuario con `learning_goal: 'travel'` en U3L1 ve ejemplos de viaje en las teaching cards (no de trabajo o estudio).
- [ ] AC-002: Un usuario con `learning_goal: 'work'` ve ejemplos de trabajo en la misma lección. Si un ejemplo no tiene versión para `work`, cae al de `general`.
- [ ] AC-003: Un usuario con `self_level: 'intermediate'` ve U3 como CTA principal en el dashboard, con U1/U2 marcadas como "Opcional — repaso" y accesibles desde /progress.
- [ ] AC-004: Un usuario con `self_level: 'zero'` ve U1 como CTA principal.
- [ ] AC-005: Al terminar una lección con `pronunciationHighlights`, aparece la pantalla de pronunciación con respellings y 🔊 funcional; después del "Continuar", se muestra el summary de XP normal.
- [ ] AC-006: Una lección sin `teachingCards` (contenido viejo) sigue funcionando: arranca directo en ejercicios.
- [ ] AC-007: El progress bar de la lección incluye teaching cards en el total (ej. 3 cards + 8 ejercicios = 11 pasos).
- [ ] AC-008: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e` verde.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| El respelling en español es subjetivo y puede sonar mal | Medio | Documentar convención al inicio de `pronunciation-guide.md`. Preferir sonidos que un hispanohablante reconoce; aceptar imprecisión menor sobre precisión IPA. Iterar con feedback. |
| Contenido curado explota en tamaño (cada lección × N goals) | Medio | Solo etiquetar ejemplos donde el contexto **agrega valor**. La mayoría del contenido se queda como `general` y sirve para todos los goals. |
| Usuarios con nivel autopercibido inflado (dicen "intermediate" y arrancan en U3 sin saber presente perfecto) | Medio | Las unidades previas quedan accesibles como repaso. Un botón "¿Muy difícil? Volvé a los básicos" en el header de U3+ para el usuario que arrancó adelantado. |
| Web Speech API con acentos regionales (voz mexicana leyendo inglés) | Bajo | Ya presente en `listening` — usar `SpeechSynthesisUtterance.lang = 'en-US'` explícitamente. |
| Migración de DB requiere backfill si ya hay usuarios con progreso | Bajo | Las tablas nuevas son de contenido, no de user data — se pueblan del seed, no afectan progreso existente. |

## Preguntas abiertas

- [ ] ¿Guardar una convención de respelling documentada en `docs/pronunciation-guide.md`? *Sugerido: sí, evita inconsistencias entre lecciones.*
- [ ] ¿Ofrecer un botón "cambiar mi objetivo/nivel" en Perfil? *Sugerido: sí, pero puede quedar para el módulo 010 (Ajustes). Este módulo asume que se define en onboarding y no cambia.*
- [ ] ¿Los teaching cards otorgan XP? *Sugerido: no. XP se gana con ejercicios (respuesta correcta). Las cards son de exposición, no de evaluación.*
- [ ] ¿Cuántas cards por lección como target? *Sugerido: 3-5. Menos de 3 no vale la pena la fase; más de 5 cansa antes de empezar a practicar.*
