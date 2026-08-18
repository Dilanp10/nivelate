# Contract — Lesson Content (extensión)

Este módulo extiende el contrato de contenido de 004 con **3 estructuras nuevas** en el JSON de cada lección y **1 campo nuevo** por ejercicio. Tipado + validado con Zod en `packages/shared/src/content/authoring.ts`.

Todo lo agregado es **opcional** — una lección puede tener solo `exercises` (como hoy) o cualquier combinación de las secciones nuevas.

## `teachingCards` (opcional, dentro de cada `lesson`)

Array de cards que se muestran al usuario **antes** de los ejercicios de la lección.

```ts
{
  key: string;              // slug único dentro de la lección (ej. "u3l1-t1")
  titleEs: string;          // título de la card en español
  bodyEs: string;           // explicación de la regla/vocabulario en español
  examples: TeachingExample[];  // 2-5 ejemplos, ver abajo
}
```

**Invariantes:**
- `key` único por lección.
- `examples.length >= 1`.
- Se recomienda 3-5 teaching cards por lección (más de 5 cansa antes de practicar).

### `TeachingExample`
```ts
{
  en: string;                     // frase en inglés (la que se pronuncia con 🔊)
  es: string;                     // traducción en español
  goal?: LearningGoal | null;     // travel | work | study | entertainment | general | null
}
```

**Semántica del `goal`:**
- `undefined` / `null` = agnóstico (aplica a todos los goals).
- `'general'` = idem (aceptable para todos).
- Cualquier otro valor = solo se muestra a usuarios cuyo `profile.learning_goal` matchea, o como fallback si el pool queda chico.

## `goal` en cada `exercise` (opcional)

Nuevo campo top-level de cada ejercicio en el JSON. Misma semántica que en `TeachingExample`.

```ts
{
  key: "u3l1-e5",
  type: "multiple_choice",
  goal: "travel",             // ← nuevo, opcional
  payload: { ... }
}
```

Si un ejercicio no tiene `goal`, se muestra a todos.

## `pronunciationHighlights` (opcional, dentro de cada `lesson`)

Array de frases clave de la lección con su respelling en español. Se muestran en la pantalla `PronunciationSummary` **entre** el último ejercicio y el `LessonSummary` (XP).

```ts
{
  en: string;              // frase o palabra en inglés
  respellingEs: string;    // respelling siguiendo docs/pronunciation-guide.md
}
```

**Ejemplo:**
```json
[
  { "en": "I have been to Paris", "respellingEs": "ái hav bin tu páris" },
  { "en": "she's worked here", "respellingEs": "shis wérkt jíer" },
  { "en": "thought", "respellingEs": "zot" }
]
```

**Invariantes:**
- Si el array existe, `length >= 1` y `length <= 10`.
- Si no existe (o está vacío), la pantalla `PronunciationSummary` se salta y se va directo al summary de XP.
- El respelling debe seguir la convención documentada en `docs/pronunciation-guide.md`.

## Ejemplo completo de lección con las 3 secciones

```json
{
  "slug": "present-perfect-experiences",
  "title": "Present Perfect — Experiencias de vida",
  "grammarTopicSlugs": ["present-perfect"],
  "teachingCards": [
    {
      "key": "u3l1-t1",
      "titleEs": "Cuándo usar el Present Perfect",
      "bodyEs": "Se usa para experiencias de vida sin momento específico. 'Have you ever...' es la fórmula clásica.",
      "examples": [
        { "en": "I have visited Paris twice.", "es": "Visité París dos veces.", "goal": "travel" },
        { "en": "She has worked in three companies.", "es": "Trabajó en tres empresas.", "goal": "work" },
        { "en": "Have you ever seen this movie?", "es": "¿Alguna vez viste esta película?", "goal": "entertainment" },
        { "en": "We have studied French for years.", "es": "Estudiamos francés durante años.", "goal": "study" },
        { "en": "I have never tried sushi.", "es": "Nunca probé sushi.", "goal": "general" }
      ]
    }
  ],
  "exercises": [
    {
      "key": "u3l1-e1",
      "type": "multiple_choice",
      "goal": "travel",
      "payload": {
        "prompt": "___ you ever ___ to Japan?",
        "options": ["Did / go", "Have / been", "Do / go"],
        "correctIndex": 1,
        "explanation": "Present perfect para experiencias sin tiempo específico."
      }
    }
  ],
  "pronunciationHighlights": [
    { "en": "have visited", "respellingEs": "jav vísited" },
    { "en": "ever", "respellingEs": "éver" },
    { "en": "thought", "respellingEs": "zot" }
  ]
}
```

## Validación (Zod)

Actualizar `packages/shared/src/content/authoring.ts`:

```ts
const teachingExampleSchema = z.object({
  en: z.string().min(1),
  es: z.string().min(1),
  goal: z.enum(LEARNING_GOAL_OPTIONS).nullish(),
});

const teachingCardSchema = z.object({
  key: z.string().min(1),
  titleEs: z.string().min(1),
  bodyEs: z.string().min(1),
  examples: z.array(teachingExampleSchema).min(1),
});

const pronunciationHighlightSchema = z.object({
  en: z.string().min(1),
  respellingEs: z.string().min(1),
});

// En lessonSchema, agregar:
teachingCards: z.array(teachingCardSchema).optional(),
pronunciationHighlights: z.array(pronunciationHighlightSchema).min(1).max(10).optional(),

// En exerciseSchema, agregar:
goal: z.enum(LEARNING_GOAL_OPTIONS).nullish(),
```

Sin breaking changes en las lecciones existentes (todo opcional).
