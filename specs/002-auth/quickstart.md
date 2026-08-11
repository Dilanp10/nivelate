# Quickstart — 002 Auth

Este quickstart se completa cuando se ejecuten las tareas T082-T090. Por ahora es un draft del flujo esperado.

## Requisitos previos

- Módulo 001 completo (`pnpm --filter mobile web` levanta la app y muestra "✓ Conectado a Supabase").
- Proyecto Supabase con la migración `profiles` aplicada.
- Supabase Auth configurado (Site URL, redirect URLs, "Confirm email" ON).

## Configurar Supabase Auth (una vez)

Vía dashboard del proyecto Supabase:

1. **Authentication → URL Configuration:**
   - Site URL: `http://localhost:8081`
   - Additional Redirect URLs:
     - `http://localhost:8081/**`
     - `nivelate://**`
     - `https://<tu-dominio-vercel>/**` (cuando esté deployed)

2. **Authentication → Providers → Email:**
   - Habilitar (default).
   - "Confirm email" **ON**.

3. **Authentication → Emails:**
   - Por ahora dejar templates default.
   - Post-MVP: traducir a español.

## Flow de prueba manual

### 1. Registro
1. Levantar `pnpm --filter mobile web`.
2. Abrir http://localhost:8081 → redirige a `/login`.
3. Click "Crear cuenta" → `/signup`.
4. Ingresar email real + password de al menos 8 chars con letra y número.
5. Submit → redirige a `/verify-email`.

### 2. Verificar email
1. Abrir la bandeja del email usado.
2. Click en "Confirm your email".
3. Vuelve a la app; automáticamente (por poll) se detecta la verificación → redirige a `/onboarding/welcome`.

### 3. Onboarding
1. En `/onboarding/welcome`, ingresar un nombre (o dejar el default).
2. Seleccionar meta diaria (10 min).
3. Click "Empezar" → redirige a `/(protected)/` (home).

### 4. Home
- Debería mostrar "Hola, {nombre}" y algún placeholder del futuro contenido.

### 5. Logout
1. Ir a `/(protected)/settings` (por ahora, agregar link/botón visible en home).
2. Click "Cerrar sesión" → confirmar → redirige a `/login`.

### 6. Re-login
1. En `/login`, ingresar el email + password.
2. Submit → redirige directo a `/(protected)/` (ya onboarded).

### 7. Reset password
1. En `/login`, click "¿Olvidaste tu contraseña?" → `/forgot-password`.
2. Ingresar email → submit → mensaje de confirmación.
3. Abrir email, click "Reset password" → aterriza en `/reset-password`.
4. Nueva password (2x) → submit → automáticamente logueado → redirige a home.

### 8. Magic link
1. Logout.
2. En `/login`, click "Entrar con link mágico" → `/magic-link`.
3. Ingresar email → submit.
4. Abrir email, click "Sign in" → aterriza en la app logueado → redirige a home.

## Comandos útiles

```bash
# Regenerar tipos tras cambios de schema
pnpm supabase:types

# Test unitarios (schemas, error mapping, redirect rules)
pnpm test

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# E2E
pnpm test:e2e
```

## Troubleshooting

**El mail no llega:** revisar spam. Supabase free tier tiene rate limits estrictos. Si es persistente, ver en `Authentication → Logs` del dashboard.

**"Email link is invalid or has expired":** los links de Supabase caducan en 1h. Volver a pedirlo.

**Deep link no abre la app (native):** verificar `scheme: "nivelate"` en `app.json` y que la URL sea `nivelate://` (no `https://`).

**Web: reset link me deja en Supabase, no vuelve a la app:** faltó agregar `http://localhost:8081/**` a los Redirect URLs.

**"Invalid login credentials" con creds correctas:** posiblemente el email no esté confirmado. Ver `/verify-email` o mirar `email_confirmed_at` en `auth.users`.
