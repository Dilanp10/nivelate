# Spec 003 — User Profile & Progress

> **Estado:** Stub.
> **Depende de:** 002-auth.

## Contexto

Cada usuario tiene un perfil con su nivel CEFR actual, XP total, racha y historial de sesiones. Este módulo define el modelo de datos del usuario y las pantallas de perfil / stats.

## Objetivos (borrador)

1. Modelo `profiles` en Supabase (linkeado a `auth.users`).
2. Modelo `user_progress` — tracking por lección/ejercicio.
3. Modelo `xp_events` — log inmutable de eventos que dan XP.
4. Modelo `streaks` — racha diaria calculada.
5. Pantalla "Mi progreso" — nivel actual, XP, racha, % avance por unidad CEFR.
6. Pantalla "Configuración" — cambiar nombre, meta diaria (min por día), idioma UI.

## No-objetivos

- Sistema completo de logros (eso es 007).
- Notificaciones push (post-MVP).
- Compartir progreso en redes.

## Requisitos funcionales (borrador)

- FR-001: Al confirmar email, se crea automáticamente el row en `profiles` (trigger). **Must.**
- FR-002: Cada ejercicio completado emite un `xp_event` con `xp_delta` y `source`. **Must.**
- FR-003: Racha se recalcula en cada sesión completada. Se rompe si pasan 48h sin ejercitar (día 1 = ayer aún cuenta si volvés hoy). **Must.**
- FR-004: Pantalla "Mi progreso" muestra: nivel actual, XP total, racha actual, mejor racha, % por unidad. **Must.**
- FR-005: Meta diaria configurable (5, 10, 15, 20 min). Solo indicativa, no bloquea nada. **Should.**

## Preguntas abiertas

- [ ] ¿"Nivel actual" es único o el usuario puede tener nivel diferente por skill (reading/listening/writing)?
- [ ] ¿La racha permite "congelar día" (pagando XP o similar) o es estricta?
- [ ] ¿Qué se muestra si el usuario nunca completó una lección — estado empty state?
