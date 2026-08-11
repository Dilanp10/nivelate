# CLAUDE.md — guía para Claude Code en este proyecto

## Metodología: Spec-Driven Development (SDD)

Este proyecto usa **Spec Kit**. La regla de oro:

> **Ningún código productivo se escribe sin un spec aprobado.**

El flujo por módulo es:

1. Crear `specs/NNN-nombre/spec.md` — el **qué** y **por qué** (requisitos funcionales/no funcionales, criterios de aceptación, fuera de alcance).
2. Investigar en `specs/NNN-nombre/research.md` — decisiones técnicas con alternativas evaluadas.
3. Modelar en `specs/NNN-nombre/data-model.md` — esquema Postgres (Supabase), tipos TS compartidos.
4. Contratos en `specs/NNN-nombre/contracts/` — API endpoints, RPC de Supabase, event schemas.
5. Plan en `specs/NNN-nombre/plan.md` — el **cómo** (arquitectura del módulo, orden de implementación).
6. Tareas en `specs/NNN-nombre/tasks.md` — checklist ejecutable, un commit por tarea.
7. Quickstart en `specs/NNN-nombre/quickstart.md` — cómo probar el módulo end-to-end.
8. Ejecutar tareas, PR con nombre `feat(NNN): descripción`.

## Convenciones

- **Un commit por tarea** de `tasks.md`. Formato: `feat(NNN): T### — breve descripción` o `chore(NNN)`, `fix(NNN)`, `docs(NNN)`.
- **Una PR por módulo.** Rama `NNN-nombre-modulo`.
- **UI en español.** Todos los strings user-facing van en español. El contenido educativo (frases a aprender) va en inglés.
- **Sin mascotas.** No agregar ilustraciones antropomórficas ni sistemas de vida/corazones sin discutir.
- **Sin generación de contenido en runtime con LLM.** El currículum es curado.

## Stack técnico

- **Monorepo:** pnpm workspaces (simple, sin turbo por ahora).
- **App:** Expo SDK 54+ con Expo Router. Export web como PWA.
- **Backend:** Supabase (Postgres + Auth + Storage). Cliente `@supabase/supabase-js`.
- **Estado:** React Query (`@tanstack/react-query`) para servidor, Zustand para estado UI global mínimo.
- **Estilos:** NativeWind (Tailwind para React Native) — funciona en web y native.
- **Tipos:** TypeScript estricto. Tipos de DB autogenerados con `supabase gen types typescript`.
- **Tests:** Vitest para lógica pura, Playwright para e2e web.
- **Lint/Format:** Biome (todo en uno, rápido).

## Decisiones ya tomadas (no re-litigar)

- **Expo + Web como PWA**, no React Native puro ni Flutter. Ver [[project-ingles-a2-b1]].
- **Supabase**, no Firebase / Convex. Ya está integrado vía MCP.
- **Currículum curado CEFR**, no generación con IA.
- **Español como UI language.**
- **Gamificación mínima adulta**: racha, XP, logros. Sin vidas.
- **Listening con Web Speech API** en MVP. Sin speaking.

## Antes de tomar decisiones

El usuario pidió explícitamente: **"si necesitas preguntarme algo hacelo y no asumas"**. En decisiones de scope, UX o arquitectura no triviales, preguntar antes de asumir.

## Referencias

- Spec Kit: https://github.com/github/spec-kit
- CEFR A2→B1 competencias: https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale
