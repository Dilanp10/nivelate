# Quickstart — 006 Review System

## Probar el repaso

1. `pnpm --filter mobile web`, login con el usuario de prueba.
2. Completá una lección desde la home. Al completarla, se **siembran cards** para todos sus ejercicios con `due_at = now() + 1 día`.
3. Al día siguiente (o forzando `due_at` en dev), la home muestra el badge **"🔁 Tenés N para repasar"**. Tocalo → `/review`.
4. Respondé cada card. Correcto → el intervalo crece (1 → 3 → 8 → …). Incorrecto → vuelve a 1 día.

## Forzar cards due hoy (solo dev)

```sql
update srs_cards set due_at = now()
where user_id = (select id from auth.users where email='tester@nivelate.local');
```

## Verificar

```bash
pnpm typecheck && pnpm lint && pnpm test   # incluye nextCard SM-2
```

## Notas

- **Sin XP por repaso** en MVP (evita farmeo). Repasar es su propio incentivo.
- **Cap 20** cards por sesión: si hay más, quedan para mañana.
- **La regla la manda el SQL** (RPC `review_card`). La versión pura en `shared` documenta y se testea, pero el SQL es la autoridad.
