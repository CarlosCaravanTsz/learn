/**
 * WeatherView.ts — Command con `switch`, Subscription, y el estado de la
 * petición dentro del Model.
 *
 * Una búsqueda es un hecho que empieza y termina: eso es un Command
 * (`SearchWeather`), no estado escondido en un `useEffect`. El Model dice en
 * qué fase va, con un union etiquetado:
 *
 * - `Loading`: hay una búsqueda en curso para esta ciudad.
 * - `Failed`: terminó mal, con el motivo.
 * - `Ready`: hay un informe.
 *
 * `mode: "switch"` (el mismo de `examples/file-preview`) interrumpe la
 * búsqueda anterior cuando sale una nueva. Si escribes otra ciudad antes de
 * que Open-Meteo conteste, la respuesta vieja no pisa a la nueva.
 *
 * Subscription: "mientras el texto esté editado y sin enviar, espera 400 ms
 * y busca". La dependencia de la Subscription es el texto, así que cada
 * tecla reinicia la espera. Al enviar, `edited` vuelve a false y la
 * Subscription desaparece: el runtime cierra su scope. Regla de la guía: si
 * puedes decir "mientras…", es una Subscription; si es un viaje de ida, es
 * un Command.
 */
import { Command, Component, Subscription, UiSchema } from "@effect/ui"
import { Button } from "@effect/ui-kit"
import { Html } from "@effect/ui/html"
import { Effect, Layer, Schema, Stream } from "effect"
import {
  DEFAULT_CITY,
  WeatherReport,
  formatC,
  weatherLabel
} from "./domain/Weather.ts"
import { WeatherApi, WeatherApiLive } from "./services/WeatherApi.ts"

export const WeatherStatus = UiSchema.TaggedEnum({
  Loading: { query: Schema.String },
  Failed: { query: Schema.String, reason: Schema.String },
  Ready: { query: Schema.String, report: WeatherReport }
})
export type WeatherStatus = typeof WeatherStatus.Type

export const WeatherViewMessage = UiSchema.TaggedEnum({
  UpdatedQuery: { query: Schema.String },
  RequestedSearch: {},
  SucceededSearch: { query: Schema.String, report: WeatherReport },
  FailedSearch: { query: Schema.String, reason: Schema.String }
})

export class SearchWeather extends Command.Service<SearchWeather>()(
  "weather/SearchWeather",
  {
    args: { query: Schema.String },
    success: WeatherViewMessage,
    // Una búsqueda nueva cancela la que todavía no ha respondido.
    mode: "switch"
  }
) {
  static readonly layer = this.toLayer(
    Effect.gen(function*() {
      const api = yield* WeatherApi
      return ({ query }) =>
        api.lookup(query).pipe(
          Effect.match({
            onSuccess: (report) =>
              WeatherViewMessage.SucceededSearch({ query, report }),
            onFailure: (error) =>
              WeatherViewMessage.FailedSearch({ query, reason: error.message })
          })
        )
    })
  )
}

export const WeatherViewModel = Schema.Struct({
  query: Schema.String,
  // true desde la última tecla hasta que arranca la búsqueda.
  edited: Schema.Boolean,
  status: WeatherStatus
})
export type WeatherViewModel = typeof WeatherViewModel.Type

const SEARCH_DEBOUNCE = "400 millis"

/** Solo aceptamos el resultado de la búsqueda que el Model todavía espera. */
const isCurrentSearch = (model: WeatherViewModel, query: string): boolean =>
  model.status._tag === "Loading" && model.status.query === query

const WeatherViewDef = Html.component({
  name: "WeatherView",
  model: WeatherViewModel,
  message: WeatherViewMessage
})

const reportView = WeatherViewDef.fragment((h, report: WeatherReport) =>
  h.div.class("report").children(
    h.h2.children(
      `${report.place.name}, ${report.place.admin1}`
    ),
    h.p.class("muted").children(report.place.country),
    h.p.class("temperature").children(formatC(report.current.temperatureC)),
    h.p.children(weatherLabel(report.current.weatherCode)),
    h.p.class("muted").children(`Viento ${report.current.windKmh.toFixed(1)} km/h`),
    h.ol.class("forecast").children(
      report.daily.map((day) =>
        h.li.key(day.date).children(
          h.span.class("forecast-date").children(day.date),
          h.span.children(weatherLabel(day.weatherCode)),
          h.span.class("forecast-range").children(
            `${formatC(day.minC)} – ${formatC(day.maxC)}`
          )
        )
      )
    )
  )
)

export const WeatherViewNoDeps = WeatherViewDef.make({
  init: ($) =>
    $.set({
      query: DEFAULT_CITY,
      edited: false,
      status: WeatherStatus.Loading({ query: DEFAULT_CITY })
    }).run(SearchWeather.make({ query: DEFAULT_CITY })),
  update: {
    UpdatedQuery: ($, { query }) => $.evolve({ query, edited: true }),
    RequestedSearch: ($) => {
      const query = $.model.query.trim()
      if (query === "") {
        return $.evolve({
          edited: false,
          status: WeatherStatus.Failed({
            query,
            reason: "Escribe una ciudad."
          })
        })
      }
      return $.evolve({
        query,
        edited: false,
        status: WeatherStatus.Loading({ query })
      }).run(SearchWeather.make({ query }))
    },
    SucceededSearch: ($, { query, report }) =>
      isCurrentSearch($.model, query)
        ? $.evolve({ status: WeatherStatus.Ready({ query, report }) })
        : $.model,
    FailedSearch: ($, { query, reason }) =>
      isCurrentSearch($.model, query)
        ? $.evolve({ status: WeatherStatus.Failed({ query, reason }) })
        : $.model
  },
  // Mientras `edited` sea true, la espera vive. Cambia el texto y la key
  // cambia (`search:"Madrid"`): el runtime tira el stream viejo y empieza otro.
  subscriptions: ({ model }) => [
    model.edited && model.query.trim() !== "" &&
    Subscription.make(
      "search",
      model.query,
      () =>
        Stream.fromEffect(
          Effect.as(
            Effect.sleep(SEARCH_DEBOUNCE),
            WeatherViewMessage.RequestedSearch()
          )
        )
    )
  ],
  view: (h, model) =>
    h.section.class("panel").children(
      h.header.class("panel-head").children(
        h.h1.children("Clima"),
        h.p.class("muted").children("Open-Meteo, sin API key")
      ),
      h.form.attr("aria-label", "Buscar ciudad")
        .on("submit", WeatherViewMessage.RequestedSearch())
        .class("row")
        .children(
          h.input
            .attr("aria-label", "Ciudad")
            .attr("autocomplete", "off")
            .value(model.query)
            .on("input", ({ value }) =>
              WeatherViewMessage.UpdatedQuery({ query: value })),
          // El botón sigue activo durante la búsqueda: otro envío usa `switch`
          // y corta la petición anterior. `h.isRunning` solo anuncia que hay
          // un Command de este Component en curso.
          Button(h, { props: { type: "submit" } })
            .attr("aria-busy", String(h.isRunning(SearchWeather)))
            .class("primary")
            .children("Buscar")
        ),
      WeatherStatus.match(model.status, {
        Loading: ({ query }) =>
          h.p.attr("role", "status").attr("aria-busy", "true").children(
            `Buscando ${query}…`
          ),
        Failed: ({ reason }) =>
          h.p.attr("role", "alert").class("alert").children(reason),
        Ready: ({ report }) => reportView(h, report)
      })
    )
})

export const WeatherView = WeatherViewNoDeps.pipe(
  Component.provide(SearchWeather.layer.pipe(Layer.provide(WeatherApiLive)))
)
