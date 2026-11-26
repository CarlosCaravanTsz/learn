/**
 * Story del clima: el Model pasa por Loading, Failed y Ready, y una segunda
 * búsqueda deja un Command `SearchWeather` con la ciudad nueva. El HTTP no
 * corre; `resolve` finge la respuesta del service.
 */
import { Story } from "@effect/ui/testing"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { DEFAULT_CITY } from "./domain/Weather.ts"
import { fakeReports } from "./services/WeatherApi.ts"
import {
  SearchWeather,
  WeatherView,
  WeatherViewMessage
} from "./WeatherView.ts"

const initial = SearchWeather.make({ query: DEFAULT_CITY })
const vallarta = fakeReports["puerto vallarta"]
const madrid = fakeReports.madrid

describe("WeatherView", () => {
  it.effect("arranca buscando Puerto Vallarta y muestra el informe", () =>
    Effect.gen(function*() {
      const story = yield* Story.make(WeatherView, {})
      assert.strictEqual(story.model.query, DEFAULT_CITY)
      assert.strictEqual(story.model.status._tag, "Loading")
      story.expectExact(initial).resolve(
        initial,
        WeatherViewMessage.SucceededSearch({
          query: DEFAULT_CITY,
          report: vallarta
        })
      )
      assert.strictEqual(story.model.status._tag, "Ready")
      if (story.model.status._tag === "Ready") {
        assert.strictEqual(story.model.status.report.place.name, "Pto Vallarta")
      }
    }))

  it.effect("un fallo deja el motivo en el Model", () =>
    Effect.gen(function*() {
      const story = yield* Story.make(WeatherView, {})
      story.resolve(
        initial,
        WeatherViewMessage.FailedSearch({
          query: DEFAULT_CITY,
          reason: "sin red"
        })
      )
      assert.strictEqual(story.model.status._tag, "Failed")
      if (story.model.status._tag === "Failed") {
        assert.strictEqual(story.model.status.reason, "sin red")
      }
    }))

  it.effect("editar arma la Subscription y buscar emite el Command nuevo", () =>
    Effect.gen(function*() {
      const story = yield* Story.make(WeatherView, {})
      story.resolve(
        initial,
        WeatherViewMessage.SucceededSearch({
          query: DEFAULT_CITY,
          report: vallarta
        })
      )
        .send(WeatherViewMessage.UpdatedQuery({ query: "Madrid" }))
      assert.strictEqual(story.model.edited, true)
      // La key incluye la dependencia, como `room:"42"` en la guía.
      assert.deepStrictEqual(story.subscriptions, ['search:"Madrid"'])

      const next = SearchWeather.make({ query: "Madrid" })
      story.send(WeatherViewMessage.RequestedSearch())
        .expectExact(next)
        .resolve(
          next,
          WeatherViewMessage.SucceededSearch({ query: "Madrid", report: madrid })
        )
      assert.strictEqual(story.model.edited, false)
      assert.deepStrictEqual(story.subscriptions, [])
      if (story.model.status._tag === "Ready") {
        assert.strictEqual(story.model.status.report.current.temperatureC, 12)
      }
    }))

  it.effect("switch: la búsqueda nueva interrumpe la que sigue en vuelo", () =>
    Effect.gen(function*() {
      const story = yield* Story.make(WeatherView, {})
      story.send(WeatherViewMessage.UpdatedQuery({ query: "Madrid" }))
        .send(WeatherViewMessage.RequestedSearch())
      assert.deepStrictEqual(
        story.interrupted.map((command) => command.args),
        [{ query: DEFAULT_CITY }]
      )
      const next = SearchWeather.make({ query: "Madrid" })
      story.expectExact(next).resolve(
        next,
        WeatherViewMessage.SucceededSearch({ query: "Madrid", report: madrid })
      )
      if (story.model.status._tag === "Ready") {
        assert.strictEqual(story.model.status.query, "Madrid")
      }
    }))
})
