# Quickstart — 001 Project Bootstrap

Objetivo: clonar el repo y tener la app corriendo en < 15 min.

> ⚠️ **Nota:** este quickstart se completa durante las tareas T090. Los comandos exactos se validan corriéndolos en Windows 11 (entorno del dueño del repo) y luego en un ambiente limpio.

## Requisitos previos

- **Node.js 20 LTS+** — `node --version` debe decir v20.x.x o superior.
- **pnpm 9+** — `npm i -g pnpm`.
- **Git**.
- **Expo Go** en tu celular (opcional, solo si querés probar en dispositivo).
- Cuenta Supabase (gratis).
- Cuenta Vercel (gratis, opcional para deploy).

## Setup

```bash
# 1. Clonar
git clone <repo-url>
cd "ingles a2 a b2"

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con las claves de tu proyecto Supabase:
#   EXPO_PUBLIC_SUPABASE_URL=https://<tu-ref>.supabase.co
#   EXPO_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>

# 4. Correr la app en web
pnpm --filter mobile web
# Abrir http://localhost:8081
# Deberías ver: "✓ Conectado a Supabase"

# 5. (Opcional) Correr en tu celular
pnpm --filter mobile start
# Escanear el QR con Expo Go
```

## Verificar que todo funciona

```bash
# Lint
pnpm lint

# Tests unitarios
pnpm test

# Tests e2e (requiere que la app esté corriendo en localhost:8081)
pnpm test:e2e
```

## Setup del proyecto Supabase (una sola vez, quien crea el proyecto)

Estos pasos ya están hechos en el proyecto Supabase original; solo se documentan por si hace falta recrear el ambiente.

1. Crear proyecto en https://supabase.com (región `sa-east-1` sugerida).
2. En `Authentication → Providers`, habilitar "Anonymous Sign-ins".
3. Copiar URL y anon key a `.env`.
4. Aplicar migraciones:
   ```bash
   pnpm supabase:migrate
   ```
5. Regenerar tipos TS:
   ```bash
   pnpm supabase:types
   ```

## Troubleshooting

**"Cannot find module '@app/shared'":** correr `pnpm install` desde la raíz, no dentro de `apps/mobile`.

**"Environment variable EXPO_PUBLIC_SUPABASE_URL is required":** falta el `.env` en la raíz. Copiar de `.env.example`.

**Expo Go dice "No connection":** el celular y la PC tienen que estar en la misma WiFi. Alternativamente, usar tunel: `pnpm --filter mobile start --tunnel`.

**Playwright falla la primera vez:** correr `pnpm exec playwright install --with-deps chromium`.
