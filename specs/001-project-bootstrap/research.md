# Research — 001 Project Bootstrap

Decisiones técnicas y alternativas evaluadas.

## R-001: Monorepo — pnpm workspaces vs. Turborepo vs. Nx

**Decisión:** pnpm workspaces sin Turbo/Nx al inicio.

**Por qué:**
- Simple, sin capa extra que aprender.
- El proyecto empieza con 2 packages. Turbo se justifica cuando hay 5+ y builds lentos.
- Migrar de pnpm workspaces a Turbo después es trivial (agregar `turbo.json`).

**Alternativas descartadas:**
- **Turborepo:** overkill al inicio, cache remoto irrelevante para 1 dev.
- **Nx:** más pesado, generators potentes pero curva de aprendizaje.
- **Bun workspaces:** todavía inmaduro para Expo + Metro en 2026.

## R-002: Framework mobile — Expo Router vs. React Navigation puro

**Decisión:** Expo Router (file-based routing).

**Por qué:**
- Convención file-based hace onboarding más rápido.
- Soporte nativo de web + native con la misma estructura.
- Deep linking gratis.

**Alternativas descartadas:**
- **React Navigation puro:** más control pero más código boilerplate por pantalla.

## R-003: Cliente Supabase — storage adapter

**Decisión:** `@react-native-async-storage/async-storage` en native, `localStorage` en web (fallback default de `@supabase/supabase-js`).

**Por qué:** Es el pattern oficial documentado. `AsyncStorage` en web no funciona.

**Snippet de referencia:**
```ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);
```

## R-004: Linter/Formatter — Biome vs. ESLint + Prettier

**Decisión:** Biome.

**Por qué:**
- Un solo tool, config única, ~10-20x más rápido.
- Cero configuración razonable por default.
- Ya soporta React/JSX/TSX.

**Alternativas descartadas:**
- **ESLint + Prettier:** estándar pero dos configs, más lento, plugin de Expo tiene sus quirks.

## R-005: Testing — Vitest vs. Jest

**Decisión:** Vitest para unit, Playwright para e2e.

**Por qué Vitest sobre Jest:**
- Más rápido, ESM nativo, misma API pero mejor DX.
- Expo/React Native con Jest tiene setup pesado. Como el grueso de la lógica testeable vive en `packages/shared` (pura), Vitest cubre.

**Componentes React Native:** los testeamos con Playwright contra el build web (que representa el 90% de la experiencia y es más barato de correr).

## R-006: Estilos — NativeWind vs. StyleSheet vs. Tamagui

**Decisión (para 001):** StyleSheet inline. Migrar a NativeWind en 002.

**Por qué diferirlo:**
- El bootstrap solo tiene 1 pantalla placeholder. NativeWind agrega config de Babel + Metro que puede romper Vercel build.
- Introducirlo en 002 (auth) cuando ya hay 2-3 pantallas justifica el setup.

## R-007: Deploy — Vercel vs. Netlify vs. Cloudflare Pages

**Decisión:** Vercel.

**Por qué:**
- Zero-config para Next.js/Expo web.
- Preview URLs por PR gratis.
- El entorno actual tiene skills de Vercel disponibles.
- Plan free suficiente para MVP.

**Config con `vercel.ts`:**
```ts
// vercel.ts (raíz del monorepo)
import type { VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: 'pnpm --filter mobile export:web',
  outputDirectory: 'apps/mobile/dist',
  framework: null,
  installCommand: 'pnpm install --frozen-lockfile',
};
```

## R-008: Supabase — región

**Sugerencia:** `sa-east-1` (São Paulo). Latencia baja desde LatAm. Confirmar con el usuario si el público objetivo es LatAm o global.

## R-009: Ambiente de desarrollo Windows

El usuario está en Windows 11. Consideraciones:
- pnpm funciona bien en Windows.
- Expo requiere que el celular esté en la misma red WiFi (o usar tunel).
- Playwright en Windows requiere `pnpm exec playwright install` la primera vez.
- Evitar comandos POSIX-only en scripts npm (usar `cross-env` si hace falta setear env vars).

## R-010: pnpm + Expo — `node-linker=hoisted` es obligatorio

**Decisión:** `.npmrc` con `node-linker=hoisted` en la raíz del repo.

**Por qué:** El modo default de pnpm (`isolated`, con symlinks a `.pnpm/`) rompe Metro y Expo Router. Se manifiesta como:
- `Unable to resolve "react-refresh/runtime"` (peer dep sin hoisting)
- `Unable to resolve "@expo/metro-runtime/src/error-overlay/ErrorOverlay"`
- Bundle web falla, aunque las deps estén instaladas.

`node-linker=hoisted` hace que pnpm arme un `node_modules` plano tipo npm/yarn, que es lo que Metro espera. Perdemos la isolación estricta de pnpm pero es el trade-off documentado por Expo para monorepos.

**Otras entradas relevantes en `.npmrc`:**
- `strict-peer-dependencies=false` — Expo tiene peer deps laxas.
- `auto-install-peers=true` — evita re-runs de install cuando aparecen nuevas peer deps.

## R-011: Bootstrap web output `single` vs `static`

**Decisión:** `expo.web.output = "single"` en `app.json`.

**Por qué:** `"static"` intenta pre-renderizar todas las rutas y falla si falta el favicon o si hay side effects en imports (nuestro `@supabase/supabase-js` en el módulo del cliente rompe SSR). `"single"` genera una SPA clásica que rendera todo en el browser — sin sorpresas.

Cuando el módulo 008-offline-pwa arme el service worker, se puede reevaluar si conviene volver a `"static"` para SEO / carga inicial más rápida.
