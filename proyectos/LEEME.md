# Banco de proyectos formativos (v1, 17/10/2026)

Repositorio de ideas de proyecto formativo integrador para la pestaña **Docentes**. Es una página independiente (`index.html`) que se abre desde Docentes › Materiales › Planeación dentro del visor del sitio, o directamente en `…/proyectos/index.html`.

## Archivos
- `index.html` — estructura de la página (filtros, mazo, fichas, selección).
- `proyectos.css` — estilos con los mismos tokens del sitio (modo oscuro, alto contraste y tamaño de texto heredados de `a11y.css`).
- `proyectos.js` — lógica: filtros, tarjetas que se voltean, ficha completa, «Copiar para el Amoxtli», «Mi selección» (se guarda en el navegador).
- `datos/1-prototipo.js` … `datos/5-investigacion.js` — las 30 ideas, 6 por tipo del Modelo Tlamatini.

## Cómo agregar una idea
Copia un bloque de cualquier archivo de `datos/` y cámbiale el contenido. Campos:

| Campo | Qué es |
|---|---|
| `id` | Único (`pt-07`, `py-07`, `pb-07`, `ex-07`, `in-07`) |
| `tipo` | `Prototipo`, `Proyecto`, `Problema`, `Experiencia` o `Investigación` |
| `nat` | `Teórico`, `Práctico` o `Mixto` |
| `ent` | Dónde ocurre: `Aula o taller`, `Digital`, `Comunidad`, `Organización externa` |
| `eq` | `Individual`, `Equipo` o `Ambos` |
| `log` | Logística para el docente: 1 baja, 2 media, 3 alta (requiere terceros) |
| `areas` | Una o más de: Artes y Humanidades, Ciencias de la Salud, Ciencias de la Vida, Ingenierías, Negocios, Hospitalidad y Ciencias Sociales, Transversal |
| `niv` | `b`, `l`, `p` (bachillerato, licenciatura, posgrado): `[entregable, matiz]` |
| `sit` | Situación cotidiana, profesional o laboral. **Mínimo 100 palabras** (lo pide el Amoxtli) |
| `av` | Tres avances: 1.º conocer y comprender, 2.º aplicar y analizar, 3.º sintetizar y evaluar |
| `req` | Requisitos de entrega |
| `rapa` | Criterios de calidad `[criterio, descripción, %]`. **Deben sumar 100** |
| `ojo` | El riesgo más común de esa idea |

Para un tipo nuevo de archivo, agrégalo con su `<script>` en `index.html`.

## Pendientes de la v1
1. **Validar con Dirección Académica** las descripciones de los cinco tipos del Modelo Tlamatini (están en `index.html`, bloque «¿Qué significa cada tipo?»); son redacción de trabajo de DI, no la definición oficial.
2. Revisión disciplinar de las 30 ideas por coordinaciones; ampliar por área (hay más ideas transversales que de especialidad).
3. Decidir si se incorpora la consideración de los siete saberes de Morin como campo opcional (ver `Documentacion/FUNDAMENTOS_ModeloInstruccional_Boceto_v1.md`, §6).
4. Subir a GitHub (`DIUVP/aprende-mas`) y comprobar la incrustación en el Google Site.
