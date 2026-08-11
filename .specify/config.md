# Spec Kit config

Este proyecto usa Spec-Driven Development.

## Convenciones

- Cada módulo vive en `specs/NNN-nombre-modulo/`.
- Numeración correlativa: `001`, `002`, ... — no se reusan números.
- Ramas: `NNN-nombre-modulo`. Merge a `main` vía PR.
- Un commit por tarea de `tasks.md`.

## Artefactos por spec

| Archivo | Propósito |
|---------|-----------|
| `spec.md` | **QUÉ** y **POR QUÉ**. Requisitos funcionales, no funcionales, criterios de aceptación, fuera de alcance. |
| `research.md` | Decisiones técnicas con alternativas evaluadas. |
| `data-model.md` | Schema Postgres + tipos TS. |
| `contracts/` | API contracts, RPC signatures, event schemas. |
| `plan.md` | **CÓMO**. Arquitectura del módulo, orden de implementación. |
| `tasks.md` | Checklist ejecutable. Un commit por tarea. |
| `quickstart.md` | Cómo probar el módulo end-to-end en local. |
| `checklists/` | Checklists de review (opcional). |

## Templates

En `.specify/templates/`.
