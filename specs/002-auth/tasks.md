# Tasks — 002 Auth

Cada tarea → un commit. Formato: `<tipo>(002): T### — <descripción>`.

## Fase 1 — Data + config Supabase

- [x] T001 — Migración `20260812000000_profiles.sql` (profiles + trigger `handle_new_user` + RLS + drop `_bootstrap_ping`).
- [x] T002 — Migración aplicada vía MCP `apply_migration` (name: `profiles`).
- [x] T003 — Tipos TS regenerados: `packages/shared/src/database.types.ts` con schema `profiles`.
- [ ] T004 — Configurar Supabase Auth vía dashboard: Site URL `http://localhost:8081`, Additional Redirect URLs `http://localhost:8081/**` y `nivelate://**`, "Confirm email" ON. **Manual — MCP no expone auth config.**
- [x] T004b — Home transitorio ajustado (ya no consulta `_bootstrap_ping` que fue dropeada).
- [x] T005 — Migración `20260812010000_harden_profile_functions.sql`: fix de 3 advertencias del security advisor (`search_path` mutable en `set_updated_at`; `handle_new_user` expuesta como RPC a `anon` y `authenticated`). Trigger verificado post-fix con usuario de prueba.
- [x] T006 — Migración `20260812020000_optimize_profiles_rls.sql`: fix de 2 advertencias de performance (`auth.uid()` re-evaluado por fila → `(select auth.uid())`).
- [x] T007 — Convenciones de seguridad de funciones y RLS documentadas en `AGENTS.md` y `data-model.md`. **Security y performance advisors en cero.**

## Fase 2 — NativeWind setup ✅

- [x] T010 — Deps agregadas: `nativewind@4`, `tailwindcss@3`, `react-native-worklets` (peer de reanimated 3.16+, faltaba y rompía el bundle Babel).
- [x] T011 — `tailwind.config.js` con tokens semánticos (bg, surface, border, text, muted, brand, danger).
- [x] T012 — `global.css` con directivas `@tailwind`.
- [x] T013 — `babel.config.js` con `jsxImportSource: 'nativewind'` + preset `nativewind/babel`.
- [x] T014 — `metro.config.js` envuelto en `withNativeWind(config, { input: './global.css' })`.
- [x] T015 — `nativewind-env.d.ts` + agregado a `tsconfig.json` include.
- [x] T016 — Home migrada a `className=""`. **Verificado en browser:** `bg-bg`→rgb(15,23,42), `bg-surface`→rgb(30,41,59), `border-border`→rgb(51,65,85), `text-text`→rgb(248,250,252), `text-5xl font-bold`→48px/700.
- [x] T017 — `import '../global.css'` en `app/_layout.tsx` (requisito de NativeWind v4 para que las clases se apliquen en web).

## Fase 3 — Estado y lógica pura (con tests) ✅

- [x] T020 — `auth/types.ts`: `Profile`, `DailyGoal`, `DAILY_GOAL_LABELS`, `AuthState` discriminada.
- [x] T021 — `auth/validators.ts`: schemas Zod (signup, login, magicLink, forgot, reset, onboarding) + `toFieldErrors`. **17 tests.**
- [x] T022 — `auth/error-messages.ts`: `toSpanishAuthError` con mapeo exacto + detección de rate limit por regex. **7 tests.**
- [x] T023 — `auth/redirect-rules.ts`: `computeDestination`, `canAccessProtected`, `shouldSeeAuthScreens`. **9 tests.**
- [x] T024 — `packages/shared/src/index.ts` re-exporta `./auth`. `zod` agregada como dependency de shared.

**Total: 36 tests verdes** (33 de auth + 3 de CEFR). Typecheck y lint limpios.

## Fase 4 — Cliente y hooks

- [ ] T030 — `apps/mobile/src/lib/query-client.ts` (`QueryClient` singleton).
- [x] T031 — `lib/auth-redirect.ts`: `getRedirectUrl` (web usa `window.location.origin`, native `Linking.createURL`).
- [x] T032 — `stores/auth.ts`: Zustand con `hydrate()`, `subscribe()` (onAuthStateChange), `refreshProfile()`.
- [x] T033 — 7 hooks en `src/hooks/`: signUp, signIn, magicLink, forgotPassword, resetPassword, logout, onboarding.

## Fase 5 — UI reutilizable ✅

- [x] T040 — `ui/Button.tsx` (primary/secondary/ghost + loading + accessibilityState).
- [x] T041 — `ui/Input.tsx` (label + error inline + hint + secureToggle).
- [x] T042 — `ui/ScreenLayout.tsx` (SafeArea + KeyboardAvoidingView + scroll + ancho máx md).
- [x] T043 — `ui/FormError.tsx` (banner de error de submit).
- [x] T044 — `ui/Splash.tsx`.

## Fase 6 — Route groups + guards ✅

- [x] T050 — `app/_layout.tsx`: QueryClientProvider + SafeAreaProvider + hydrate/subscribe + Splash.
- [x] T051 — `(auth)/_layout.tsx` con guard (redirige si ya hay sesión).
- [x] T052 — `(onboarding)/_layout.tsx` con guard.
- [x] T053 — `(protected)/_layout.tsx` con guard.
- [x] T054 — Home movida a `(protected)/index.tsx`; `index.tsx` transitorio eliminado.
- [x] **Verificado en browser:** sin sesión, `/` redirige a `/login` y el form renderiza con NativeWind.

## Fase 7 — Pantallas de auth ✅

- [x] T060 — `signup.tsx`.
- [x] T061 — `login.tsx`.
- [x] T062 — `verify-email.tsx` (poll cada 5s a getUser + reenviar).
- [x] T063 — `magic-link.tsx`.
- [x] T064 — `forgot-password.tsx`.
- [x] T065 — `reset-password.tsx`.
- [x] T066 — `callback.tsx` (landing de deep links).

## Fase 8 — Onboarding + settings ✅

- [x] T070 — `(onboarding)/welcome.tsx` (nombre + meta diaria, Empezar/Saltar).
- [x] T071 — `(protected)/settings.tsx` con logout.

## Fase 9 — Testing + cierre

- [x] T080 — `pnpm typecheck && pnpm lint && pnpm test` verde (36 tests unitarios).
- [ ] T081 — Test e2e Playwright: signup form renderiza y valida. *Pendiente.*
- [ ] T082 — **BLOQUEADO por T004 (config de auth en el dashboard).** Test manual del flow completo: registro → verify (link real) → onboarding → home → logout → login → home.
- [ ] T090 — Completar `quickstart.md` con el flow verificado (después de T082).
- [x] T091 — Convenciones nuevas ya documentadas en `AGENTS.md` (seguridad de funciones + RLS) durante T005-T007.
- [ ] T099 — PR `feat(002): auth` → merge a main. *Después de validar el flow con Supabase configurado.*

## Nota sobre `typedRoutes`

Se desactivó `experiments.typedRoutes` en `app.json`: regeneraba `.expo/types/router.d.ts` desde un árbol de rutas viejo y hacía fallar el typecheck. Reactivar cuando el árbol de rutas esté estable (probablemente al cerrar el módulo).
