# BACKLOG — ideas fuera del MVP

Cosas que discutimos o que aparecerán y que **no** entran en el MVP. Se documentan acá para no perderlas y no meterse a implementar sin discutir.

## Post-MVP considerado

- **Speaking / STT.** Requiere permisos de micrófono, modelo de reconocimiento (Whisper vía AI Gateway = costos variables), soporte de mic dispar en browsers móviles. Reevaluar cuando el listening esté sólido.
- **Ligas / competencia social.** El usuario prefiere gamificación adulta mínima. Si aparece pedido de comunidad, evaluar foros/leaderboards discretos primero.
- **Generación de ejercicios con LLM.** Descartado para MVP por control pedagógico. Podría volver como *variación* sobre ejercicios ya curados (parafraseo automático) con validación.
- **Nivel B1 → B2.** El MVP cubre A2→B1. Cuando esté validado, extender el currículum a B2 (Vantage → Effective Operational Proficiency).
- **App nativa distribuida en stores.** Expo permite eyectar a iOS/Android nativos. Priorizar PWA primero, luego stores si hay demanda.
- **Onboarding con test de nivel.** Detectar si el usuario realmente está en A2 (podría estar por encima o debajo). Encuesta corta o test adaptativo.
- **Modo profesor / clases privadas.** Interfaz para docentes que asignan lecciones a alumnos. Big scope.

## Riesgos identificados

- **Retención sin gamificación pesada.** Sin corazones/vidas puede caer el DAU. Métrica a vigilar: racha promedio y % lecciones completadas / iniciadas.
- **Contenido curado no escala.** Tener plan editorial claro antes de crecer.
- **PWA en iOS es limitada.** Notificaciones push en iOS PWA son irregulares. Puede empujar a app nativa antes de lo previsto.
