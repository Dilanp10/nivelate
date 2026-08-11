# Spec 004 — Curriculum & Content

> **Estado:** Stub.
> **Depende de:** 001, 002.

## Contexto

El **corazón pedagógico**. Modelo de datos + primer batch de contenido curado A2→B1 siguiendo CEFR. Este módulo NO implementa la UI del ejercicio (eso es 005), pero sí define la estructura de todos los tipos de ejercicio que 005 va a renderizar.

## Objetivos (borrador)

1. Modelo `units` (unidades temáticas CEFR).
2. Modelo `lessons` (lecciones dentro de una unidad).
3. Modelo `exercises` (ejercicios dentro de una lección) con `type` discriminado.
4. Modelo `vocab_items` (banco de vocabulario reutilizable).
5. Modelo `grammar_topics` (temas gramaticales referenciados por lecciones).
6. Seed inicial: al menos **Unidad 1 completa (A2 refresh)** con 4-5 lecciones y ~40 ejercicios como PoC.
7. Herramienta de autoría: definir formato para que un humano pueda escribir contenido cómodo (YAML/JSON con validación) y un script lo carga a la DB.

## Tipos de ejercicio a soportar (mapeo a los que renderiza 005)

- `multiple_choice` — 1 pregunta, 3-4 opciones, 1 correcta.
- `fill_in_blank` — texto con hueco(s), input libre o dropdown.
- `matching` — parear pairs (palabra ↔ traducción / palabra ↔ definición).
- `word_order` — ordenar tokens para armar una oración.
- `listening` — audio TTS + comprensión (usualmente combinado con MC o fill-in).
- `translation` — traducir del inglés al español o viceversa.
- `dialogue` — completar respuesta en un mini diálogo.

## Estructura pedagógica CEFR A2→B1

Propuesta de unidades (a validar con el usuario):

1. **A2 Refresh** — presente simple/continuo, pasado simple, vocabulario cotidiano.
2. **Past Tenses Consolidation** — pasado continuo, "used to", present perfect básico.
3. **Present Perfect Deep Dive** — vs pasado simple, "for/since", "ever/never/just/already/yet".
4. **Future Forms** — will, going to, present continuous con valor futuro.
5. **Conditionals I & II**.
6. **Modals de posibilidad, obligación y consejo** — can/could, must/have to, should/ought to.
7. **Passive Voice** (introducción).
8. **Reported Speech** (introducción).
9. **Phrasal Verbs frecuentes A2→B1**.
10. **Comparativos, superlativos y estructuras enfáticas**.

Cada unidad = ~5-8 lecciones = ~40-80 ejercicios.

## No-objetivos

- CMS visual con edición WYSIWYG. Autoría desde archivos YAML es suficiente para MVP.
- Multi-idioma del contenido a aprender. Solo inglés A2→B1.
- Generación con IA.

## Preguntas abiertas

- [ ] ¿Validamos la propuesta de 10 unidades o preferís otra división?
- [ ] ¿El contenido lo escribís vos, contratamos autor, o combinamos ambos?
- [ ] ¿Formato de autoría — YAML plano por lección, o Markdown con front-matter?
- [ ] ¿Audio TTS "on-the-fly" (Web Speech) o pre-generado y guardado en Supabase Storage? (On-the-fly es gratis pero suena distinto en cada device.)
