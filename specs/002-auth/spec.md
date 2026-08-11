# Spec 002 — Auth

> **Estado:** Draft
> **Depende de:** 001-project-bootstrap
> **Última actualización:** 2026-08-11

## Contexto

Sin auth no hay persistencia de progreso — cualquier lección que complete el usuario se pierde. Este módulo cubre registro, login, recuperación de password, verificación de email y onboarding mínimo. Deja la app en un estado donde el resto de módulos pueden asumir "hay un `user_id` disponible".

También es el primer módulo que introduce **NativeWind** (Tailwind para React Native) y establece el patrón de **route groups** de Expo Router (`(auth)/` vs `(protected)/`).

## Objetivos

1. Registro con email + password + verificación por mail obligatoria.
2. Login con email + password.
3. Login alternativo con **magic link** (email OTP).
4. Recuperación de password ("forgot password").
5. Cierre de sesión.
6. Guardas de ruta: `(protected)/*` requiere sesión; `(auth)/*` requiere NO sesión.
7. Onboarding post-verificación: pedir **nombre** + **meta diaria** (5/10/15/20 min).
8. Estado de sesión reactivo global (Zustand + Supabase `onAuthStateChange`).
9. Setup de NativeWind funcional en web y native.

## No-objetivos (fuera de alcance)

- Login social (Google/Apple/GitHub). Se evalúa en un módulo posterior.
- 2FA / MFA. Post-MVP.
- Recuperar cuenta por SMS. Post-MVP.
- Test de nivel inicial durante onboarding. Va en su propio módulo o dentro de 003.
- Modelo completo de `profiles` (XP, racha, historial). Solo se crea la **fila mínima** con `display_name` y `daily_goal_min`; 003 la expande.
- Emails con branding custom / plantillas HTML. En MVP usamos los templates default de Supabase (se puede customizar más adelante).

## Requisitos funcionales

### FR-001: Pantalla `/(auth)/signup`
Formulario con: email (input), password (input, con toggle mostrar/ocultar), botón "Crear cuenta". Valida:
- Email formato válido.
- Password ≥ 8 caracteres, con al menos una letra y un número.

Al submit:
1. Llama `supabase.auth.signUp({ email, password })`.
2. Si Supabase responde `email_confirmed_at: null`, redirige a `/(auth)/verify-email` con el email como query param.
3. Si error, mostrar mensaje en español (mapeo definido en [contracts/auth-flow.md](./contracts/auth-flow.md)).

**Must.**

### FR-002: Pantalla `/(auth)/login`
Formulario con: email, password, botón "Entrar". Enlaces: "¿Olvidaste tu contraseña?" y "Entrar con link mágico" y "Crear cuenta".

Al submit:
1. Llama `supabase.auth.signInWithPassword({ email, password })`.
2. Si éxito y email verificado → redirige a `/(protected)/` (o a `/(onboarding)/` si no completó onboarding).
3. Si éxito pero email NO verificado → redirige a `/(auth)/verify-email`.
4. Errores: "Email o contraseña incorrectos" (no dar pistas de cuál falló).

**Must.**

### FR-003: Pantalla `/(auth)/magic-link`
Un solo input (email) + botón "Enviarme el link". Llama `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })`. Muestra confirmación "Te enviamos un link a X". No revela si el email existe o no (seguridad).

**Should.**

### FR-004: Pantalla `/(auth)/forgot-password`
Un input (email) + botón "Enviar link de recuperación". Llama `supabase.auth.resetPasswordForEmail(email)`. Muestra confirmación genérica.

**Must.**

### FR-005: Pantalla `/(auth)/reset-password`
Ruta que se llega desde el link del email. Detecta el `access_token` en la URL / deep link, y muestra formulario "Nueva contraseña" + "Confirmar contraseña". Llama `supabase.auth.updateUser({ password })`.

**Must.**

### FR-006: Pantalla `/(auth)/verify-email`
Muestra: "Te enviamos un link a `X@Y`. Revisá tu bandeja (y spam)". Botones "Reenviar" y "Cambiar email".
La app hace poll cada 5s a `supabase.auth.getUser()` para detectar cuando el usuario confirmó (típicamente clickea el link en otra pestaña/dispositivo).

**Must.**

### FR-007: Guardas de ruta
- Rutas bajo `(protected)/`: si no hay sesión → redirect a `/(auth)/login`.
- Rutas bajo `(auth)/`: si hay sesión con email verificado y onboarding completo → redirect a `/(protected)/`.
- Ruta `/(onboarding)/`: requiere sesión + email verificado + onboarding NO completo.

**Must.**

### FR-008: Onboarding `/(onboarding)/welcome`
Post verificación de email. Pantalla única con:
- Input "¿Cómo querés que te llamemos?" (default: parte local del email).
- Selector de meta diaria: 5 / 10 / 15 / 20 min.
- Botón "Empezar" (crea fila en `profiles` con estos valores + `onboarded_at = now()`).
- Link "Saltar" (crea fila con `display_name = null, daily_goal_min = 10` (default) + `onboarded_at = now()`).

Al completar → redirect a `/(protected)/`.

**Must.**

### FR-009: Cierre de sesión
Desde `/(protected)/settings` (o menú lateral): botón "Cerrar sesión" → confirma → `supabase.auth.signOut()` → redirect a `/(auth)/login`.

**Must.**

### FR-010: Estado de sesión reactivo
`useAuthStore` (Zustand) expone `{ user, session, isLoading, isOnboarded }`. Se hidrata al montar la app (`supabase.auth.getSession()`) y se mantiene actualizado con `supabase.auth.onAuthStateChange`.

**Must.**

### FR-011: NativeWind configurado
Tailwind classes funcionan en `.tsx` con `className=""` tanto en web como en native. Configuración:
- `tailwind.config.js` con `content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}']`.
- `babel.config.js` con preset `nativewind/babel`.
- `metro.config.js` con `withNativeWind` wrapper.
- Setup de dark mode con `darkMode: 'class'` (por ahora forzamos dark tema, matcheando la home).

**Must.**

## Requisitos no funcionales

- **Rendimiento:** Login/signup debe responder < 2s en 4G (sin contar latencia de red obvia).
- **Accesibilidad:**
  - Inputs con `accessibilityLabel` y `accessibilityHint`.
  - Foco visible al tabular.
  - Mensajes de error asociados a inputs vía `accessibilityErrorMessage` (RN) / `aria-describedby` (web).
  - Contraste WCAG AA.
- **Seguridad:**
  - No revelar si un email está registrado (para "forgot password" y "magic link" mostrar mensaje genérico).
  - Rate limit del lado de Supabase (viene por default, verificar).
  - Passwords nunca en logs ni en analytics.
- **UX:**
  - Botones con estado loading (spinner + texto "Enviando...").
  - Errores inline al lado del campo, no en alertas modales.
  - Al desbloquearse el foco tras loading, el usuario puede reintentar.

## Criterios de aceptación

- [ ] AC-001: Registro con email nuevo redirige a "verify email" y llega el mail a la bandeja.
- [ ] AC-002: Clickear el link del mail redirige a la app y el estado pasa a "email verificado".
- [ ] AC-003: Login con credenciales correctas redirige a onboarding (si nunca lo completó) o a home.
- [ ] AC-004: Login con credenciales inválidas muestra "Email o contraseña incorrectos" (sin filtrar cuál).
- [ ] AC-005: Recuperación de password: mail llega, link abre `/reset-password`, cambiar clave permite loguear con la nueva.
- [ ] AC-006: Magic link: mail llega, link deep-linkea y loguea sin más pasos.
- [ ] AC-007: Sin sesión, navegar a `/(protected)/` redirige a `/login`.
- [ ] AC-008: Con sesión + onboarding completo, navegar a `/login` redirige a `/(protected)/`.
- [ ] AC-009: Onboarding: nombre + meta diaria se guardan en `profiles`.
- [ ] AC-010: Logout limpia sesión y redirige a login.
- [ ] AC-011: NativeWind classes renderizan igual en web y en native (verificado con un componente de referencia).
- [ ] AC-012: Playwright e2e: signup → verify (mockeando link) → onboarding → home → logout funciona.

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Deep links con Supabase en Expo Router web tienen quirks | Alto | Documentar el flow en `research.md`. Usar `emailRedirectTo` explícito. Tests e2e cubren el path. |
| NativeWind + Metro monorepo requiere config precisa | Medio | Aislar en un commit propio (T005). Si falla, quedarse con StyleSheet este módulo. |
| Emails de Supabase caen en spam | Medio | Para MVP aceptable. Documentar en quickstart. Para producción, configurar SMTP custom. |
| Race conditions entre `onAuthStateChange` y guardas de ruta | Medio | Store hidrata sync antes de renderizar `<Slot />` (splash mientras `isLoading`). |
| Password reset en mobile requiere URL scheme configurado | Medio | Usar `nivelate://reset-password` en native, `/reset-password` en web. Config `expo-linking`. |

## Preguntas abiertas

- [ ] ¿Emails custom (branding Nivelate) ya o post-MVP? *Recomendado: post-MVP, usar defaults de Supabase por ahora.*
- [ ] ¿Timeout para el poll de verificación de email (FR-006)? *Sugerido: 5s de intervalo, sin timeout (el usuario ve el estado hasta que confirme o cierre la app).*
- [ ] ¿Guardamos la meta diaria como int (min) o como enum ('short'|'medium'|'long')? *Sugerido: int, para poder calcular estadísticas.*
