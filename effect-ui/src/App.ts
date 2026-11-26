/**
 * App.ts — componer Components. El padre no guarda el estado de los hijos.
 *
 * En Foldkit 0.x la página tendría el Model de las tareas y el del clima, y
 * reenviaría cada Message. Aquí `App` solo recuerda qué vista está abierta.
 * `TodoList` y `WeatherView` son programas propios: al pintarlos, el runtime
 * les crea su Model y se lo queda hasta que la vista deja de nombrarlos.
 *
 * Cambiar de vista desmonta al otro. Al volver, `init` corre otra vez: las
 * tareas se leen del almacén y el clima vuelve a buscar Puerto Vallarta.
 */
import { Head, UiSchema } from "@effect/ui"
import { Button } from "@effect/ui-kit"
import { Html } from "@effect/ui/html"
import { Schema } from "effect"
import { TodoList } from "./TodoList.ts"
import { WeatherView } from "./WeatherView.ts"

const AppMessage = UiSchema.TaggedEnum({
  ClickedTodos: {},
  ClickedWeather: {}
})

const AppView = Schema.Literals(["todos", "weather"])

export const App = Html.component({
  name: "App",
  model: Schema.Struct({ view: AppView }),
  message: AppMessage
}).make({
  init: () => ({ view: "todos" }),
  update: {
    ClickedTodos: ($) => $.evolve({ view: "todos" }),
    ClickedWeather: ($) => $.evolve({ view: "weather" })
  },
  head: ({ model }) => [
    Head.title(model.view === "todos" ? "Tareas · Effect UI" : "Clima · Effect UI")
  ],
  view: (h, model) =>
    h.div.class("app").children(
      h.header.class("topbar").children(
        h.div.children(
          h.p.class("eyebrow").children("Effect UI · vista previa"),
          h.p.class("brand").children("Piloto")
        ),
        h.nav.attr("aria-label", "Vistas").children(
          Button(h, { onPress: AppMessage.ClickedTodos() })
            .attr("aria-current", model.view === "todos" ? "page" : "false")
            .class("nav", model.view === "todos" && "nav-current")
            .children("Tareas"),
          Button(h, { onPress: AppMessage.ClickedWeather() })
            .attr("aria-current", model.view === "weather" ? "page" : "false")
            .class("nav", model.view === "weather" && "nav-current")
            .children("Clima")
        )
      ),
      h.main.children(
        model.view === "todos" ? TodoList(h, {}) : WeatherView(h, {})
      )
    )
})
