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

- [ ] T010 — `packages/shared/package.json` con `name: @app/shared`, `types: dist/index.d.ts`.
- [ ] T011 — `packages/shared/tsconfig.json` extends base.
- [ ] T012 — `packages/shared/src/cefr.ts` con `CEFRLevel` y `APP_CEFR_RANGE`.
- [ ] T013 — `packages/shared/src/index.ts` re-exporta todo.
- [ ] T014 — Placeholder `packages/shared/src/database.types.ts` (`export type Database = never;`).

## App Expo

- [ ] T020 — `pnpm create expo-app apps/mobile --template blank-typescript --no-install`.
- [ ] T021 — Ajustar `apps/mobile/package.json` para workspace (`@app/shared: workspace:*`).
- [ ] T022 — Instalar deps: `expo-router`, `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`, `zod`.
- [ ] T023 — Configurar Expo Router en `app.json` y `app/_layout.tsx`.
- [ ] T024 — Crear `apps/mobile/src/env.ts` con validación zod.
- [ ] T025 — Crear `apps/mobile/src/lib/supabase.ts`.
- [ ] T026 — Crear `apps/mobile/app/index.tsx` (smoke screen).

## Supabase

- [ ] T030 — Crear proyecto Supabase vía MCP (región `sa-east-1`, plan free).
- [ ] T031 — Guardar URL y anon key en `.env` local.
- [ ] T032 — Crear migración `20260811000000_bootstrap_ping.sql`.
- [ ] T033 — Aplicar migración vía MCP `apply_migration`.
- [ ] T034 — Habilitar auth anónima en dashboard Supabase (o vía SQL).
- [ ] T035 — Correr `pnpm supabase:types` y commitear el archivo generado.

## Verificación local

- [ ] T040 — `pnpm --filter mobile web`, abrir localhost, verificar "✓ Conectado a Supabase".
- [ ] T041 — `pnpm --filter mobile start`, escanear QR con Expo Go, misma verificación.

## Tooling — tests

- [ ] T050 — Configurar Vitest en `packages/shared`. Test dummy `expect(APP_CEFR_RANGE).toContain('A2')`.
- [ ] T051 — Configurar Playwright en `tests/e2e/`. Test smoke: abre home, ve texto "Conectado".
- [ ] T052 — Correr `pnpm test && pnpm test:e2e` y verificar verde.

## Tooling — lint

- [ ] T060 — `pnpm lint` pasa en todo el repo.

## Deploy

- [ ] T070 — Crear `vercel.ts` en la raíz.
- [ ] T071 — Conectar repo en Vercel dashboard (requiere GitHub remote). *Bloqueante si aún no hay repo remoto — diferir a T098.*
- [ ] T072 — Verificar deploy preview funciona.

## Docs & cierre

- [ ] T090 — Completar `quickstart.md` con los pasos reales verificados.
- [ ] T091 — Actualizar `README.md` con la URL del deploy.
- [ ] T098 — Crear repo en GitHub, push inicial, conectar a Vercel.
- [ ] T099 — Merge PR `feat(001): project bootstrap`.
