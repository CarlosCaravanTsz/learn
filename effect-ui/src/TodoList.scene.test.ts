/**
 * Scene: el mismo Component, pero a través de la vista. Se hace click y se
 * escribe como lo haría una persona, y se comprueba el texto en pantalla.
 * Los Commands se resuelven a mano: la Scene no abre `localStorage`.
 */
import { HtmlLocator, HtmlScene } from "@effect/ui/html/testing"
import { Locator } from "@effect/ui/testing"
import { describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { LoadTodos, SaveTodos, TodoList, TodoListMessage } from "./TodoList.ts"

const draft = HtmlLocator.role("textbox", { name: "Nueva tarea" })
const saved = TodoListMessage.SucceededSaveTodos()

describe("TodoList", () => {
  it.effect("agregar, completar y filtrar cambia lo que se ve", () =>
    Effect.gen(function*() {
      const scene = yield* HtmlScene.make(TodoList, {})
      scene.expect(Locator.text("Cargando tareas…")).toExist()
        .resolve(LoadTodos, TodoListMessage.SucceededLoadTodos({ todos: [] }))
        .expect(HtmlLocator.role("heading", { name: "Tareas" })).toExist()
        .type(draft, "Leche")
        .click(HtmlLocator.role("button", { name: "Agregar" }))
        .resolve(
          SaveTodos,
          saved
        )
        .expect(Locator.text("Leche")).toExist()
        .click(HtmlLocator.role("button", { name: "Completar: Leche" }))
        .resolve(SaveTodos, saved)
        .click(HtmlLocator.role("button", { name: "Activas" }))
        .expect(Locator.text("Leche")).toBeAbsent()
        .expect(Locator.text("No hay tareas activas.")).toExist()
        .click(HtmlLocator.role("button", { name: "Hechas" }))
        .expect(Locator.text("Leche")).toExist()
        .click(HtmlLocator.role("button", { name: "Eliminar Leche" }))
        .resolve(SaveTodos, saved)
        .expect(Locator.text("Todavía no hay tareas hechas.")).toExist()
    }))
})
