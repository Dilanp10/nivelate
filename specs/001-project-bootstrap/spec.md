# Spec 001 — Project Bootstrap

> **Estado:** Draft
> **Última actualización:** 2026-08-11

## Contexto

Este es el módulo cero: dejar el repositorio en un estado donde cualquier desarrollador (o agente) pueda clonar, correr un comando y ver la app Expo funcionando en web y en su celular, con conexión establecida al proyecto Supabase. Nada de contenido educativo todavía — solo la infraestructura.

Es la base sobre la que se apoyan los otros 7 módulos.

## Objetivos

1. **Monorepo funcional** con pnpm workspaces (`apps/mobile` + `packages/shared`).
2. **App Expo corriendo** en web (PWA) y en dispositivo vía Expo Go.
3. **Proyecto Supabase creado** y conectado desde la app (auth anónima verificada).
4. **Tooling listo:** TypeScript estricto, Biome (lint + format), Vitest, Playwright.
5. **Deploy preview de PWA en Vercel** desde el primer push.
6. **Documentación de arranque** (`quickstart.md`) que un dev nuevo puede seguir en < 15 min.

## No-objetivos (fuera de alcance)

- Cualquier pantalla del producto (login, home, lecciones). Solo una pantalla placeholder que diga "Hola, conectado a Supabase ✓".
- Modelo de datos de contenido educativo. Solo tabla de smoke test.
- Auth real (queda para 002). En bootstrap se prueba con auth anónima.
- CI en GitHub Actions más allá del auto-deploy de Vercel. Se agrega en un módulo posterior si hace falta.

## Requisitos funcionales

### FR-001: Monorepo con pnpm workspaces
El repo tiene `package.json` raíz con `workspaces: ["apps/*", "packages/*"]`. `pnpm install` en la raíz instala todo. **Must.**

### FR-002: App Expo mobile+web
`apps/mobile` es un proyecto Expo SDK 54+ con Expo Router. `pnpm --filter mobile start` levanta el dev server. Funciona en:
- Web (`pnpm --filter mobile web`) en `http://localhost:8081` como PWA.
- iOS/Android vía Expo Go (código QR).

**Must.**

### FR-003: Proyecto Supabase creado y linkeado
Existe un proyecto Supabase (creado vía MCP en esta sesión). Las claves `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` están en `.env.example` y documentadas. **Must.**

### FR-004: Cliente Supabase inicializado en la app
`apps/mobile/src/lib/supabase.ts` exporta un cliente `@supabase/supabase-js` configurado con storage `AsyncStorage` en native y `localStorage` en web. **Must.**

### FR-005: Smoke test end-to-end
La pantalla home (`apps/mobile/app/index.tsx`) hace una query `SELECT 1` (o read a tabla `_bootstrap_ping`) contra Supabase y muestra "✓ Conectado a Supabase" si funciona, o el error si no. **Must.**

### FR-006: Package `shared`
`packages/shared` con setup TypeScript. Ya exporta al menos `CEFRLevel` como `"A2" | "B1" | "B2"` (será usado por 003 y 004). **Must.**

### FR-007: Tooling
- TypeScript 5.x estricto (`strict: true`) en toda la workspace.
- Biome para lint + format (`pnpm lint`, `pnpm format`).
- Vitest para unit tests (`pnpm test`).
- Playwright para e2e web (`pnpm test:e2e`), configurado pero con solo un test smoke que verifica que carga la home.

**Must.**

### FR-008: Deploy PWA en Vercel
Al pushear a `main`, Vercel deploya la web export de Expo (`expo export --platform web`). Preview deploys en cada PR. **Should** (puede completarse al cierre del módulo, no bloquea al resto).

### FR-009: Quickstart documentado
`specs/001-project-bootstrap/quickstart.md` describe el clone → install → configure env → run en menos de 10 pasos. **Must.**

## Requisitos no funcionales

- **Node.js:** 20 LTS o superior.
- **Package manager:** pnpm 9+.
- **TypeScript:** estricto. `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`.
- **Accesibilidad:** aunque no haya UI real, la pantalla placeholder respeta contraste WCAG AA y es navegable con teclado.
- **Sin secretos en git.** `.env` en `.gitignore`, solo `.env.example` se commitea.

## Criterios de aceptación

- [ ] AC-001: `pnpm install` en la raíz completa sin errores en Node 20.
- [ ] AC-002: `pnpm --filter mobile web` abre `http://localhost:8081` y muestra "✓ Conectado a Supabase".
- [ ] AC-003: `pnpm --filter mobile start` genera QR válido para Expo Go.
- [ ] AC-004: `pnpm lint` pasa (0 errores).
- [ ] AC-005: `pnpm test` corre y pasa (al menos 1 test smoke).
- [ ] AC-006: `pnpm test:e2e` corre Playwright y pasa el smoke.
- [ ] AC-007: `git push` a una rama nueva genera preview deploy en Vercel.
- [ ] AC-008: Un dev nuevo puede clonar el repo y seguir `quickstart.md` hasta ver la app en < 15 min.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Expo Router + NativeWind + web tiene rough edges | Medio | Empezar sin NativeWind (styles inline en 001), agregar en 002. |
| pnpm workspaces + Metro bundler a veces requiere config extra | Medio | Documentar en `research.md` los `nodeModulesPath`. |
| Auth anónima en Supabase deshabilitada por default | Bajo | Habilitarla explícitamente en el bootstrap del proyecto Supabase. |
| Vercel build para Expo web requiere config específica | Medio | Documentar `vercel.ts` en `plan.md`. |

## Preguntas abiertas

- [x] ~~Nombre del proyecto: **Nivelate**.~~
- [ ] ¿Región Supabase preferida? (Sugerido: `sa-east-1` para latencia desde LatAm.) — **Diferido: Supabase se configura después.**
- [ ] ¿Cuenta de Vercel disponible? Si no, se puede diferir FR-008 hasta que se configure.
