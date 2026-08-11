# Plan — 001 Project Bootstrap

Cómo vamos a implementar el spec. Orden y arquitectura.

## Arquitectura del monorepo

```
/
├── package.json                     # workspaces + scripts raíz
├── pnpm-workspace.yaml
├── biome.json                       # config única de lint+format
├── tsconfig.base.json               # config TS compartida
├── vercel.ts                        # deploy config
├── .env.example
│
├── apps/
│   └── mobile/                      # Expo app
│       ├── app.json
│       ├── package.json
│       ├── tsconfig.json            # extends base
│       ├── app/                     # Expo Router pages
│       │   └── index.tsx            # smoke screen
│       ├── src/
│       │   ├── lib/
│       │   │   └── supabase.ts
│       │   └── env.ts               # validación runtime de env vars
│       └── supabase/
│           ├── config.toml
│           └── migrations/
│               └── 20260811000000_bootstrap_ping.sql
│
├── packages/
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── cefr.ts
│           └── database.types.ts    # generado
│
└── tests/
    └── e2e/
        ├── playwright.config.ts
        └── smoke.spec.ts
```

## Orden de implementación

1. **Setup del monorepo** — `package.json` raíz, `pnpm-workspace.yaml`, `tsconfig.base.json`, `biome.json`, `.gitignore`, `.env.example` (ya hechos).
2. **Package `shared`** — crear estructura mínima, exportar `CEFRLevel`.
3. **Expo app** — `pnpm create expo-app apps/mobile --template blank-typescript`, adaptar a workspace.
4. **Expo Router** — instalar y configurar.
5. **Supabase — crear proyecto vía MCP.** Habilitar auth anónima. Guardar keys en `.env` local.
6. **Cliente Supabase en la app** — `apps/mobile/src/lib/supabase.ts`.
7. **Smoke screen** — `apps/mobile/app/index.tsx` que hace `select` a `_bootstrap_ping`.
8. **Migración `_bootstrap_ping`** — aplicar vía MCP `apply_migration`.
9. **Regenerar tipos** — `pnpm supabase:types`.
10. **Vitest** — configurar en `packages/shared` con un test dummy.
11. **Playwright** — configurar en `tests/e2e/` con test smoke.
12. **Vercel** — `vercel.ts`, primer deploy.
13. **Quickstart** — completar `quickstart.md` con los pasos reales.

## Decisiones de arquitectura (heredadas de research.md)

- **Estilo:** StyleSheet inline en 001. NativeWind en 002.
- **Estado:** No usamos React Query en 001 (una sola query, `useEffect` alcanza).
- **Env vars:** validadas en `apps/mobile/src/env.ts` con `zod` — fallar temprano si falta algo.

## Ejemplo — `apps/mobile/src/env.ts`

```ts
import { z } from 'zod';

const schema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export const env = schema.parse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});
```

## Vercel deploy

Config con `vercel.ts` (ver [research.md#r-007](./research.md)). Se crea el proyecto Vercel desde el dashboard (o CLI si el usuario tiene `vercel` instalado — ver system reminder de esta sesión: **no está instalado**, se recomienda `npm i -g vercel`).

## Fuera del plan de 001

- Deploy de migraciones vía CLI de Supabase queda para 002 (por ahora se aplica vía MCP directo).
- CI en GitHub Actions se agrega en 002 si el auto-deploy de Vercel no cubre.
