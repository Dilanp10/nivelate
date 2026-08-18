# Research — 009 Aprendizaje adaptativo

## R-001: Convención de respelling en español

**Decisión:** convención propia, documentada en `docs/pronunciation-guide.md`, basada en los sonidos que un hispanohablante reconoce de forma inmediata.

**Reglas base:**
- Vocales inglesas neutras (schwa /ə/) → **e** o vocal suave (`about` → `ebáut`).
- `th` sordo (/θ/) → **z** (con nota: en Argentina/México se pronuncia como "s" — aceptable) (`thought` → `zot`).
- `th` sonoro (/ð/) → **d** (`this` → `dis`, `mother` → `máder`).
- `sh` (/ʃ/) → **sh** (`she` → `shi`).
- `ch` (/tʃ/) → **ch** (`chat` → `chat`).
- `j` (/dʒ/) → **y** o **ll** (`job` → `yob`).
- Vocal larga (/iː/) → doble o acento (`see` → `si`).
- Diptongo /oʊ/ → **óu** (`hello` → `je-lóu`).
- Diptongo /eɪ/ → **éi** (`day` → `déi`).
- Acento marcado con tilde en la sílaba tónica.
- Guiones entre sílabas para claridad.

**Por qué:** IPA es preciso pero requiere aprender los símbolos. Un usuario que ve `/həˈloʊ/` no lo puede leer sin capacitación previa; `je-lóu` sí. Precisión menor, accesibilidad enorme. La imprecisión (ej. "z" para /θ/) se compensa con el audio 🔊 al lado — el respelling guía la lectura, el audio da el modelo.

**Alternativa descartada:** IPA formal. Correcto académicamente pero contraproducente para el público objetivo (hispanohablantes adultos que no estudiaron fonología).

**Alternativa descartada:** ambos (IPA + respelling). Duplica el ruido visual y el trabajo de curado sin ganar nada — el usuario que quiere IPA busca un diccionario, el que quiere entender ya tiene el respelling.

## R-002: Integración de teaching cards en el flujo del player

**Decisión:** las teaching cards son un tipo de "paso" (`Step`) más dentro del `LessonRunner` existente — no una pantalla intermedia previa.

**Por qué:**
- El `LessonRunner` de 005 ya orquesta una lista de pasos con `currentIndex` + `progress`. Agregar un tipo `teaching` al array unifica el manejo.
- El progress bar de FR-007 sale gratis: total = `teachingCards.length + exercises.length`.
- Volver atrás dentro de la lección ya está soportado por el reducer.

**Cambio en el reducer:**
- El tipo `Step` cambia de `Exercise` a `TeachingStep | ExerciseStep`.
- `checkAnswer` solo aplica a `ExerciseStep`; `TeachingStep` solo tiene `next()` (avanzar).
- Sin retry en teaching cards — se avanza y punto.

**Alternativa descartada:** una ruta separada `/lesson/[id]/teach` antes de `/lesson/[id]/exercises`. Duplica navegación, rompe el progress bar unificado.

## R-003: Estructura de tablas — normalizado vs JSON

**Decisión:** tablas normalizadas (`teaching_cards`, `teaching_examples`, `pronunciation_highlights`) con FKs a `lessons`.

**Por qué:**
- El módulo 004 ya usa tablas normalizadas para `exercises`, `grammar_topics`, `vocab_items`. Consistencia.
- Facilita futuras queries "todos los ejemplos de goal X" o "todos los respellings con /oʊ/".
- El seed script (`content/seed.ts` o similar de 004) puede reusar la misma lógica de inserción.

**Alternativa descartada:** JSON columns en `lessons`. Simplifica el schema pero rompe la analytics y el filtrado por SQL. Y el tooling de 004 ya está armado para tablas.

**Schema propuesto:**
```sql
create table teaching_cards (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  key text not null,
  title_es text not null,
  body_es text not null,
  sort_order int not null,
  unique (lesson_id, key)
);

create table teaching_examples (
  id uuid primary key default gen_random_uuid(),
  teaching_card_id uuid not null references teaching_cards(id) on delete cascade,
  en text not null,
  es text not null,
  goal text null check (goal in ('travel', 'work', 'study', 'entertainment', 'general')),
  sort_order int not null
);

create table pronunciation_highlights (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  en text not null,
  respelling_es text not null,
  sort_order int not null
);

alter table exercises add column goal text null
  check (goal in ('travel', 'work', 'study', 'entertainment', 'general'));
```

RLS: `select` público para las 3 tablas nuevas (contenido). No mutations desde cliente.

## R-004: Fallback strategy para `learning_goal`

**Decisión:** priorizar exact match; completar con `general` o `null` si el pool queda chico; **nunca** mostrar contenido de otro goal.

**Función `filterByGoal(items, userGoal, minCount)`:**
1. `matches = items.filter(i => i.goal === userGoal)`
2. Si `matches.length >= minCount` → devolver `matches`.
3. Si no, `fallbacks = items.filter(i => i.goal === 'general' || i.goal === null)`.
4. Devolver `[...matches, ...fallbacks]`.

**Por qué:**
- Nunca mezclar goals confunde al usuario ("¿por qué me enseñan business si dije viaje?").
- `general` como fallback aceptable (ejemplos neutros aplican a cualquier contexto).
- `null` = agnóstico, cuenta como fallback.

**Alternativa descartada:** mezclar goals proporcionalmente. Complejo y confuso pedagógicamente.

## R-005: Web Speech API — voz y lang

**Decisión:** `SpeechSynthesisUtterance` con `lang = 'en-US'`, `rate = 0.9`, sin especificar `voice` (el browser elige la mejor voz disponible en-US).

**Por qué:**
- `rate = 0.9` = ligeramente más lento que natural, mejor para principiantes A2/B1 sin caer en robótico.
- No fijar `voice` porque cada navegador/OS tiene voces distintas — forzar una que no existe silencia el audio. El browser default en-US suele ser aceptable.
- `en-US` como estándar (más voces disponibles que en-GB en Chrome/Windows).

**Fallback:** si `!window.speechSynthesis`, botón 🔊 se muestra deshabilitado con `aria-label="Audio no disponible en este navegador"`. No romper la pantalla.

**Ya usado en 005 para listening** — reusar el helper `apps/mobile/src/lib/speak.ts` (existe según código actual; verificar en implementación).

## R-006: Punto de arranque — runtime o persistido

**Decisión:** calcular en runtime desde `self_level`, no persistir un `starting_unit_id` en `profiles`.

**Por qué:**
- Si el usuario cambia su `self_level` desde perfil (futuro módulo 010), el arranque se recalcula automáticamente sin migración.
- Sin fuente doble de verdad.
- El cálculo es O(1) (mapping estático).

**Función pura `getStartingUnitOrder(selfLevel: SelfLevel): number`:**
- `zero` → 1
- `basic` → 1
- `conversational` → 2
- `intermediate` → 3

Devuelve el `sortOrder` de la unidad. El dashboard filtra `units.find(u => u.sortOrder === startingOrder)` — si no existe (ej. `intermediate` y aún no hay U3 publicada), cae a la primera publicada.

**Alternativa descartada:** persistir `starting_unit_id`. Doble fuente, requiere backfill al cambiar unidades.

## R-007: Progress bar — cómo contar teaching cards

**Decisión:** `total = teachingCards.length + exercises.length`. Cada `next()` avanza 1. XP se calcula solo sobre ejercicios (teaching cards son exposición, no evaluación).

**Por qué:**
- User-visible: si veo 3 cards + 8 ejercicios, mi progreso "1/11" al empezar tiene sentido.
- El XP sigue ligado a ejercicios (007 no cambia).
- La primera card ya avanza 1 unidad → feedback inmediato de progreso.

**No otorgan XP** (per pregunta abierta ya cerrada). Confirmado.

## R-008: Backfill del contenido existente

**Decisión:** las 3 tablas nuevas quedan vacías al aplicar la migración. Se pueblan con el seed cuando se agrega el contenido.

- **U1** (publicada): agregar teaching cards y pronunciation highlights **en el mismo PR** que el módulo. Sin teaching cards → la lección queda como está hoy (arranca directo en ejercicios). Sin highlights → la pantalla final se salta.
- **U2/U3** (draft, `isPublished: false`): agregar teaching cards + highlights junto con la revisión pedagógica pendiente. Bloqueante para publicar.
- **Ejercicios existentes**: `goal = null` por default (equivalente a `general` en el filter). Etiquetar solo los que claramente son de un contexto (probablemente pocos).

**Migración segura:** todas las columnas nuevas son nullable o sin default problemático. Sin data loss.

## R-009: Botón "muy difícil, volvé a los básicos"

**Decisión:** implementar como enlace discreto en el header de las unidades ≥ U2 **solo si** el usuario arrancó saltando unidades (es decir, `self_level in ('conversational', 'intermediate')`).

- Texto: "¿Muy difícil? Empezá desde el principio →"
- Lleva a U1L1.
- No cambia `self_level` en el perfil (para eso, módulo 010).

**Por qué:** mitiga el riesgo de "nivel autopercibido inflado" sin agregar UI de nivel-testing. Autoservicio, discreto.

## R-010: Interacción con módulo 007 (logros)

**Sin nuevos logros en 009.** Los logros existentes (racha, XP, lecciones completadas) siguen aplicando sin cambios.

**Ideas para módulo futuro** (no en este):
- "Escuchaste 50 frases" (contar clicks en 🔊).
- "Completaste tu primera pantalla de pronunciación."
- "Terminaste la unidad de tu goal".

No se implementan en 009 para no inflar scope.
