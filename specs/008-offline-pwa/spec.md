# Spec 008 — Offline PWA

> **Estado:** Stub.
> **Depende de:** todos los anteriores.

## Contexto

Un usuario adulto suele estudiar en el subte, en un vuelo o con conexión inestable. La app tiene que funcionar offline una vez descargada la unidad en la que está trabajando.

## Objetivos (borrador)

1. **Service worker** con estrategia cache-first para assets estáticos.
2. **Precache** de la unidad activa al empezarla — lecciones + ejercicios + audio (si es pre-generado).
3. **Cola de sincronización** — respuestas a ejercicios y XP events se guardan en IndexedDB y se envían cuando hay conexión.
4. **Indicador de estado** — badge visible cuando estás offline.
5. **Instalabilidad** — banner "Instalá la app" cumpliendo criterios PWA (manifest, icono, etc.).

## No-objetivos

- Sync bidireccional de contenido (el contenido solo baja, no sube — no hay conflictos).
- Descarga de todo el currículum de una (baja bajo demanda).
- Modo offline en iOS con notificaciones push (es imposible por limitaciones de Safari).

## Preguntas abiertas

- [ ] ¿Usamos Workbox o service worker escrito a mano?
- [ ] ¿Expo tiene soporte oficial de service workers al export web en SDK 54+? Investigar.
- [ ] ¿Cache LRU con límite de tamaño (ej: 100MB) o sin límite?
- [ ] ¿Cómo mostramos "esta unidad no está descargada, ¿bajar?" — modal, banner, opcional?
