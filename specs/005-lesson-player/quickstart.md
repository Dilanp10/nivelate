# Quickstart — 005 Lesson Player

## Requisitos previos

- Módulo 004 aplicado (schema de contenido + Unidad 1 cargada).
- La Unidad 1 publicada (`is_published = true`) para que la RLS la deje leer.
  En dev, publicar temporalmente:
  ```sql
  update units set is_published = true where slug = 'a2-refresh';
  ```
  (Recordar bajarla si el contenido aún no pasó revisión.)

## Probar una lección

1. `pnpm --filter mobile web` y loguearte.
2. Desde la home, tocar la primera lección (link agregado en T031).
3. Responder ejercicios: verificar → feedback → continuar.
4. Fallar uno a propósito: debe reaparecer antes de terminar.
5. Al terminar: pantalla de resumen con aciertos al primer intento y XP estimada.

## Verificar

```bash
pnpm typecheck && pnpm lint && pnpm test   # incluye checkAnswer + lesson-machine
pnpm test:e2e                              # flujo mínimo de lección
```

## Notas

- **Listening**: el botón "Escuchar" usa `SpeechSynthesis` del navegador. Si el browser no tiene voz inglesa, muestra el texto igual. En native (Expo Go) el TTS web no aplica; se evaluará `expo-speech` si se prioriza native.
- **Persistencia de XP/racha**: 005 solo **emite** el resultado (`onLessonComplete`). Guardar XP y actualizar racha es del módulo 003.
