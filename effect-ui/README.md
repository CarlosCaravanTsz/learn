# Piloto de Effect UI

Una app pequeña para aprender [Effect UI](https://ui.effect.website) (vista previa pública). Dos vistas, cada una un Component:

- **Tareas**: agregar, completar, borrar y filtrar (todas / activas / hechas). La lista se guarda en `localStorage` con un Command y un service, no con `localStorage` escrito en la vista.
- **Clima**: busca una ciudad en Open-Meteo (sin API key, CORS abierto), enseña el tiempo actual y cinco días. La ciudad inicial es Puerto Vallarta.

El código está comentado en español, con los nombres de la API en inglés, como salen en la documentación.

## Aprende Effect UI

Tres lecciones cortas, en español, sobre este piloto. Empieza por la anatomía de un Component:

[teach/lessons/0001-anatomia-de-un-component.html](teach/lessons/0001-anatomia-de-un-component.html)

El glosario, la cheatsheet y la misión están en [teach/](teach/MISSION.md).

## Snapshot

Effect UI todavía no está en npm. Este proyecto fija el snapshot de `main` del commit:

- corto: `87a704b`
- completo: `87a704bef41b40de8fa7bced97cae5d69c4233a0`
- fecha: 2026-11-26
- mensaje: `Document that hydration doesn't keep early clicks and submits (#293)`

`effect` y `@effect/vitest` van en `4.1.6`, que es la versión que usa ese commit. Las URLs están en `package.json`; el commit corto va en el enlace, no `@main`.

## Comandos

Desde esta carpeta (`effect-ui/`):

```sh
pnpm install
pnpm dev          # http://127.0.0.1:5173
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run, sin red
pnpm build        # vite build
```

## Mapa de archivos

| Archivo | Concepto de Effect UI |
| --- | --- |
| `src/main.ts` | `BrowserHost.mount` y `Layer.launch`. Los Layers de plataforma: `FetchHttpClient` y `KeyValueStore.layerStorage`. |
| `src/App.ts` | Componer Components. El padre solo guarda qué vista está abierta; no reenvía Messages de los hijos. |
| `src/TodoList.ts` | Anatomía de un Component: Model, Message, `init`, `update`, `view`. Commands `LoadTodos` y `SaveTodos` (`mode: "queue"`). `UiStruct.evolve` en una fila. `Component.provide`. |
| `src/WeatherView.ts` | Estado de la petición dentro del Model (`Loading` / `Failed` / `Ready`). Command `SearchWeather` con `mode: "switch"`. Subscription de debounce. `h.isRunning`. |
| `src/services/TodoStore.ts` | Service (`Context.Service`) sobre `KeyValueStore`. El Component no elige el almacén. |
| `src/services/WeatherApi.ts` | El HTTP detrás de un service. Schema decodifica el JSON. `layerHttp` para la app, `layerFake` para los tests. |
| `src/domain/Todo.ts` | El Model guarda Schemas, no interfaces sueltas. |
| `src/domain/Weather.ts` | El informe que ve la vista, separado del JSON del API. |
| `src/TodoList.story.test.ts` | `Story`: Messages al `update`, Model y Commands, sin runtime. |
| `src/TodoList.scene.test.ts` | `HtmlScene`: la misma lógica a través de la vista (escribir, click, texto). |
| `src/WeatherView.story.test.ts` | `Story` del clima, incluida la interrupción de `switch`. |
| `src/WeatherView.play.test.ts` | `HtmlPlay`: los Commands sí corren, contra `WeatherApiFake` y `TestClock`. Sin red. |
| `vite.config.ts`, `tsconfig.json`, `index.html` | El esqueleto de `examples/counter`: Vite, `BrowserHost`, `strict` + imports `.ts`. |
| `vitest.config.ts`, `vitest.setup.ts` | Vitest como en el repo, con `addEqualityTesters` de `@effect/vitest`. |
| `src/styles.css` | Presentación. No es un concepto del framework. |

`@effect/ui-kit` entra como `Button`: una función de vista, no un Component. No guarda estado.

## Qué se apartó de la guía

La guía y el snapshot coinciden en Component, Command, Subscription, `Component.provide`, Story, Scene y Play. Dos detalles del snapshot no salen en el artículo y sí importan aquí:

1. **`FetchHttpClient` propaga traza por defecto.** Manda los headers `b3` y `traceparent`. En el navegador eso dispara un preflight, y Open-Meteo no los lista en `Access-Control-Allow-Headers` (el OPTIONS responde 404 y Chrome bloquea el GET). La doc de `FetchHttpClient` en este mismo snapshot dice poner `HttpClient.TracerPropagationEnabled` en `false` para ese caso. Está en `main.ts` y otra vez en `WeatherApi.lookup`, que es el efecto que hace la petición. El span se sigue creando; no viaja en headers. Sin eso, la vista de clima muestra `Transport error` y `curl` desde Node sigue funcionando, porque Node no hace preflight.

2. **La geocodificación de "Puerto Vallarta" devuelve el nombre `Pto Vallarta`** (el municipio va en `admin2`). La vista muestra el `name` del API más `admin1` y el país: "Pto Vallarta, Estado de Jalisco".

`Schema.Struct` de Effect 4.1.6, con este snapshot, acepta el JSON real de Open-Meteo aunque el struct solo nombre los campos que usamos. Lo comprobé decodificando la respuesta en vivo, no solo el tipo.

Los tests no abren la red. El falso duerme 300 ms para que `switch` tenga algo que interrumpir; `TestClock` adelanta ese tiempo.
