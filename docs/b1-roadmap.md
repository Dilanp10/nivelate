# Roadmap de expansión curricular A2 → B1

Estado: **en curso — 2026-08-19.**

## Motivación

Diagnóstico del contenido al mergear el módulo 009 (adaptive learning): las 3
unidades actuales (Presente/pasado simple + continuo + perfecto) equivalen a
"refuerzo de A2 + intro a B1", **no** al recorrido completo hacia B1. Para
que la promo "A2 → B1" sea honesta hace falta cubrir la gramática y el
vocabulario que el marco CEFR exige para B1 (comunicación autónoma en
contextos familiares: trabajo, viajes, planes, opiniones básicas).

## Unidades planificadas

Cada unidad = 3 lecciones. Cada lección = 4 teaching cards + 13-14 ejercicios
+ 10 pronunciation highlights (mismo tamaño que las unidades actuales).

- **U4 — Futuros** (`futures`) — `will`, `going to`, presente continuo para
  planes. 3 lecciones.
- **U5 — Modales de habilidad y consejo** (`modals-ability-advice`) —
  `can/could/be able to`, `should/had better`, `may/might/could` posibilidad.
- **U6 — Obligación y necesidad** (`modals-obligation`) —
  `must/have to/mustn't/don't have to`, `need to/needn't`, `had to` (pasado).
- **U7 — Condicionales** (`conditionals`) — zero, first, second.
- **U8 — Comparaciones** (`comparisons`) — comparativos, superlativos,
  `as ... as`, `less ... than`.
- **U9 — Cláusulas y conexiones** (`clauses-connectors`) — relativas defining
  (`who/which/that`), conectores (`because/so/although/however`), gerundio vs.
  infinitivo (`like doing` vs. `want to do`).
- **U10 — Perfecto avanzado y hábitos pasados**
  (`perfect-advanced-past-habits`) — presente perfecto continuo, `used to /
  would` para hábitos, reported speech básico.

## Fuera de scope (queda para más adelante o desestimado)

- **Voz pasiva** (`passive-voice`) — importante para B1 pero de baja
  frecuencia en conversación cotidiana; se puede sumar como U11 si el usuario
  lo pide.
- **Phrasal verbs** — vocabulario suelto, mejor tratado como listas
  temáticas dentro de otras unidades.
- **Fonética profunda** — más allá de los `pronunciationHighlights` actuales.

## Cómo cargarlas

Mismo pipeline que las existentes: JSON en `content/units/`, validado con
`pnpm content:validate`, sincronizado con la DB via MCP (`execute_sql` con
delta como `$json$…$json$::jsonb + unnest`). Cuando exista `.env` con
`SUPABASE_SERVICE_ROLE_KEY` en la raíz, el equivalente idempotente es
`pnpm content:load`.

## Revisión pedagógica

**Requisito explícito** antes de publicar cada unidad nueva: revisión por
alguien con formación en pedagogía de idiomas. El contenido lo escribo yo
(Claude Sonnet 5) con gramática correcta según CEFR, pero la validación
humana es lo que separa "material que parece que funciona" de "material que
funciona en serio". Ver [[project-content-pedagogical-review]] en memoria.
