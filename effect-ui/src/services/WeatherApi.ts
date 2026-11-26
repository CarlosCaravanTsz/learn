/**
 * services/WeatherApi.ts — el cliente HTTP detrás de un service.
 *
 * `lookup` es lo único que el Command conoce. `layerHttp` usa `HttpClient`
 * contra Open-Meteo (sin API key, CORS abierto) y decodifica el JSON con
 * Schema. `layerFake` devuelve informes fijos: los tests de Play lo
 * proporcionan y no hay red.
 *
 * `Component.provide` en `WeatherView.ts` entrega el Layer al Command.
 * `FetchHttpClient` se queda en `main.ts`. La guía lo dice así: el entry
 * point da la plataforma, el Component da el dominio.
 */
import { Context, Effect, Layer, Schema } from "effect"
import { HttpClient, HttpClientResponse } from "effect/http"
import { type DailyForecast, type WeatherReport } from "../domain/Weather.ts"

export class WeatherError extends Schema.TaggedError<WeatherError>()(
  "WeatherError",
  { message: Schema.String }
) {}

/** Trozo del JSON de geocoding. El resto de campos del API no nos hace falta. */
const GeocodingPlace = Schema.Struct({
  name: Schema.String,
  country: Schema.String,
  admin1: Schema.String,
  latitude: Schema.Number,
  longitude: Schema.Number
})

const GeocodingResponse = Schema.Struct({
  results: Schema.optional(Schema.Array(GeocodingPlace))
})

/** Trozo del JSON de forecast. Open-Meteo manda los días en columnas. */
const ForecastResponse = Schema.Struct({
  current: Schema.Struct({
    time: Schema.String,
    temperature_2m: Schema.Number,
    weather_code: Schema.Number,
    wind_speed_10m: Schema.Number
  }),
  daily: Schema.Struct({
    time: Schema.Array(Schema.String),
    weather_code: Schema.Array(Schema.Number),
    temperature_2m_max: Schema.Array(Schema.Number),
    temperature_2m_min: Schema.Array(Schema.Number)
  })
})

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

const reasonOf = (error: { readonly message: string }): string =>
  error.message.length > 0 ? error.message : "La petición al clima falló"

const toReport = (
  place: typeof GeocodingPlace.Type,
  forecast: typeof ForecastResponse.Type
): WeatherReport => {
  const daily: Array<DailyForecast> = forecast.daily.time.map((date, index) => ({
    date,
    weatherCode: forecast.daily.weather_code[index] ?? 0,
    maxC: forecast.daily.temperature_2m_max[index] ?? 0,
    minC: forecast.daily.temperature_2m_min[index] ?? 0
  }))
  return {
    place,
    current: {
      time: forecast.current.time,
      temperatureC: forecast.current.temperature_2m,
      windKmh: forecast.current.wind_speed_10m,
      weatherCode: forecast.current.weather_code
    },
    daily
  }
}

export class WeatherApi extends Context.Service<WeatherApi, {
  readonly lookup: (query: string) => Effect.Effect<WeatherReport, WeatherError>
}>()("weather/WeatherApi") {}

/** Implementación real. Pide `HttpClient`, que `main.ts` resuelve con fetch. */
export const WeatherApiLive = Layer.effect(
  WeatherApi,
  Effect.gen(function*() {
    const http = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk)
    const lookup = (query: string) =>
      Effect.gen(function*() {
        const name = query.trim()
        if (name === "") {
          return yield* Effect.fail(new WeatherError({ message: "Escribe una ciudad." }))
        }

        const geocoding = yield* http.get(GEOCODING_URL, {
          urlParams: { name, count: "1", language: "es", format: "json" }
        }).pipe(
          Effect.flatMap(HttpClientResponse.schemaBodyJson(GeocodingResponse)),
          Effect.mapError((error) => new WeatherError({ message: reasonOf(error) }))
        )

        const place = geocoding.results?.[0]
        if (place === undefined) {
          return yield* Effect.fail(
            new WeatherError({ message: `No encontré «${name}».` })
          )
        }

        const forecast = yield* http.get(FORECAST_URL, {
          urlParams: {
            latitude: String(place.latitude),
            longitude: String(place.longitude),
            current: "temperature_2m,weather_code,wind_speed_10m",
            daily: "weather_code,temperature_2m_max,temperature_2m_min",
            timezone: "auto",
            forecast_days: "5"
          }
        }).pipe(
          Effect.flatMap(HttpClientResponse.schemaBodyJson(ForecastResponse)),
          Effect.mapError((error) => new WeatherError({ message: reasonOf(error) }))
        )

        return toReport(place, forecast)
      }).pipe(
        // Open-Meteo no lista `b3` ni `traceparent` en
        // Access-Control-Allow-Headers. Con la propagación encendida
        // (el default de FetchHttpClient) el navegador manda un preflight
        // OPTIONS y el API responde 404. La propia doc del cliente dice
        // apagar `TracerPropagationEnabled` en ese caso. El span sigue
        // existiendo; solo no viaja en headers.
        Effect.provideService(HttpClient.TracerPropagationEnabled, false)
      )

    return WeatherApi.of({ lookup })
  })
)

/**
 * Informes fijos para Play. El `sleep` deja una búsqueda en vuelo el tiempo
 * suficiente para que la siguiente, con `mode: "switch"`, la interrumpa.
 */
export const fakeReports = {
  "puerto vallarta": {
    place: {
      name: "Pto Vallarta",
      country: "México",
      admin1: "Estado de Jalisco",
      latitude: 20.617,
      longitude: -105.23018
    },
    current: {
      time: "2026-11-26T11:15",
      temperatureC: 24.3,
      windKmh: 2.4,
      weatherCode: 3
    },
    daily: [
      { date: "2026-11-26", weatherCode: 53, maxC: 26, minC: 22.5 }
    ]
  },
  madrid: {
    place: {
      name: "Madrid",
      country: "España",
      admin1: "Comunidad de Madrid",
      latitude: 40.4165,
      longitude: -3.7026
    },
    current: {
      time: "2026-11-26T18:00",
      temperatureC: 12,
      windKmh: 14,
      weatherCode: 2
    },
    daily: [
      { date: "2026-11-26", weatherCode: 2, maxC: 14, minC: 7 }
    ]
  }
} as const satisfies Record<string, WeatherReport>

export const WeatherApiFake = Layer.succeed(
  WeatherApi,
  WeatherApi.of({
    lookup: (query) => {
      const report = fakeReports[query.trim().toLowerCase() as keyof typeof fakeReports]
      if (report === undefined) {
        return Effect.fail(new WeatherError({ message: `No encontré «${query}».` }))
      }
      return Effect.as(Effect.sleep("300 millis"), report)
    }
  })
)
