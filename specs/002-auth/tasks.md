# Tasks — 002 Auth

Cada tarea → un commit. Formato: `<tipo>(002): T### — <descripción>`.

## Fase 1 — Data + config Supabase

- [x] T001 — Migración `20260812000000_profiles.sql` (profiles + trigger `handle_new_user` + RLS + drop `_bootstrap_ping`).
- [x] T002 — Migración aplicada vía MCP `apply_migration` (name: `profiles`).
- [x] T003 — Tipos TS regenerados: `packages/shared/src/database.types.ts` con schema `profiles`.
- [ ] T004 — Configurar Supabase Auth vía dashboard: Site URL `http://localhost:8081`, Additional Redirect URLs `http://localhost:8081/**` y `nivelate://**`, "Confirm email" ON. **Manual — MCP no expone auth config.**
- [x] T004b — Home transitorio ajustado (ya no consulta `_bootstrap_ping` que fue dropeada).

## Fase 2 — NativeWind setup

- [ ] T010 — Agregar deps: `nativewind`, `tailwindcss`, `react-native-css-interop`.
- [ ] T011 — Crear `tailwind.config.js` con tokens semánticos (bg, surface, border, text, muted).
- [ ] T012 — Crear `global.css` con directivas `@tailwind base/components/utilities`.
- [ ] T013 — Actualizar `babel.config.js` con `nativewind/babel`.
- [ ] T014 — Actualizar `metro.config.js` con `withNativeWind`.
- [ ] T015 — Crear `nativewind-env.d.ts`.
- [ ] T016 — Migrar la home actual (`app/index.tsx`) a usar `className=""` como smoke test.

## Fase 3 — Estado y lógica pura (con tests)

- [ ] T020 — `packages/shared/src/auth/types.ts` (Profile, DailyGoal).
- [ ] T021 — `packages/shared/src/auth/validators.ts` (Zod: signup, login, forgot, reset, onboarding) + tests.
- [ ] T022 — `packages/shared/src/auth/error-messages.ts` (mapeo EN→ES) + tests.
- [ ] T023 — `packages/shared/src/auth/redirect-rules.ts` (`computeRedirect`) + tests.
- [ ] T024 — `packages/shared/src/index.ts` re-exporta `./auth/*`.

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
