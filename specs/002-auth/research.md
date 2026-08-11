# Research — 002 Auth

Decisiones técnicas del módulo con alternativas evaluadas.

## R-001: Estado de sesión — Zustand vs. React Context vs. React Query

**Decisión:** **Zustand** para la sesión, hidratado desde `supabase.auth.getSession()` y mantenido con `onAuthStateChange`. React Query se agrega también en este módulo para las mutations (`useMutation` de signup/login/logout).

**Por qué Zustand:**
- Cero boilerplate vs. Context (no `Provider` wrapping toda la app).
- Selectors granulares evitan re-renders innecesarios.
- `subscribe` fuera de React (útil para el listener de Supabase).

**Alternativas descartadas:**
- **Context:** re-renderiza todo el árbol al cambiar el valor. Fine para valores estables, no ideal para sesión que cambia.
- **Solo React Query:** funciona con `useQuery` sobre `getSession`, pero el listener de Supabase no calza natural con React Query.

## R-002: NativeWind — setup en Expo SDK 52 + monorepo pnpm

**Decisión:** NativeWind v4 con `withNativeWind` en `metro.config.js`.

**Config esperada:**

```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Placeholder — evolucionamos el design system en módulos posteriores.
        bg: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        text: '#f8fafc',
        muted: '#94a3b8',
      },
    },
  },
  plugins: [],
};
```

```js
// babel.config.js
module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
// ...existing monorepo config...
module.exports = withNativeWind(config, { input: './global.css' });
```

**Alternativas descartadas:**
- **StyleSheet inline:** verbose para 5 pantallas nuevas. Además queremos diferencial estético para el resto de módulos.
- **Tamagui:** más potente pero curva mayor. Overkill hoy.
- **Restyle (Shopify):** buen sistema pero menos ecosistema.

## R-003: Route groups de Expo Router

**Decisión:** Tres grupos:
- `app/(auth)/` — login, signup, forgot-password, reset-password, magic-link, verify-email
- `app/(onboarding)/` — welcome
- `app/(protected)/` — home + resto del app (los módulos siguientes agregan pantallas acá)

Cada grupo tiene su `_layout.tsx` que aplica la guarda correspondiente:
- `(auth)/_layout.tsx` — redirect a `/(protected)/` si hay sesión + onboarded.
- `(onboarding)/_layout.tsx` — redirect a `/(auth)/login` si no hay sesión, a `/(protected)/` si ya está onboarded.
- `(protected)/_layout.tsx` — redirect a `/(auth)/login` si no hay sesión, a `/(onboarding)/welcome` si sesión pero no onboarded.

El `app/_layout.tsx` raíz muestra un splash mientras `useAuthStore.isLoading === true`.

## R-004: Métodos de auth de Supabase que usamos

| Método | Cuándo | Notas |
|--------|--------|-------|
| `signUp({email, password})` | Registro FR-001 | Con email confirmation activada (default en Supabase). |
| `signInWithPassword({email, password})` | Login FR-002 | Devuelve error si email no confirmado (dependiendo del setting). |
| `signInWithOtp({email, options: {emailRedirectTo}})` | Magic link FR-003 | El link deep-linkea a la app. |
| `resetPasswordForEmail(email, {redirectTo})` | Forgot FR-004 | Envía link a `redirectTo`. |
| `updateUser({password})` | Reset FR-005 | Se llama con la sesión temporal que crea el link de reset. |
| `signOut()` | Logout FR-009 | Limpia sesión local + revoca refresh token. |
| `onAuthStateChange(cb)` | Store FR-010 | Se suscribe una vez al iniciar. |
| `getSession()` | Hidratación inicial | Al montar la app, antes de renderizar rutas. |

## R-005: Deep linking — web vs. native

**Web:** el redirect URL es `https://tu-dominio/(auth)/reset-password` (o el equivalente en local: `http://localhost:8081/reset-password`).

**Native:** el URL scheme es `nivelate://reset-password` (definido en `app.json` como `scheme: "nivelate"`).

**Config en Supabase Dashboard → Authentication → URL Configuration:**
- **Site URL:** `http://localhost:8081` (dev). En prod, la URL de Vercel.
- **Additional Redirect URLs:**
  - `http://localhost:8081/**`
  - `nivelate://**`
  - (más tarde) `https://nivelate.vercel.app/**`

**Handling en la app:** `expo-linking` + `useURL()` en `app/_layout.tsx` para capturar los tokens y llamar `supabase.auth.setSession`. Detalle en `plan.md`.

## R-006: Verificación de email — flow

Con Supabase, cuando `signUp` se completa:
- El usuario existe en `auth.users` con `email_confirmed_at = NULL`.
- Supabase envía un mail con link `https://<project>.supabase.co/auth/v1/verify?token=...&type=email&redirect_to=<Site URL>`.
- Al clickear, Supabase valida el token y redirige a Site URL con parámetros de sesión.
- Nuestra app lee los parámetros (o `getSession()` post-redirect) y actualiza el store.

**En FR-002 (login):** si el user tiene `email_confirmed_at = NULL`, redirigimos a `/(auth)/verify-email`. Ahí polleamos cada 5s hasta que se confirme.

## R-007: `profiles` table — mínima ahora, expande 003

**Decisión:** Crear `profiles` en este módulo con solo los campos que necesita el onboarding. 003 (user-profile-progress) le agrega columnas para XP, racha, nivel actual, etc.

```sql
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  daily_goal_min int not null default 10 check (daily_goal_min in (5, 10, 15, 20)),
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);
```

**Trigger:** al `insert` en `auth.users` (via signup), crear automáticamente la fila en `profiles` con defaults. Así la app siempre puede asumir "existe una fila para el user".

Ver [data-model.md](./data-model.md) para el SQL completo.

## R-008: Validación de forms — Zod + `react-hook-form`? Manual?

**Decisión:** Validación **manual** con Zod schemas (sin react-hook-form).

**Por qué:**
- Los forms son cortos (2-3 campos).
- react-hook-form + resolvers añade dependencias y peso.
- Con Zustand local por form es suficiente y controlable.

**Patrón:**

```ts
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});
type LoginForm = z.infer<typeof loginSchema>;
```

Componente maneja `useState<LoginForm>` + `useState<Partial<Record<keyof LoginForm, string>>>` para errores.

## R-009: Testing de auth flows

**Vitest (unitario):** validaciones de Zod schemas + reducers/actions del store.

**Playwright (e2e):** el flow completo es difícil de testear en CI porque requiere abrir emails reales. Estrategia:
- **Local dev:** desactivar temporalmente confirmación de email en Supabase dev, correr flow completo.
- **CI:** usar `signInWithOtp` con un email test + interceptar el mail vía **Supabase Inbucket** (email server local que viene con `supabase start`). O más simple: crear un test user vía service_role key y hacer `admin.updateUserById` para marcar `email_confirmed`.

Para 002 nos alcanza con:
1. Test unitarios de schemas y helpers.
2. Test e2e de "form de login renderiza y valida" (sin submit real).
3. Test e2e completo diferido a cuando tengamos Supabase local.

## R-010: Mapeo de errores de Supabase a español

Supabase devuelve errors con `error.message` en inglés (ej. "Invalid login credentials"). Mapear a strings en español mantenidos en `packages/shared/src/auth/error-messages.ts`.

```ts
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'Email not confirmed': 'Confirmá tu email antes de entrar',
  'User already registered': 'Ya existe una cuenta con este email',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres',
  // ... completar
};

export function toSpanishError(error: { message: string } | null): string {
  if (!error) return '';
  return AUTH_ERROR_MESSAGES[error.message] ?? 'Ocurrió un error. Intentá de nuevo.';
}
```
