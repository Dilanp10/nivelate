# Research — 004 Curriculum & Content

## R-001: Modelado del payload de ejercicios — columnas tipadas vs. JSONB

**Decisión:** Una tabla `exercises` con `type` (enum) + `payload` JSONB.

**Por qué:**
- Los 7 tipos tienen formas muy distintas (matching no se parece a word_order). Modelar cada uno con columnas propias explotaría en decenas de columnas nullable o en 7 tablas.
- JSONB permite evolucionar la forma de un tipo sin migración.
- La validación fina la hace Zod en el loader (autoría), y Postgres garantiza lo básico (`type ∈ enum`, `payload` not null).

**Alternativas descartadas:**
- **Tabla por tipo** (`mc_exercises`, `matching_exercises`, ...): 7 tablas + polimorfismo en queries. Demasiado para el MVP.
- **EAV** (entity-attribute-value): ilegible, sin garantías de tipo.

**Trade-off aceptado:** la DB no valida la forma fina del payload. La confianza está en que el único camino de escritura es el loader, que valida con Zod antes de insertar.

## R-002: Claves naturales para idempotencia

**Decisión:** `units.slug` y `lessons.slug` (único dentro de la unidad) como claves naturales; `exercises` con una clave estable `(lesson_id, sort_order)` o un `exercise_key` explícito en el archivo de autoría.

**Por qué:** el loader tiene que ser idempotente (FR-006). Con slugs estables, `upsert on conflict (slug)` no duplica. Los ejercicios no tienen un "nombre", así que usamos un `exercise_key` corto y único dentro de la lección (lo pone el autor, ej. `"u1l1-e3"`), que sobrevive a reordenamientos.

## R-003: Formato de autoría — JSON vs. YAML vs. Markdown

**Decisión:** **JSON tipado**, un archivo por unidad, validado con Zod.

**Por qué:**
- JSON lo parsea Node sin dependencias.
- Con el Zod schema exportado desde `packages/shared`, el autor tiene validación + (si usa VS Code con el `$schema`) autocompletado.
- YAML es más lindo de escribir a mano pero mete ambigüedad (tipos implícitos, indentación). Reevaluable si el volumen de contenido lo justifica.

**Estructura del archivo** (`content/units/01-a2-refresh.json`):
```jsonc
{
  "slug": "a2-refresh",
  "title": "A2 Refresh",
  "description": "Repaso de presente, pasado simple y vocabulario cotidiano.",
  "cefrLevel": "A2",
  "sortOrder": 1,
  "isPublished": false,          // borrador hasta revisión humana
  "grammarTopics": [ ... ],
  "lessons": [
    {
      "slug": "present-simple-review",
      "title": "Presente simple",
      "sortOrder": 1,
      "exercises": [
        { "key": "u1l1-e1", "type": "multiple_choice", "payload": { ... } },
        ...
      ]
    }
  ]
}
```

## R-004: Script de carga — dónde vive y cómo corre

**Decisión:** un script Node en `scripts/content-load.ts` (raíz), ejecutado con `tsx`, que usa el **service_role key** de Supabase (no el anon) porque tiene que escribir saltándose RLS.

**Por qué service_role:** el contenido se carga desde un entorno de confianza (la máquina del autor / CI), no desde la app. RLS bloquea escrituras desde el cliente; el loader las hace con la llave de servicio.

**Seguridad:** el service_role key va en un `.env` local del script (NO en `apps/mobile/.env`, NO commiteado). Documentado en `.env.example`.

**Idempotencia:** el loader hace, por unidad:
1. `upsert` de la unit por `slug`.
2. `upsert` de cada lesson por `(unit_id, slug)`.
3. `upsert` de cada exercise por `(lesson_id, key)`.
4. Borra lessons/exercises que estaban en la DB pero ya no en el archivo (sync real).

## R-005: Validación en dos capas

1. **Zod (autoría):** `content:validate` corre antes de cargar. Valida forma completa de cada payload según su `type`. Errores legibles con path (`units[0].lessons[2].exercises[4].payload.correctIndex`).
2. **Postgres (defensa):** CHECK de que `type` está en el enum, `payload` not null, `sort_order >= 0`. No valida la forma fina (eso lo hace Zod).

## R-006: `grammar_topics` y `vocab_items` — reutilizables

**Decisión:** tablas separadas referenciables.

- `grammar_topics`: un tema gramatical ("present perfect with for/since") con explicación en español. Una lección puede linkear a uno o más vía `lesson_grammar_topics`. Sirve para futuras pantallas de "teoría".
- `vocab_items`: banco de vocabulario (palabra EN + traducción ES + ejemplo). Los ejercicios de matching/vocab pueden referenciar items, y el módulo 006 (SRS) va a trackear vocab. Para el MVP, los ejercicios pueden embeber vocab en el payload; `vocab_items` queda como tabla lista para cuando 006 la necesite.

**Para 004:** creamos ambas tablas pero el seed de Unidad 1 usa `grammar_topics` (sí aporta valor ya) y deja `vocab_items` mayormente vacío (lo llena 006 o unidades de vocabulario).

## R-007: `is_published` — borradores vs. publicado

**Decisión:** flag `is_published` en `units` (y heredado lógicamente por sus lessons). RLS solo deja leer lo publicado. La Unidad 1 PoC entra con `is_published = false` hasta que un humano la valide y la publique.

**Por qué:** permite cargar contenido en progreso sin exponerlo a usuarios. El toggle a `true` es una decisión editorial explícita.

## R-008: TTS para listening — runtime, no pre-generado

**Decisión (heredada del proyecto):** los ejercicios `listening` guardan el **texto** a pronunciar (`audioText`), y 005 lo reproduce con `SpeechSynthesis` del browser en runtime. El schema deja `audio_url` nullable en el payload para migrar a audio pre-generado en el futuro sin romper datos.

**Trade-off:** la voz varía por dispositivo/navegador. Aceptable para MVP y gratis. Si la calidad molesta, se pre-genera con un TTS y se sube a Storage (post-MVP).
