# Tasks — 001 Project Bootstrap

Cada tarea → un commit. Formato: `<tipo>(001): T### — <descripción>`.

## Setup del monorepo

- [x] T001 — Crear `README.md`, `CLAUDE.md`, `AGENTS.md`, `BACKLOG.md` en la raíz.
- [x] T002 — Crear `.gitignore`, `.env.example`.
- [x] T003 — Crear `.specify/config.md` y templates.
- [x] T004 — Crear `package.json` raíz con `packageManager: pnpm@9` y scripts.
- [x] T005 — Crear `pnpm-workspace.yaml`.
- [x] T006 — Crear `tsconfig.base.json` (strict, target ES2022, JSX react-jsx).
- [x] T007 — Crear `biome.json` (lint + format).
- [x] T008 — `git init && git add . && git commit -m "chore(001): T001-T007 — repo scaffolding"`.

## Package shared

- [x] T010 — `packages/shared/package.json` con `name: @nivelate/shared`.
- [x] T011 — `packages/shared/tsconfig.json` extends base.
- [x] T012 — `packages/shared/src/cefr.ts` con `CEFRLevel`, `APP_CEFR_RANGE`, `CEFR_LABELS`.
- [x] T013 — `packages/shared/src/index.ts` re-exporta todo.
- [x] T014 — Placeholder `packages/shared/src/database.types.ts` (`export type Database = never;`).

## App Expo

- [x] T020 — Scaffolding manual de `apps/mobile` (package.json, tsconfig, app.json, babel, metro).
- [x] T021 — `apps/mobile/package.json` con `@nivelate/shared: workspace:*`.
- [x] T022 — Deps declaradas: `expo-router`, `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`, `zod`. Instalación pendiente en T027.
- [x] T023 — Expo Router configurado en `app.json` (plugin) + `app/_layout.tsx`.
- [x] T024 — `apps/mobile/src/env.ts` con validación zod safeParse (no crashea si falta env).
- [x] T025 — `apps/mobile/src/lib/supabase.ts` con storage adapter web/native + fallback a `null` si no hay env.
- [x] T026 — `apps/mobile/app/index.tsx` (smoke screen con 4 estados: loading / not-configured / connected / error).
- [x] T027 — `pnpm install` en la raíz para instalar todas las deps. Requirió `.npmrc` con `node-linker=hoisted` porque Expo/Metro no funciona con el modo `isolated` default de pnpm.
- [x] T028 — `pnpm --filter mobile web` arranca y renderiza "⚠️ Supabase no configurado". **Verificado en browser.**

## Supabase — DIFERIDO (usuario pidió configurarlo después)

- [ ] T030 — Crear proyecto Supabase vía MCP (región `sa-east-1`, plan free).
- [ ] T031 — Guardar URL y anon key en `.env` local.
- [ ] T032 — Crear migración `20260811000000_bootstrap_ping.sql`.
- [ ] T033 — Aplicar migración vía MCP `apply_migration`.
- [ ] T034 — Habilitar auth anónima en dashboard Supabase (o vía SQL).
- [ ] T035 — Correr `pnpm supabase:types` y commitear el archivo generado.

## Verificación local

- [x] T040 — `pnpm --filter mobile web`, abrir localhost, verificar smoke screen. **Renderiza "⚠️ Supabase no configurado" como esperado.** Cambiará a "✓ Conectado a Supabase" cuando se hagan T030-T035.
- [ ] T041 — `pnpm --filter mobile start`, escanear QR con Expo Go, misma verificación. *Pendiente — requiere celular en misma WiFi.*

## Tooling — tests

- [x] T050 — Configurar Vitest en `packages/shared`. Test dummy `expect(APP_CEFR_RANGE).toContain('A2')`.
- [x] T051 — Configurar Playwright en `tests/e2e/`. Test smoke: home + estado Supabase.
- [ ] T052 — Correr `pnpm test && pnpm test:e2e` y verificar verde. *Pendiente hasta `pnpm install`.*

## Tooling — lint

- [x] T060 — `pnpm lint` pasa en todo el repo (22 archivos, 0 errores).

## Deploy

- [x] T070 — Crear `vercel.ts` en la raíz.
- [ ] T071 — Conectar repo en Vercel dashboard. *Diferido: requiere GitHub remoto (T098) y cuenta Vercel.*
- [ ] T072 — Verificar deploy preview funciona.

## Docs & cierre

- [x] T090 — `quickstart.md` completado con pasos verificados en Windows 11.
- [ ] T091 — Actualizar `README.md` con la URL del deploy. *Pendiente hasta T072.*
- [x] T098 — Repo creado en GitHub y push inicial: https://github.com/Dilanp10/nivelate
- [ ] T099 — Merge PR `feat(001): project bootstrap`. *N/A durante bootstrap — commits directos a main. La convención de PR arranca desde el módulo 002.*
