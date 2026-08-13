# Assets

## `icon.png` — placeholder

`icon.png` (1024×1024) es un **placeholder**: fondo `#0f172a` con una "N" blanca
(`#f8fafc`). Reemplazarlo cuando haya un logo de marca real.

## Cómo se arma el manifest PWA

Ojo: Expo **no** genera el manifest a partir de los campos `web` de `app.json`.
Con Metro web y `output: 'single'`, `expo export --platform web` emite un
`index.html` desde un template interno e ignora `app/+html.tsx`. Por eso:

- El manifest se mantiene **a mano** en `public/manifest.json`.
- Los iconos servidos viven en `public/icons/` (192, 512, maskable 512).
- Los tags del `<head>` (`<link rel="manifest">`, apple-touch-icon, etc.) los
  inyecta `scripts/inject-pwa-head.mjs` como paso post-build de `export:web`.

Si reemplazás `icon.png`, regenerá también los tres PNG de `public/icons/`
en los mismos tamaños, o el manifest va a apuntar a los iconos viejos.
