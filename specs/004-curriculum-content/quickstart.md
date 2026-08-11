# Quickstart — 004 Curriculum & Content

Cómo escribir contenido y cargarlo a la base.

## Requisitos previos

- Migración `content_schema` aplicada.
- Un `.env` de scripts (raíz, no commiteado) con:
  ```
  SUPABASE_URL=https://fhrrnqejjuvkewtyifjt.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=<service-role-key-del-dashboard>
  ```
  El service_role key está en Dashboard → Settings → API → `service_role`. **Nunca** lo commitees ni lo pongas en `apps/mobile/.env`.

## Escribir una unidad

1. Crear `content/units/NN-slug.json` (mirá `01-a2-refresh.json` como referencia).
2. Estructura: unit → lessons → exercises. Cada exercise tiene `key`, `type` y `payload`.
3. La forma de cada `payload` depende del `type` — ver [contracts/exercise-payloads.md](./contracts/exercise-payloads.md).

## Validar sin tocar la DB

```bash
pnpm content:validate
```
Valida todos los `content/units/*.json` contra el schema. Reporta errores con path exacto (ej. `01-a2-refresh.json → lessons[2].exercises[4].payload.correctIndex`).

## Cargar a la base

```bash
pnpm content:load
```
Upsert idempotente. Correrlo dos veces deja la DB igual. Sincroniza: borra de la DB las lessons/exercises que ya no están en el archivo.

## Publicar una unidad

El contenido carga como borrador (`isPublished: false`) — no lo ven los usuarios. Tras revisión humana, cambiar `"isPublished": true` en el archivo y volver a correr `pnpm content:load`.

## Verificar

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Query de ejemplo para ver la estructura cargada (SQL editor del dashboard):
```sql
select u.title as unit, l.title as lesson, e.exercise_key, e.type
from units u
join lessons l on l.unit_id = u.id
join exercises e on e.lesson_id = l.id
order by u.sort_order, l.sort_order, e.sort_order;
```

## Troubleshooting

**"permission denied for table units" al cargar:** el loader necesita el `service_role` key, no el anon. Revisá el `.env` de scripts.

**`content:validate` falla con "segments.length must be answers.length + 1":** en un `fill_in_blank`, los segmentos son N+1 para N huecos.

**El contenido no aparece en la app:** ¿está `isPublished: true`? La RLS solo deja leer unidades publicadas.
