/**
 * domain/Weather.ts — lo que el Model guarda cuando el clima ya llegó.
 *
 * Esto no es el JSON de Open-Meteo. El servicio HTTP traduce la respuesta
 * (columnas `daily.time[]`, códigos WMO) a este informe. La vista solo lee
 * estos campos, así que un cambio del API no se filtra al Component.
 */
import { Schema } from "effect"

export const DEFAULT_CITY = "Puerto Vallarta"

export const Place = Schema.Struct({
  name: Schema.String,
  country: Schema.String,
  admin1: Schema.String,
  latitude: Schema.Number,
  longitude: Schema.Number
})
export type Place = typeof Place.Type

export const CurrentWeather = Schema.Struct({
  time: Schema.String,
  temperatureC: Schema.Number,
  windKmh: Schema.Number,
  weatherCode: Schema.Number
})
export type CurrentWeather = typeof CurrentWeather.Type

export const DailyForecast = Schema.Struct({
  date: Schema.String,
  weatherCode: Schema.Number,
  maxC: Schema.Number,
  minC: Schema.Number
})
export type DailyForecast = typeof DailyForecast.Type

export const WeatherReport = Schema.Struct({
  place: Place,
  current: CurrentWeather,
  daily: Schema.Array(DailyForecast)
})
export type WeatherReport = typeof WeatherReport.Type

/** Código WMO de Open-Meteo, en una frase corta. */
export const weatherLabel = (code: number): string => {
  if (code === 0) return "Despejado"
  if (code === 1) return "Mayormente despejado"
  if (code === 2) return "Parcialmente nublado"
  if (code === 3) return "Nublado"
  if (code === 45 || code === 48) return "Niebla"
  if (code >= 51 && code <= 57) return "Llovizna"
  if (code >= 61 && code <= 67) return "Lluvia"
  if (code >= 71 && code <= 77) return "Nieve"
  if (code >= 80 && code <= 82) return "Chubascos"
  if (code >= 85 && code <= 86) return "Nieve"
  if (code >= 95) return "Tormenta"
  return `Código ${code}`
}

export const formatC = (value: number): string => `${value.toFixed(1)} °C`
