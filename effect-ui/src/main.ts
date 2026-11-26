/**
 * main.ts — montar el árbol y dar los Layers de plataforma.
 *
 * `BrowserHost.mount` devuelve un Layer. `Layer.launch` lo construye y deja
 * la app corriendo. Los Components ya trajeron sus Commands (`Component.provide`).
 * Aquí solo entra lo que depende del navegador:
 *
 * - `FetchHttpClient`: el `HttpClient` real, para el clima.
 * - `HttpClient.TracerPropagationEnabled` en false: si no, fetch manda
 *   `b3` y `traceparent`, el navegador hace preflight y Open-Meteo lo niega.
 * - `KeyValueStore.layerStorage(() => localStorage)`: el almacén de las tareas.
 *
 * Ningún `update` importa este archivo. Los tests montan con `Story`, `Scene`
 * o `Play` y ponen memoria o un API falso en lugar de estos dos Layers.
 */
import { BrowserHost } from "@effect/ui/html"
import { Effect, Layer } from "effect"
import { FetchHttpClient, HttpClient } from "effect/http"
import { KeyValueStore } from "effect/persistence"
import { App } from "./App.ts"

const root = document.getElementById("root")
if (root === null) {
  throw new Error("Falta el nodo #root")
}

const Main = BrowserHost.mount(App, {}, root).pipe(
  Layer.provide([
    FetchHttpClient.layer,
    // Misma razón que en WeatherApi: sin esto el navegador preflighta
    // `b3` y `traceparent`, y Open-Meteo no los permite.
    Layer.succeed(HttpClient.TracerPropagationEnabled, false),
    KeyValueStore.layerStorage(() => localStorage)
  ])
)

Layer.launch(Main).pipe(Effect.runFork)
