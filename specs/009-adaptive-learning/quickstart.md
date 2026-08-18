# Quickstart — 009 Aprendizaje adaptativo

Cómo probar el módulo end-to-end una vez implementado.

## Setup

1. Aplicar la migración: `20260819000000_adaptive_learning.sql`.
2. Poblar contenido: correr el seed script — debería insertar teaching cards, ejemplos y highlights de las lecciones que ya tengan esas secciones en el JSON.
3. `pnpm --filter mobile web` para arrancar la app en `http://localhost:8081`.

## Probar teaching cards + adaptación por goal

1. Crear (o loguearse con) 2 usuarios de prueba con **distintos goals**:
   - **User A**: onboarding con `learning_goal = 'travel'`, `self_level = 'zero'`.
   - **User B**: onboarding con `learning_goal = 'work'`, `self_level = 'zero'`.
2. Abrir una lección con teaching cards (ej. U1L1 después de correr el seed).
3. **Verificar en User A**: los ejemplos de las cards tienen contexto de viaje (ej. "I have visited Paris"). Si un ejemplo no tiene versión travel, ver el fallback general.
4. **Verificar en User B**: la misma lección muestra ejemplos de trabajo (ej. "She has worked here for five years") en las mismas cards.
5. Confirmar que la estructura de la card (título + cuerpo + N ejemplos) es idéntica entre usuarios; solo cambia el contenido de los ejemplos.

## Probar el audio 🔊

1. En una teaching card, hacer click en 🔊 al lado de un ejemplo.
2. Debería escucharse el audio en inglés (Web Speech API, `en-US`, rate ~0.9).
3. En un navegador sin `speechSynthesis`, el botón queda deshabilitado (tooltip "Audio no disponible en este navegador").

## Probar la pantalla de pronunciación

1. Completar todos los ejercicios de una lección con `pronunciationHighlights` (ej. U1L1).
2. **Antes** del summary de XP, debería aparecer una pantalla "Cómo suena lo que aprendiste" con las frases clave, su respelling debajo (ej. `hello → je-lóu`), y botones 🔊.
3. Hacer click en 🔊 por cada frase — verificar audio.
4. Click en "Continuar" → pasa al summary de XP normal.
5. Completar una lección **sin** highlights (contenido viejo o sin curar) → la pantalla se salta, va directo al summary.

## Probar adaptación por nivel (punto de arranque)

1. Crear 3 usuarios con distintos `self_level`:
   - **User Zero**: `self_level = 'zero'` → dashboard debería mostrar U1 como CTA principal.
   - **User Convo**: `self_level = 'conversational'` → dashboard muestra U2 como CTA. En Progreso, U1 aparece con badge "Opcional — repaso".
   - **User Inter**: `self_level = 'intermediate'` → dashboard muestra U3 como CTA. En Progreso, U1 y U2 con badge "Opcional — repaso".
2. Verificar que las unidades marcadas como opcional **siguen navegables** desde /progress (no bloqueadas).
3. En User Inter o User Convo, verificar que el header de U3/U2 muestra el enlace "¿Muy difícil? Empezá desde el principio →" que lleva a U1L1.
4. En User Zero, ese enlace **no** aparece (arrancó de cero, no saltó nada).

## Probar el progress bar

1. Abrir una lección con 3 teaching cards + 8 ejercicios.
2. El progress bar debería mostrar `1/11` al empezar (primera card).
3. Cada card completada avanza 1. Cada ejercicio (correcto o no) también.
4. Al terminar, el total refleja las 11 unidades.

## Verificación técnica

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e
```

Todo verde. E2E de `lesson-flow` debería cubrir teaching cards + pantalla de pronunciación.

## Notas

- **Contenido faltante**: si una lección no tiene `teachingCards`, la lección arranca directo en ejercicios (como en el módulo 005 original — sin regresión).
- **Sin XP por teaching cards**: solo los ejercicios otorgan XP.
- **Respelling**: usar la convención de `docs/pronunciation-guide.md` al agregar highlights nuevos.
- **Cambiar goal/nivel**: para el MVP, se define en onboarding y no cambia. Cambio en runtime queda para módulo 010 (Ajustes de perfil).
