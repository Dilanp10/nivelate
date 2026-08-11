# Nivelate

PWA educativa para hispanohablantes que quieren pasar de nivel CEFR **A2 a B1 sólido**, dejando el terreno listo para saltar a B2. Enfoque adulto, sin mascotas, sin infantilización — progreso real medible.

> **Estado:** Bootstrap. En SDD (Spec-Driven Development) con [Spec Kit](https://github.com/github/spec-kit). Ver [`specs/`](./specs/) para el detalle de cada módulo.

## Principios de producto

1. **Adulto, no infantil.** Ni mascotas, ni corazones/vidas, ni ligas semanales. Sí racha, XP y progreso por unidad CEFR.
2. **Progreso pedagógicamente real.** El currículum sigue el marco CEFR A2→B1 (Vantage). Al terminar, el usuario está en condiciones de rendir un examen B1 y encarar B2.
3. **Gratis.** Todo el stack está pensado sobre planes free (Supabase, Expo, hosting PWA).
4. **Contenido curado, no generado.** El contenido lo diseñamos nosotros a mano siguiendo CEFR; no hay generación de ejercicios en tiempo real con LLM.
5. **Funciona offline.** Una vez descargada una unidad, el usuario puede completarla sin internet.

## Stack

- **App:** Expo (React Native + Web) exportada como PWA. Un solo código para iOS/Android/Web.
- **Backend:** Supabase (Postgres + Auth + Storage).
- **UI:** Español (menús, hints, feedback). Contenido a aprender: inglés.
- **Audio:** Web Speech API (`SpeechSynthesis`) para TTS. Speaking / STT no está en MVP.

## Estructura del repo

```
.
├── .specify/            # Configuración y templates de Spec Kit
├── apps/
│   └── mobile/          # Expo app (React Native + Web)
├── packages/
│   └── shared/          # Tipos, constantes, lógica compartida
├── specs/
│   ├── 001-project-bootstrap/
│   ├── 002-auth/
│   ├── 003-user-profile-progress/
│   ├── 004-curriculum-content/
│   ├── 005-lesson-player/
│   ├── 006-review-system/
│   ├── 007-gamification/
│   └── 008-offline-pwa/
├── docs/                # Documentación transversal (arquitectura, decisiones)
├── AGENTS.md            # Convenciones para agentes IA (Claude Code, etc.)
├── CLAUDE.md            # Guía específica de este proyecto para Claude
├── BACKLOG.md           # Ideas fuera del alcance del MVP
└── README.md
```

## Roadmap de módulos

| # | Módulo | Descripción |
|---|--------|-------------|
| 001 | `project-bootstrap` | Monorepo, Expo app, Supabase link, tooling |
| 002 | `auth` | Registro / login (email + magic link) |
| 003 | `user-profile-progress` | Nivel, XP, racha, historial |
| 004 | `curriculum-content` | Modelo CEFR: unidades → lecciones → ejercicios |
| 005 | `lesson-player` | Motor de ejercicios |
| 006 | `review-system` | Repaso espaciado (SM-2) |
| 007 | `gamification` | Rachas, XP, logros discretos |
| 008 | `offline-pwa` | Service worker, cache, sync |

## Cómo arrancar

Ver [`specs/001-project-bootstrap/quickstart.md`](./specs/001-project-bootstrap/quickstart.md).
