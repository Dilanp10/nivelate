# Research — 005 Lesson Player

## R-001: Corrección — lógica pura en shared, no en los componentes

**Decisión:** `checkAnswer(exercise, userAnswer)` vive en `packages/shared/src/player/check-answer.ts`, sin dependencias de React ni de la DB.

**Por qué:**
- Testeable con Vitest sin montar UI.
- Reutilizable: 006 (SRS) también necesita corregir.
- Los renderers quedan "tontos": juntan la respuesta del usuario y llaman `checkAnswer`.

**Forma:**
```ts
type CheckResult = { correct: boolean; correctAnswer: string };
function checkAnswer(ex: { type: ExerciseType; payload: unknown }, answer: UserAnswer): CheckResult;
```
`UserAnswer` es una unión por tipo (índice para MC, string[] para fill, permutación para word_order, etc.).

## R-002: Normalización de respuestas de texto

**Decisión:** para `fill_in_blank`, `translation` y el sub-fill de `listening`, normalizamos antes de comparar:
1. `trim()`
2. colapsar espacios internos a uno
3. `toLowerCase()`
4. quitar puntuación final (`.`, `,`, `!`, `?`, `;`, `:`)
5. quitar comillas tipográficas → rectas

La respuesta del usuario matchea si, normalizada, es igual a alguna de las `answers`/`acceptable` normalizadas.

**Por qué:** un adulto que escribe "I went." no debería fallar contra "i went". No corregimos ortografía interna (eso sería otra feature).

## R-003: Cola de re-intento

**Decisión:** la lección mantiene una **cola** de ejercicios pendientes. Estado por ejercicio: `pending → (falla) vuelve al final | (acierta) done`. Se guarda `firstTryCorrect` la primera vez que se responde.

**Estructura (reducer):**
```ts
type PlayerState = {
  queue: string[];          // exercise ids pendientes, en orden
  current: string;          // id actual
  results: Record<string, { attempts: number; firstTryCorrect: boolean; done: boolean }>;
  phase: 'answering' | 'feedback' | 'summary';
};
```
Acciones: `ANSWER`, `CONTINUE`. Reducer puro y testeable.

**Por qué reducer:** la lógica de "fallado va al final, terminar cuando la cola vacía" es fácil de romper con `useState` suelto; un reducer puro se testea sin UI.

## R-004: TTS con SpeechSynthesis

**Decisión:** wrapper `speak(text, lang='en-US')` en `apps/mobile/src/lib/tts.ts`.
- Feature-detect `window.speechSynthesis`.
- Elegir una voz `en-*` de `getVoices()` si hay; si no, usar la default con `utterance.lang = 'en-US'`.
- En native (iOS/Android) Expo web no aplica; `expo-speech` sería el equivalente, pero como el MVP es PWA priorizamos web. En native sin `expo-speech`, el botón queda deshabilitado con aviso.

**Por qué:** gratis, sin backend, decisión ya tomada del proyecto. `getVoices()` es async en algunos browsers (evento `voiceschanged`) — el wrapper lo maneja.

## R-005: Carga de datos — React Query

**Decisión:** `useLesson(lessonId)` con React Query hace:
```sql
select ... from lessons where id = :id
select ... from exercises where lesson_id = :id order by sort_order
```
Devuelve `{ lesson, exercises }`. `staleTime` alto (el contenido casi no cambia).

**RLS:** recordar que solo se leen ejercicios de unidades `is_published=true`. Para dev con la Unidad 1 en borrador, publicar temporalmente o usar un flag de dev.

## R-006: Componentes — un renderer por tipo + un switch

**Decisión:** `ExerciseRenderer` hace `switch(exercise.type)` y delega a `<MultipleChoiceExercise>`, `<FillInBlankExercise>`, etc. Cada uno recibe `payload` tipado (narrowing por el discriminated union) y `onSubmit(userAnswer)`.

**Estado del input:** local a cada renderer. Al submit, el renderer entrega la `UserAnswer` normalizada al player, que llama `checkAnswer`.

## R-007: Estructura visual de la lección

- **Header**: progress bar (done/total), botón cerrar (X, confirma salida).
- **Body**: el ejercicio actual.
- **Footer**: botón "Verificar" (answering) / "Continuar" (feedback). `Enter` los dispara.
- **Feedback**: banner sobre el footer, verde/rojo, con explicación.

Reusa los componentes UI de 002 (`Button`, `ScreenLayout`) + tokens NativeWind.

## R-008: XP estimada y `onLessonComplete`

**Decisión:** 005 calcula una XP estimada simple (`10 * firstTryCorrect + 5 * (total - firstTryCorrect)` como placeholder) y la pasa en el resultado. La fórmula real y la persistencia son de 003/007.

```ts
type LessonResult = {
  lessonId: string;
  total: number;
  firstTryCorrect: number;
  estimatedXp: number;
};
```
`onLessonComplete(result)` por ahora loguea / navega; 003 lo reemplaza por un insert a `xp_events`.
