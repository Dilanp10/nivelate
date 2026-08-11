# Spec 002 — Auth

> **Estado:** Stub — a completar cuando arranque el módulo.
> **Depende de:** 001-project-bootstrap.

## Contexto

Registro y login de usuarios. Sin esto, no hay persistencia de progreso.

## Objetivos (borrador)

1. Registro con email + password.
2. Login con email + password.
3. Login con magic link (email OTP).
4. Logout.
5. Recuperación de contraseña.
6. Onboarding mínimo tras primer registro (nombre, opcional).

## No-objetivos

- Login social (Google, Apple, etc.) — evaluar en un módulo posterior. Requiere config en cada plataforma.
- 2FA. Post-MVP.
- Test de nivel inicial. Va en 003 o en su propio spec.

## Requisitos funcionales (borrador)

### FR-001: Registro
Formulario email + password. Validación: email formato válido, password ≥ 8 caracteres. Al enviarse, Supabase envía email de confirmación. **Must.**

### FR-002: Login
Email + password. Errores claros en español ("Email o contraseña incorrectos", no dar pistas de cuál falló). **Must.**

### FR-003: Magic link
Alternativa al password: recibir link por email que loguea. **Should.**

### FR-004: Sesión persistente
La sesión se mantiene entre reloads (web) y reaperturas de app (native). **Must.**

### FR-005: Guardas de ruta
Rutas del app (todo salvo `/login`, `/signup`, `/forgot-password`) requieren sesión. Sin sesión → redirect a `/login`. **Must.**

### FR-006: Onboarding post-registro
Tras confirmar email, pedir nombre para mostrar. Skip disponible. **Should.**

## Preguntas abiertas (para resolver al arrancar el módulo)

- [ ] ¿Registro con email + password + magic link o solo magic link? (Solo magic link simplifica pero requiere que el usuario abra el email cada vez.)
- [ ] ¿Requerimos verificación de email antes de acceder al contenido? (Sí = más higiene de la base, No = friction menor.)
- [ ] ¿UX de las pantallas — modales sobre home, o pantallas dedicadas?
- [ ] ¿Integramos NativeWind acá? (Tenemos que estilar 3-4 pantallas.)
