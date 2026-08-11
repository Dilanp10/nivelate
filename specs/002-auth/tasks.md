# Tasks — 002 Auth

Cada tarea → un commit. Formato: `<tipo>(002): T### — <descripción>`.

## Fase 1 — Data + config Supabase

- [x] T001 — Migración `20260812000000_profiles.sql` (profiles + trigger `handle_new_user` + RLS + drop `_bootstrap_ping`).
- [x] T002 — Migración aplicada vía MCP `apply_migration` (name: `profiles`).
- [x] T003 — Tipos TS regenerados: `packages/shared/src/database.types.ts` con schema `profiles`.
- [ ] T004 — Configurar Supabase Auth vía dashboard: Site URL `http://localhost:8081`, Additional Redirect URLs `http://localhost:8081/**` y `nivelate://**`, "Confirm email" ON. **Manual — MCP no expone auth config.**
- [x] T004b — Home transitorio ajustado (ya no consulta `_bootstrap_ping` que fue dropeada).

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
- [ ] T031 — `apps/mobile/src/lib/auth-redirect.ts` (helper redirect URLs web/native).
- [ ] T032 — `apps/mobile/src/stores/auth.ts` (Zustand store con hidratación + listener).
- [ ] T033 — Hooks `useSignUp`, `useSignIn`, `useMagicLink`, `useForgotPassword`, `useResetPassword`, `useLogout`, `useOnboarding` en `apps/mobile/src/hooks/`.

## Fase 5 — UI reutilizable

- [ ] T040 — `src/ui/Button.tsx` (primary/secondary/ghost, loading, disabled).
- [ ] T041 — `src/ui/Input.tsx` (label, error, secureToggle).
- [ ] T042 — `src/ui/ScreenLayout.tsx` (padding, SafeArea, título opcional).
- [ ] T043 — `src/ui/FormError.tsx`.
- [ ] T044 — `src/ui/Splash.tsx`.

## Fase 6 — Route groups + guards

- [ ] T050 — Refactor `app/_layout.tsx` para hidratar auth + montar QueryClientProvider + splash.
- [ ] T051 — Crear `app/(auth)/_layout.tsx` con guard.
- [ ] T052 — Crear `app/(onboarding)/_layout.tsx` con guard.
- [ ] T053 — Crear `app/(protected)/_layout.tsx` con guard.
- [ ] T054 — Mover home a `app/(protected)/index.tsx`.

## Fase 7 — Pantallas de auth

- [ ] T060 — `app/(auth)/signup.tsx`.
- [ ] T061 — `app/(auth)/login.tsx`.
- [ ] T062 — `app/(auth)/verify-email.tsx` (con poll).
- [ ] T063 — `app/(auth)/magic-link.tsx`.
- [ ] T064 — `app/(auth)/forgot-password.tsx`.
- [ ] T065 — `app/(auth)/reset-password.tsx`.
- [ ] T066 — `app/(auth)/callback.tsx` (deep link handler).

## Fase 8 — Onboarding + settings

- [ ] T070 — `app/(onboarding)/welcome.tsx`.
- [ ] T071 — `app/(protected)/settings.tsx` con logout.

## Fase 9 — Testing + cierre

- [ ] T080 — `pnpm typecheck && pnpm lint && pnpm test` verde.
- [ ] T081 — Test e2e Playwright: signup form renderiza y valida.
- [ ] T082 — Test manual completo del flow: registro → verify (link real) → onboarding → home → logout → login → home. Documentar en `quickstart.md`.
- [ ] T090 — Completar `quickstart.md` con el flow verificado.
- [ ] T091 — Actualizar `AGENTS.md`/`CLAUDE.md` si aparecen convenciones nuevas.
- [ ] T099 — PR `feat(002): auth` → merge a main.
