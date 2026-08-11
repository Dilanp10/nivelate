# Spec 004 — Curriculum & Content

> **Estado:** Draft
> **Depende de:** 001-project-bootstrap, 002-auth
> **Última actualización:** 2026-08-11

## Contexto

El **corazón pedagógico** de Nivelate. Define el modelo de datos del contenido educativo (unidades → lecciones → ejercicios) y el formato de autoría con el que un humano escribe el currículum curado A2→B1 siguiendo CEFR.

Este módulo NO implementa la UI que renderiza los ejercicios (eso es 005-lesson-player) ni el tracking de progreso del usuario (003). Sí define la estructura de **todos** los tipos de ejercicio que 005 va a saber renderizar, y entrega una **Unidad 1 de proof-of-concept** para poder construir y probar 005 sobre datos reales.

## Objetivos

1. **Modelo de datos del contenido**: `units`, `lessons`, `exercises`, `vocab_items`, `grammar_topics`.
2. **RLS de solo-lectura pública**: todo usuario autenticado ve el mismo currículum. El contenido no se edita desde la app.
3. **Formato de autoría versionable**: archivos JSON tipados (validados con Zod) que un humano escribe cómodo, y un script carga a la DB de forma idempotente.
4. **7 tipos de ejercicio** soportados y tipados (ver abajo).
5. **Seed de Unidad 1 (PoC)**: "A2 Refresh" con 3-4 lecciones y ~25-30 ejercicios, para desbloquear el desarrollo de 005.
6. **Script de carga** (`content:load`) idempotente: correrlo N veces deja la DB igual.
7. **Script de validación** (`content:validate`): valida los archivos de autoría contra el schema sin tocar la DB.

## No-objetivos (fuera de alcance)

- UI del lesson player (módulo 005).
- Progreso / XP / SRS del usuario (módulos 003 y 006).
- CMS visual con edición WYSIWYG. La autoría es por archivos.
- Audio pre-generado en Storage. En MVP el listening usa TTS del browser en runtime (decisión del proyecto). El schema deja el campo `audio_url` nullable para el futuro.
- Generación de contenido con IA. El currículum es curado.
- El currículum completo A2→B1. Este módulo entrega el **schema + tooling + Unidad 1**. El resto de las unidades se cargan después con el mismo formato.

## Tipos de ejercicio (contrato con 005)

Cada `exercise` tiene un `type` y un `payload` JSONB cuya forma depende del type. Los 7 tipos del MVP:

| type | Descripción | Forma del payload (resumen) |
|------|-------------|-----------------------------|
| `multiple_choice` | 1 pregunta, 3-4 opciones, 1 correcta | `{ prompt, options[], correctIndex, explanation }` |
| `fill_in_blank` | Texto con hueco(s), respuesta libre o con banco | `{ segments[], answers[], acceptable[][], explanation }` |
| `matching` | Parear izquierda ↔ derecha | `{ pairs[], explanation }` |
| `word_order` | Ordenar tokens para armar una oración | `{ tokens[], correctOrder[], explanation }` |
| `listening` | Audio (TTS) + comprensión (combina con MC o fill) | `{ audioText, sub: MC|fill payload }` |
| `translation` | Traducir EN↔ES | `{ prompt, direction, acceptable[], explanation }` |
| `dialogue` | Completar la respuesta en un mini diálogo | `{ turns[], blankTurnIndex, options[], correctIndex, explanation }` |

La forma exacta de cada payload está tipada en `packages/shared/src/content/exercise-types.ts` y validada con Zod. Ver [contracts/exercise-payloads.md](./contracts/exercise-payloads.md).

## Estructura pedagógica CEFR A2→B1

Propuesta de 10 unidades (a validar; el schema no la hardcodea, así que reordenar/renombrar no cuesta):

1. **A2 Refresh** — presente simple/continuo, pasado simple, vocabulario cotidiano.
2. **Past Tenses Consolidation** — pasado continuo, "used to", present perfect básico.
3. **Present Perfect Deep Dive** — vs pasado simple, "for/since", "ever/never/just/already/yet".
4. **Future Forms** — will, going to, presente continuo con valor futuro.
5. **Conditionals I & II**.
6. **Modals** — can/could, must/have to, should/ought to.
7. **Passive Voice** (introducción).
8. **Reported Speech** (introducción).
9. **Phrasal Verbs frecuentes A2→B1**.
10. **Comparativos, superlativos y estructuras enfáticas**.

Cada unidad ≈ 5-8 lecciones ≈ 40-80 ejercicios. Este módulo entrega solo la **Unidad 1** como PoC.

## Requisitos funcionales

### FR-001: Modelo de datos
Tablas `units`, `lessons`, `exercises`, `vocab_items`, `grammar_topics` con las relaciones y restricciones de [data-model.md](./data-model.md). **Must.**

### FR-002: RLS de solo-lectura
Todo usuario `authenticated` puede leer todo el contenido publicado (`is_published = true`). Nadie escribe desde la app. **Must.**

### FR-003: Orden estable
`units`, `lessons` y `exercises` tienen un campo `sort_order` (int) para el orden pedagógico. Dentro de un padre, `sort_order` es único. **Must.**

### FR-004: Formato de autoría tipado
Un archivo por unidad en `content/units/NN-slug.json`, validado contra un Zod schema en `packages/shared/src/content/`. **Must.**

### FR-005: Script de validación
`pnpm content:validate` valida todos los archivos de `content/units/*.json` contra el schema y reporta errores legibles, sin tocar la DB. **Must.**

### FR-006: Script de carga idempotente
`pnpm content:load` hace upsert de units/lessons/exercises usando `slug` (unit/lesson) y una clave estable de ejercicio. Correrlo dos veces no duplica ni rompe nada. **Must.**

### FR-007: Seed Unidad 1 (PoC)
`content/units/01-a2-refresh.json` con 3-4 lecciones y ~25-30 ejercicios que ejercitan los 7 tipos. Marcado como **borrador pedagógico** para revisión humana. **Must.**

### FR-008: Tipos TS regenerados
Tras la migración, `packages/shared/src/database.types.ts` incluye las tablas de contenido. **Must.**

## Requisitos no funcionales

- **Integridad**: FKs con `on delete cascade` de unit→lesson→exercise. Borrar una unidad borra su contenido.
- **Validación en dos capas**: Zod en autoría (antes de cargar) + CHECK constraints en Postgres (última línea de defensa).
- **Performance**: índices en `lessons(unit_id, sort_order)` y `exercises(lesson_id, sort_order)`.
- **Seguridad**: advisors de Supabase en cero tras la migración (RLS, search_path).
- **Idempotencia**: el load nunca genera duplicados; usa claves naturales estables (slugs).

## Criterios de aceptación

- [ ] AC-001: La migración crea las 5 tablas con sus FKs, constraints e índices.
- [ ] AC-002: Los advisors de seguridad y performance quedan en cero tras la migración.
- [ ] AC-003: Un `authenticated` puede `select` contenido publicado; un `anon` no ve nada (o solo lo público, según se decida — ver preguntas abiertas).
- [ ] AC-004: `pnpm content:validate` pasa sobre la Unidad 1.
- [ ] AC-005: `pnpm content:load` carga la Unidad 1; correrlo de nuevo no cambia el conteo de filas.
- [ ] AC-006: Los 7 tipos de ejercicio están representados en la Unidad 1.
- [ ] AC-007: `packages/shared` exporta los tipos de payload y los valida con Zod (con tests).
- [ ] AC-008: Una query de ejemplo (unit → lessons → exercises ordenados) devuelve la estructura correcta.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| El payload JSONB sin validación deja entrar basura | Alto | Zod en autoría + CHECK que valide `type ∈ enum`. La forma fina la garantiza el loader. |
| El formato de autoría se vuelve incómodo y frena la producción de contenido | Alto | JSON tipado + `content:validate` con errores claros. Reevaluar YAML si molesta. |
| Reordenar unidades rompe `sort_order` único | Medio | El loader recalcula `sort_order` desde el orden del archivo. |
| Contenido pedagógicamente flojo | Medio | La Unidad 1 va marcada como borrador; revisión humana obligatoria antes de "publicar" (`is_published`). |

## Preguntas abiertas

- [ ] ¿El contenido lo escribís vos, se contrata autor, o combinamos? (No bloquea el schema; sí la producción de las 10 unidades.)
- [ ] ¿`anon` (sin login) puede ver una lección de muestra, o todo requiere login? *Sugerido: requiere login; el schema puede aflojarse después.*
- [ ] ¿Audio TTS en runtime (gratis, decisión actual) o pre-generado en Storage para consistencia de voz? *Sugerido: TTS runtime en MVP; `audio_url` nullable ya deja la puerta abierta.*
- [ ] ¿Validamos la propuesta de 10 unidades o preferís otra división / otro orden?
