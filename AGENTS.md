# AGENTS.md — convenciones para agentes de IA

Esta guía aplica a cualquier agente (Claude Code, Cursor, Codex, etc.) que trabaje en este repo.

## Regla #1: SDD antes que código

No abrir un editor de código sin un spec aprobado en `specs/NNN-nombre/`. Si el usuario pide "arrancar a codear X" y no existe el spec, primero crearlo.

## Regla #2: Un commit por tarea

Cada tarea marcada en `specs/NNN-nombre/tasks.md` debe corresponder a **un** commit. El mensaje sigue:

```
<tipo>(NNN): T### — <descripción breve>
```

Tipos: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`.

## Regla #3: Idioma

- **Código, nombres de variables, comentarios técnicos:** inglés.
- **Commit messages, PRs, issues, documentación de producto, UI:** español (contenido educativo en inglés).

## Regla #4: Antes de escribir en la base

Cualquier cambio de schema pasa por `data-model.md` del spec correspondiente. Migraciones en `apps/mobile/supabase/migrations/` con timestamp. **Nunca** ejecutar `apply_migration` sin haber actualizado el `data-model.md`.

## Regla #5: No inventar contenido

El currículum lo diseña un humano siguiendo CEFR. Un agente puede sugerir estructura pero no genera ejercicios que se van a producción sin revisión.

## Regla #6: Testing mínimo por módulo

Cada módulo debe salir con:
- Tests unitarios para lógica pura (Vitest).
- Un test e2e del happy path (Playwright, contra la web build de Expo).

## Regla #7: Accesibilidad

Toda pantalla debe ser navegable con teclado y screen reader. Textos con contraste WCAG AA. Es un diferencial contra apps infantiles y no negociable.
