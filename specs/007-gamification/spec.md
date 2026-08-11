# Spec 007 — Gamification (mínima adulta)

> **Estado:** Stub.
> **Depende de:** 003, 005.

## Contexto

Los mecanismos de retención mínimos que discutimos: **racha, XP y logros discretos**. Cero mascotas, cero corazones/vidas, cero ligas semanales.

## Objetivos (borrador)

1. **Racha diaria** — se muestra en el home, se calcula en 003 pero se visualiza acá.
2. **XP** — barra de nivel en el home, XP total en perfil.
3. **Logros** discretos y adultos — tipos:
   - "Primera semana completa" (7 días de racha)
   - "Un mes seguido" (30 días de racha)
   - "1000 palabras aprendidas"
   - "Terminaste la Unidad N"
   - "Completaste todo A2 refresh"
4. **Widgets de progreso CEFR** — el énfasis está acá, no en las medallas. Mostrar "estás al 62% del camino A2 → B1" es más motivador para un adulto que "conseguiste una medalla".

## Anti-objetivos (explícitos)

- **NO** hay mascotas, personajes ni animaciones exageradas.
- **NO** hay vidas / corazones que se pierden.
- **NO** hay ligas semanales o competencia con otros usuarios.
- **NO** hay notificaciones agresivas ("¡Duo te extraña!").

## Requisitos funcionales (borrador)

- FR-001: Widget de racha con animación sutil al incrementar. **Must.**
- FR-002: Barra de XP por nivel — al llenarse, el usuario sube de "nivel de la app" (no confundir con nivel CEFR). **Must.**
- FR-003: Grid de logros — bloqueados con silueta, desbloqueados a color. Sin sonidos fuertes ni celebraciones excesivas. **Should.**
- FR-004: Widget de progreso CEFR — barra por unidad y global A2 → B1. **Must.**
- FR-005: Notificación in-app al desbloquear logro — toast discreto, sin overlay full-screen. **Must.**

## Preguntas abiertas

- [ ] ¿Los "niveles de app" son útiles o redundantes vs. progreso CEFR? Podríamos simplificar y mostrar solo CEFR.
- [ ] ¿Logros con badge visual o solo texto/emoji chico?
- [ ] ¿Push notifications de racha ("no perdás tu racha de 12 días")? En PWA es tricky, decidir con datos.
