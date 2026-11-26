/**
 * Play: el runtime sí corre los Commands, contra `WeatherApiFake`.
 * No hay `HttpClient` y no hay red. `TestClock` adelanta el sleep del falso.
 *
 * Se monta `WeatherViewNoDeps` porque `WeatherView` ya trae `WeatherApiLive`,
 * y un provide interior gana al exterior. El test arma su propio Layer.
 */
import { HtmlLocator, HtmlPlay } from "@effect/ui/html/testing"
import { Locator, TestHost } from "@effect/ui/testing"
import { describe, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { TestClock } from "effect/testing"
import { Component } from "@effect/ui"
import { SearchWeather, WeatherViewNoDeps } from "./WeatherView.ts"
import { WeatherApiFake } from "./services/WeatherApi.ts"

const city = HtmlLocator.role("textbox", { name: "Ciudad" })

const WeatherUnderTest = WeatherViewNoDeps.pipe(
  Component.provide(SearchWeather.layer.pipe(Layer.provide(WeatherApiFake)))
)

describe("WeatherView", () => {
  it.effect("muestra Puerto Vallarta con el service falso", () =>
    Effect.gen(function*() {
      const play = yield* HtmlPlay.make(WeatherUnderTest, {})
      yield* play.expect(Locator.text("Buscando Puerto Vallarta…")).toExist()
      yield* TestClock.adjust("300 millis")
      yield* play.expect(Locator.text("Pto Vallarta, Estado de Jalisco")).toExist()
      yield* play.expect(Locator.text("24.3 °C")).toExist()
      yield* play.expect(Locator.text("Nublado")).toExist()
    }).pipe(Effect.scoped, Effect.provide(TestHost.layer())))

  it.effect("una ciudad desconocida enseña el error y no llama a la red", () =>
    Effect.gen(function*() {
      const play = yield* HtmlPlay.make(WeatherUnderTest, {})
      yield* TestClock.adjust("300 millis")
      yield* play.type(city, "Atlantis")
      yield* play.click(HtmlLocator.role("button", { name: "Buscar" }))
      yield* play.expect(Locator.text("No encontré «Atlantis».")).toExist()
    }).pipe(Effect.scoped, Effect.provide(TestHost.layer())))

  it.effect("switch se queda con la última ciudad, no con la que iba primero", () =>
    Effect.gen(function*() {
      const play = yield* HtmlPlay.make(WeatherUnderTest, {})
      yield* play.type(city, "Madrid")
      yield* play.click(HtmlLocator.role("button", { name: "Buscar" }))
      yield* TestClock.adjust("300 millis")
      yield* play.expect(Locator.text("Madrid, Comunidad de Madrid")).toExist()
      yield* play.expect(Locator.text("12.0 °C")).toExist()
      yield* play.expect(Locator.text("Pto Vallarta, Estado de Jalisco")).toBeAbsent()
      // Aunque avance más el reloj, la búsqueda interrumpida no reaparece.
      yield* TestClock.adjust("1 second")
      yield* play.expect(Locator.text("12.0 °C")).toExist()
    }).pipe(Effect.scoped, Effect.provide(TestHost.layer())))
})
