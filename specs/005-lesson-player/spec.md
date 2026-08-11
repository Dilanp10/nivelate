# Spec 005 — Lesson Player

> **Estado:** Stub.
> **Depende de:** 003, 004.

## Contexto

El motor que renderiza una lección de principio a fin. Es donde el usuario pasa el 90% del tiempo en la app. La UX de este módulo define si el producto se siente "no tedioso".

## Objetivos (borrador)

1. Renderers para cada tipo de ejercicio definido en 004.
2. Flujo de lección: intro → N ejercicios → resumen.
3. Feedback inmediato (correcto/incorrecto + explicación breve en español).
4. Sistema de "re-intento": ejercicios fallados vuelven al final de la lección hasta acertarlos.
5. Registro de XP y de progreso al terminar (dispara `xp_events` de 003).
6. Persistencia de sesión — si el usuario cierra la app en medio de una lección, puede retomar donde iba.

## UX principles del player

- **Un ejercicio por pantalla.** Sin distracciones.
- **Feedback inmediato** — apenas responde, saber si acertó, y por qué.
- **Explicación pedagógica breve** — en español, no más de 2 oraciones por default (expandible).
- **Sin castigo por fallar** — no hay vidas / corazones que se pierden. El único costo es que el ejercicio vuelve al final.
- **Progress bar** discreta arriba, sin countdown de tiempo.

## No-objetivos

- Modo "test cronometrado" (post-MVP).
- Modo social / competitivo dentro de la lección.
- Contenido dinámico generado por LLM.

## Preguntas abiertas

- [ ] ¿Lecciones tienen duración target fija (~5 min) o variable?
- [ ] ¿Al fallar, mostramos la respuesta correcta inmediatamente o dejamos re-intentar en el momento?
- [ ] ¿Animaciones en transiciones — mínimas (fade) o algo con más carácter?
- [ ] ¿Un solo botón "Verificar" al pie o "Enter" también dispara?
