# Plan — 002 Auth

Cómo vamos a implementar el spec.

## Arquitectura del módulo

```
apps/mobile/
├── app.json                          # scheme "nivelate", deep linking
├── babel.config.js                   # + preset nativewind/babel
├── metro.config.js                   # + withNativeWind wrapper
├── tailwind.config.js                # NUEVO
├── global.css                        # NUEVO — directivas @tailwind
├── nativewind-env.d.ts               # NUEVO — types
│
├── app/
│   ├── _layout.tsx                   # Splash + hidratación auth + <Slot />
│   ├── index.tsx                     # DEL/mover — redirige según auth state
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx               # Guard: redirect si ya hay sesión completa
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   ├── magic-link.tsx
│   │   ├── verify-email.tsx
│   │   └── callback.tsx              # OAuth-style callback para deep links
│   │
│   ├── (onboarding)/
│   │   ├── _layout.tsx               # Guard: requiere session + verified + !onboarded
│   │   └── welcome.tsx
│   │
│   └── (protected)/
│       ├── _layout.tsx               # Guard: requiere session + verified + onboarded
│       ├── index.tsx                 # Home placeholder
│       └── settings.tsx              # Solo con logout por ahora
│
├── src/
│   ├── stores/
│   │   └── auth.ts                   # Zustand store
│   ├── lib/
│   │   ├── supabase.ts               # (existente)
│   │   ├── auth-redirect.ts          # helper para redirect URLs
│   │   └── query-client.ts           # React Query client
│   ├── hooks/
│   │   ├── useSignUp.ts              # useMutation
│   │   ├── useSignIn.ts
│   │   ├── useMagicLink.ts
│   │   ├── useForgotPassword.ts
│   │   ├── useResetPassword.ts
│   │   ├── useLogout.ts
│   │   └── useOnboarding.ts
│   └── ui/                           # componentes reutilizables
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── ScreenLayout.tsx
│       ├── FormError.tsx
│       └── Splash.tsx
│
└── supabase/migrations/
    ├── 20260811000000_bootstrap_ping.sql     # (existente)
    └── 20260812000000_profiles.sql           # NUEVO

packages/shared/
└── src/
    ├── auth/
    │   ├── types.ts                   # Profile, DailyGoal
    │   ├── validators.ts              # Zod schemas
    │   ├── error-messages.ts          # mapeo EN → ES
    │   └── redirect-rules.ts          # computeRedirect pura
    ├── database.types.ts              # regenerado
    └── index.ts                       # re-exporta
```

## Orden de implementación

Los tests unitarios (schemas, error mapping, redirect rules) se escriben **junto** con el código. Los e2e van al final del módulo.

### Fase 1: Data + config

1. **Migración `profiles`** — crear archivo + aplicar vía MCP + regenerar tipos.
2. **Configurar Supabase Auth** en el dashboard (Site URL, redirect URLs, email templates básicos).
3. **NativeWind setup** — deps, config, `global.css`, verificar que una pantalla renderiza con clases.

### Fase 2: Estado + lógica pura

4. **`packages/shared/src/auth/*`** — types, validators (Zod), error messages, redirect rules. Con tests.
5. **`src/stores/auth.ts`** — Zustand store con estado + acciones.
6. **`src/lib/query-client.ts`** — React Query client + provider.
7. **`src/lib/auth-redirect.ts`** — helper URLs.

### Fase 3: UI reutilizable

8. **`src/ui/*`** — Button, Input, ScreenLayout, FormError, Splash. Todos con NativeWind classes.

### Fase 4: Route groups + guards

9. **`app/_layout.tsx`** — provider React Query + hidratación auth + splash mientras loading.
10. **`app/(auth)/_layout.tsx`, `(onboarding)/_layout.tsx`, `(protected)/_layout.tsx`** — con `<Redirect>` según `computeRedirect`.
11. **Mover** la home actual (`app/index.tsx`) a `app/(protected)/index.tsx` y adaptar.

### Fase 5: Pantallas de auth

12. **`signup.tsx`** + hook `useSignUp`.
13. **`login.tsx`** + hook `useSignIn`.
14. **`verify-email.tsx`** con poll.
15. **`magic-link.tsx`** + hook `useMagicLink`.
16. **`forgot-password.tsx`** + hook `useForgotPassword`.
17. **`reset-password.tsx`** + hook `useResetPassword`.
18. **`callback.tsx`** — captura deep link, llama `setSession`.

### Fase 6: Onboarding

19. **`(onboarding)/welcome.tsx`** + hook `useOnboarding` (upsert profile).

### Fase 7: Cierre

20. **`(protected)/settings.tsx`** con logout.
21. **Tests e2e Playwright** — happy path.
22. **Docs** — quickstart validado.
23. **PR** feat(002): auth.

## Decisiones de arquitectura clave

- **Un solo Zustand store** para toda la auth (`useAuthStore`), no varios.
- **React Query** para mutations, no para el estado de sesión (ese es del store).
- **NativeWind classes** pero con **tokens semánticos** (`bg-bg`, `text-text`, `border-border`) definidos en `tailwind.config.js` — así no dependemos de tailwind puros como `bg-slate-900` que atan la paleta.
- **Guards por `_layout.tsx`** de cada grupo — Expo Router hace este pattern idiomático con `<Redirect>`.
- **No `zustand/persist`** — la persistencia de sesión la maneja `@supabase/supabase-js` con AsyncStorage/localStorage.

## Config Supabase Auth (fuera del código)

Vía MCP o dashboard antes de correr los tests:
1. **URL Configuration → Site URL:** `http://localhost:8081` (dev).
2. **URL Configuration → Redirect URLs:** `http://localhost:8081/**`, `nivelate://**`.
3. **Email Templates:** dejar defaults por MVP. Traducir al español post-MVP.
4. **Providers → Email:** habilitado (default). "Confirm email" ON.
5. **Providers → Anonymous:** deshabilitado (no lo usamos).

## Fuera del plan

- Login con Google/Apple → módulo posterior.
- Emails custom con branding → post-MVP.
- Onboarding con test de nivel → módulo aparte.
- Recuperación via SMS → post-MVP.
