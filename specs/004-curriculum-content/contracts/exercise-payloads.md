# Contract — Exercise Payloads

Forma del `payload` JSONB de cada `exercise.type`. Es el contrato entre el **contenido** (004) y el **lesson player** (005). Tipado + validado con Zod en `packages/shared/src/content/exercise-types.ts`.

Convención común: todo payload puede tener `explanation` (string, español) que 005 muestra tras responder.

## `multiple_choice`
```ts
{
  prompt: string;            // la pregunta / consigna (puede tener inglés)
  options: string[];         // 2–5 opciones
  correctIndex: number;      // índice de la correcta (0-based)
  explanation?: string;
}
```

## `fill_in_blank`
El texto se parte en `segments`; entre segmento y segmento va un hueco. `answers[i]` es la respuesta canónica del hueco i; `acceptable[i]` son variantes válidas.
```ts
{
  segments: string[];        // N+1 segmentos para N huecos
  answers: string[];         // N respuestas canónicas
  acceptable?: string[][];   // N listas de variantes aceptadas (opcional)
  bank?: string[];           // si está, el hueco se elige de un banco (dropdown)
  explanation?: string;
}
```
Invariante: `segments.length === answers.length + 1`.

## `matching`
```ts
{
  pairs: { left: string; right: string }[];   // 3–6 pares
  explanation?: string;
}
```
005 baraja las columnas; la respuesta correcta es el emparejamiento original.

## `word_order`
```ts
{
  tokens: string[];          // tokens desordenados a mostrar
  correctOrder: number[];    // permutación de índices que arma la oración correcta
  explanation?: string;
}
```
Invariante: `correctOrder` es una permutación de `[0..tokens.length-1]`.

## `listening`
Reproduce `audioText` con TTS (`SpeechSynthesis`) y adentro trae un sub-ejercicio de comprensión (MC o fill).
```ts
{
  audioText: string;         // texto en inglés a pronunciar
  audioUrl?: string | null;  // reservado para audio pre-generado (futuro)
  sub:
    | { kind: 'multiple_choice'; prompt: string; options: string[]; correctIndex: number }
    | { kind: 'fill_in_blank'; segments: string[]; answers: string[]; acceptable?: string[][] };
  explanation?: string;
}
```

## `translation`
```ts
{
  prompt: string;                     // frase a traducir
  direction: 'en_to_es' | 'es_to_en';
  acceptable: string[];               // 1+ traducciones válidas (case/espacios normalizados por 005)
  explanation?: string;
}
```

## `dialogue`
```ts
{
  turns: { speaker: string; text: string }[];  // el turno en blanco tiene text: ""
  blankTurnIndex: number;                       // índice del turno a completar
  options: string[];                            // opciones para el turno en blanco
  correctIndex: number;
  explanation?: string;
}
```
Invariante: `turns[blankTurnIndex].text === ""` y `correctIndex` es índice válido de `options`.

## Discriminated union

En `packages/shared`:
```ts
export type ExercisePayload =
  | { type: 'multiple_choice'; payload: MultipleChoicePayload }
  | { type: 'fill_in_blank';   payload: FillInBlankPayload }
  | { type: 'matching';        payload: MatchingPayload }
  | { type: 'word_order';      payload: WordOrderPayload }
  | { type: 'listening';       payload: ListeningPayload }
  | { type: 'translation';     payload: TranslationPayload }
  | { type: 'dialogue';        payload: DialoguePayload };
```
Un Zod `discriminatedUnion('type', [...])` valida `{ type, payload }` de una. El loader corre esta validación por cada ejercicio antes de insertar.
