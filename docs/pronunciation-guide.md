# Guía de respelling en español para Nivelate

Convención para escribir la columna `respellingEs` de `pronunciationHighlights` en el contenido curado. Es un sistema propio (no IPA) pensado para hispanohablantes A2→B1. **Precisión menor que IPA a cambio de que se pueda leer sin capacitación previa.**

El audio 🔊 al lado del respelling es el modelo real. El respelling guía la lectura para que el usuario intente antes de escuchar.

## Vocales

| Sonido inglés | Respelling | Ejemplos |
|---|---|---|
| /iː/ larga | **i** o **ii** | `see → si`, `feet → fit` |
| /ɪ/ corta | **i** | `bit → bit`, `ship → ship` |
| /e/ | **e** | `bed → bed`, `red → red` |
| /æ/ | **a** | `cat → cat`, `bad → bad` |
| /ɑː/ | **a** o **aa** | `father → fáder`, `car → car` |
| /ɒ/ / /ɔː/ | **o** | `dog → dog`, `thought → zot` |
| /ʊ/ | **u** | `good → gud`, `book → buk` |
| /uː/ | **u** o **uu** | `moon → mun`, `food → fud` |
| /ʌ/ | **a** | `cup → cap`, `love → lav` |
| /ə/ schwa | **e** (vocal suave) | `about → ebáut`, `sofa → sófe` |
| /ɜː/ | **er** | `bird → berd`, `work → werk` |

## Diptongos

| Sonido inglés | Respelling | Ejemplos |
|---|---|---|
| /eɪ/ | **éi** | `day → déi`, `name → néim` |
| /aɪ/ | **ái** | `time → táim`, `my → mái` |
| /ɔɪ/ | **ói** | `boy → bói`, `voice → vóis` |
| /aʊ/ | **áu** | `now → náu`, `house → jáus` |
| /oʊ/ | **óu** | `hello → je-lóu`, `go → góu` |
| /ɪə/ | **íer** | `here → jíer`, `near → níer` |
| /eə/ | **er** | `where → wer`, `care → ker` |
| /ʊə/ | **úer** | `sure → shúer`, `tour → túer` |

## Consonantes especiales

| Sonido inglés | Respelling | Notas y ejemplos |
|---|---|---|
| /θ/ (th sordo) | **z** | `thought → zot`, `thing → zing`. En Argentina/México se pronuncia como "s" — aceptable. |
| /ð/ (th sonoro) | **d** | `this → dis`, `mother → máder`, `the → de` |
| /ʃ/ | **sh** | `she → shi`, `wish → wish` |
| /ʒ/ | **sh** o **zh** | `measure → méshur`, `vision → víshon` |
| /tʃ/ | **ch** | `chat → chat`, `much → mach` |
| /dʒ/ | **y** o **ll** | `job → yob`, `judge → yach` |
| /h/ | **j** | `hello → je-lóu`, `hot → jot` |
| /w/ | **u** o **w** | `we → wi`, `what → wat` |
| /r/ | **r** (suave, no vibrante) | `run → ran`, `red → red` |
| /ŋ/ | **ng** | `sing → sing`, `long → long` |

## Reglas generales

1. **Sílabas separadas por guiones** cuando ayudan a la lectura: `important → im-pór-tent`, `hello → je-lóu`.
2. **Acento marcado con tilde** en la sílaba tónica: `computer → com-piú-ter`, `family → fá-mi-li`.
3. **Palabras cortas de una sílaba** sin guión ni tilde: `cat → cat`, `run → ran`.
4. **Contracciones**: expandir la pronunciación real. `she's → shis`, `don't → dount`, `I'll → áil`.
5. **Silencio final de -e**: no se transcribe. `name → néim` (no "néime").
6. **-ed regular**:
   - Tras sonora → **d**: `played → pléid`.
   - Tras sorda → **t**: `worked → wérkt`.
   - Tras /t/ o /d/ → **ed** (sílaba extra): `wanted → wánted`, `visited → vísited`.
7. **Pronombres átonos con h (her, him, his)**: en habla conectada, después de un verbo suelen perder la h y enlazar con la palabra anterior. `call her → col er` (no `col jer`). Usar la forma reducida en frases completas — es la que se acerca más al audio real.
8. **-s / -es plural o 3ª persona**:
   - Tras sorda → **s**: `books → buks`.
   - Tras sonora → **s** (aceptable, aunque IPA sería /z/): `dogs → dogs`.
   - Tras sibilante → **is** o **es**: `wishes → wíshis`.

## Frases completas

Para frases (no palabras sueltas), respeta la pronunciación de cada palabra y separa con espacios. Los `linking` (unir palabras) opcionalmente pueden marcarse con guión bajo si son muy fuertes.

Ejemplos:
- `I have been to Paris` → `ái hav bin tu páris`
- `she's worked here for five years` → `shis wérkt jíer for fáiv yíers`
- `have you ever seen this movie?` → `hav yu éver sin dis múvi`
- `what are you doing?` → `wat ar yu dú-ing`

## Cosas que **no** hacemos

- **IPA formal** (`/həˈloʊ/`): preciso pero requiere aprender los símbolos. El público objetivo (adultos hispanohablantes sin base fonológica) no lo puede leer al vuelo.
- **Distinguir vocales largas vs cortas con símbolos raros** (`/iː/` vs `/ɪ/`). Cuando importa, se duplica la vocal (`si` vs `sit`). Para el resto, una sola vocal alcanza.
- **Marcar el schwa con símbolo**. Usamos vocal suave (`e` o vocal de contexto) — imperfecto pero legible.

## Convenciones al escribir contenido nuevo

- Copiar la palabra/frase en inglés tal cual va en la lección (sin cambios de mayúscula ni puntuación).
- Escribir el respelling en minúsculas, con tildes donde corresponda.
- Verificar con el audio 🔊 (Web Speech API) que suena razonablemente cerca — si no, ajustar el respelling hasta que la lectura del usuario se acerque al audio.
- Cuando dudes, priorizá **legibilidad para hispanohablante** por sobre precisión fonológica.
