# Assets

## `icon.png` — pendiente

Este proyecto necesita un `icon.png` de **1024×1024** en este directorio
para que Expo genere los tamaños del manifest PWA (192, 512, maskable, favicon,
apple-touch-icon).

Sin este archivo, `expo export --platform web` sigue funcionando pero el
manifest queda sin iconos y Lighthouse marca "PWA installable" en amarillo.

## Cómo generarlo

Cualquier PNG cuadrado 1024×1024 sirve. Sugerencia rápida (placeholder):

- Fondo `#0f172a` (bg de la app).
- La letra **N** blanca (`#f8fafc`) centrada, sans-serif bold, ~600px alto.

Podés usar Figma, Canva, o cualquier tool. Guardar como `apps/mobile/assets/icon.png`
y volver a correr `pnpm --filter mobile export:web`.

Cuando haya un logo de marca real, reemplazar este placeholder.
