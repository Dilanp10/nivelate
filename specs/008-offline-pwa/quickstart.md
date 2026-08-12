# Quickstart — 008 Offline PWA

## Probar en dev

`pnpm --filter mobile web` sigue funcionando igual. El **service worker NO se registra en dev** (Metro cachea distinto). El banner de "Sin conexión" sí funciona en dev: apagá la WiFi y verás el banner arriba.

## Probar offline de verdad (requiere build de prod)

```bash
# 1) Build web
pnpm --filter mobile export:web
# Genera apps/mobile/dist/ con index.html, assets/, sw.js, manifest.json.

# 2) Servir estático
pnpm dlx serve apps/mobile/dist -p 5000
# Abrí http://localhost:5000 en Chrome.

# 3) Verificar PWA
# DevTools → Application → Service Workers: debería estar "activated and running".
# DevTools → Application → Manifest: sin errores.
# DevTools → Lighthouse → PWA audit → "Installable" en verde.

# 4) Probar offline
# 4a) Loguear + entrar a una lección (para cachearla).
# 4b) DevTools → Network → "Offline".
# 4c) Recargar. La app debería cargar (shell + contenido cacheado).
# 4d) Volver a la lección visitada — funciona sin red.
# 4e) Intentar completar la lección (mutation) → error "Sin conexión" claro.

# 5) Instalabilidad
# Chrome muestra un ícono "instalar app" en la barra de URL. Instalar → se abre standalone.
```

## Estrategias del SW (resumen)

- **App shell** (HTML, JS, CSS): precache + network-first en runtime.
- **Contenido** (`/rest/v1/units|lessons|exercises`): stale-while-revalidate. Última copia sirve offline; la app actualiza en background.
- **Datos personales** (`/rest/v1/{profiles,xp_events,...}`): network-only. No queremos servir datos viejos que confunden.
- **Mutations** (`/rest/v1/rpc/*`): network-only. Fallan si no hay red; error claro al usuario.

## Notas

- **iOS PWA con SW** funciona pero tiene limitaciones (cache size, no push confiable). Testear en Safari mobile si es target.
- **Actualizaciones**: cuando hay una versión nueva, aparece un banner "Nueva versión disponible". Tocar "Actualizar" limpia el SW viejo y recarga.
- **Sin cola offline** en MVP: completar lecciones offline no se persiste. Es una decisión — la mayoría del uso es online. Post-MVP se puede agregar IndexedDB queue.
