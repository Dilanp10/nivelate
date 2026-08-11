# Quickstart — 001 Project Bootstrap

Verificado en Windows 11 + Node 24.14 + pnpm 9.15 el 2026-08-11.

## Requisitos previos

- **Node.js 20 LTS+** — `node --version` ≥ v20.
- **pnpm 9+** — `npm i -g pnpm`.
- **Git**.
- **Expo Go** en el celular (opcional, solo para probar en dispositivo).

## Setup local

```bash
# 1. Clonar
git clone https://github.com/Dilanp10/nivelate.git
cd nivelate

# 2. Instalar dependencias (~1-5 min)
pnpm install

# 3. Copiar template de env vars a apps/mobile/.env
#    (Expo lee .env desde el dir de la app, NO desde la raíz del monorepo)
# En Windows PowerShell:
copy .env.example apps\mobile\.env
# En bash:
cp .env.example apps/mobile/.env
# Editar apps/mobile/.env con las claves reales de tu proyecto Supabase.
# Si dejás valores vacíos, la app arranca y muestra "⚠️ Supabase no configurado".

# 4. Arrancar la app en web
pnpm --filter mobile web
# Abrir http://localhost:8081
# Deberías ver: "Nivelate" + "⚠️ Supabase no configurado"

# 5. (Opcional) Arrancar en celular
pnpm --filter mobile start
# Escanear el QR con Expo Go (Android) o Cámara (iOS)
```

## Verificar que todo funciona

```bash
# TypeScript
pnpm typecheck

# Lint + format
pnpm lint

# Tests unitarios (Vitest)
pnpm test

# Tests e2e (Playwright, requiere que la app esté corriendo)
# Primera vez:
pnpm exec playwright install --with-deps chromium
# Luego:
pnpm test:e2e
```

## Configurar Supabase (cuando se cree el proyecto — spec 001 T030)

1. Crear proyecto en https://supabase.com (sugerido: región `sa-east-1`).
2. `Authentication → Providers → Anonymous`: habilitar.
3. `Settings → API`: copiar la Project URL y la anon key.
4. Editar `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<tu-ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
   ```
5. Aplicar la migración de smoke:
   ```bash
   # Vía CLI supabase (recomendado):
   pnpm supabase:migrate
   # O vía SQL editor del dashboard, pegando el contenido de
   # apps/mobile/supabase/migrations/20260811000000_bootstrap_ping.sql
   ```
6. Regenerar tipos TS:
   ```bash
   pnpm supabase:types
   ```
7. Reiniciar `pnpm --filter mobile web`. La pantalla debe mostrar
   "✓ Conectado a Supabase".

## Troubleshooting

**"Unable to resolve react-refresh/runtime":** falta `.npmrc` con `node-linker=hoisted`. Ver [research.md#r-010](./research.md).

**"Cannot find module '@nivelate/shared'":** correr `pnpm install` desde la **raíz** del monorepo, no dentro de `apps/mobile`.

**Expo Go dice "No connection":** el celular y la PC tienen que estar en la misma WiFi. Alternativa: `pnpm --filter mobile start --tunnel` (usa un tunel de Expo, más lento pero funciona entre redes).

**Playwright falla la primera vez:** correr `pnpm exec playwright install --with-deps chromium`.

**Puerto 8081 ocupado:** `pnpm --filter mobile web --port 8082`.

## Estructura resultante

```
nivelate/
├── .npmrc                 # node-linker=hoisted (crítico para pnpm + Expo)
├── .env / .env.example
├── package.json           # scripts raíz
├── pnpm-workspace.yaml
├── tsconfig.base.json     # TS strict
├── biome.json             # lint + format
├── vercel.ts              # deploy config
├── apps/mobile/           # Expo app (React Native + Web)
├── packages/shared/       # @nivelate/shared (CEFR types, DB types)
├── specs/                 # SDD specs por módulo
└── tests/e2e/             # Playwright
```
