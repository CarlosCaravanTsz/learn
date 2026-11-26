/**
 * Story: manda Messages al `update` y mira el Model y los Commands.
 * Nada corre de verdad. `resolve` entrega el Message que el Command
 * habría producido. Así se prueba la lógica sin `localStorage`.
 */
import { Story } from "@effect/ui/testing"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import {
  LoadTodos,
  SaveTodos,
  TodoList,
  TodoListMessage
} from "./TodoList.ts"

const loadedEmpty = TodoListMessage.SucceededLoadTodos({ todos: [] })
const saved = TodoListMessage.SucceededSaveTodos()

describe("TodoList", () => {
  it.effect("carga, agrega, completa, filtra y elimina", () =>
    Effect.gen(function*() {
      const story = yield* Story.make(TodoList, {})
      assert.strictEqual(story.model.phase, "loading")

      story.expectExact(LoadTodos.make({})).resolve(LoadTodos.make({}), loadedEmpty)
      assert.strictEqual(story.model.phase, "ready")

      story.send(TodoListMessage.UpdatedDraft({ draft: "  Leche " }))
        .send(TodoListMessage.SubmittedTodo())
      assert.deepStrictEqual(story.model.todos, [
        { id: "1", title: "Leche", completed: false }
      ])
      assert.strictEqual(story.model.draft, "")
      const withMilk = SaveTodos.make({
        todos: [{ id: "1", title: "Leche", completed: false }]
      })
      story.expectExact(withMilk).resolve(withMilk, saved)

      story.send(TodoListMessage.ClickedToggle({ id: "1" }))
      assert.strictEqual(story.model.todos[0]?.completed, true)
      const done = SaveTodos.make({
        todos: [{ id: "1", title: "Leche", completed: true }]
      })
      story.expectExact(done).resolve(done, saved)

      // El filtro no guarda. No queda un Command pendiente.
      story.send(TodoListMessage.ClickedFilter({ filter: "active" }))
      assert.strictEqual(story.model.filter, "active")
      story.expectNone()

      story.send(TodoListMessage.ClickedDelete({ id: "1" }))
      assert.deepStrictEqual(story.model.todos, [])
      const emptied = SaveTodos.make({ todos: [] })
      story.expectExact(emptied).resolve(emptied, saved)
    }))

  it.effect("un borrador vacío no agrega ni guarda", () =>
    Effect.gen(function*() {
      const story = yield* Story.make(TodoList, {})
      story.resolve(LoadTodos.make({}), loadedEmpty)
        .send(TodoListMessage.SubmittedTodo())
      assert.deepStrictEqual(story.model.todos, [])
      story.expectNone()
    }))

  it.effect("un almacén ilegible deja la fase en failed", () =>
    Effect.gen(function*() {
      const story = yield* Story.make(TodoList, {})
      story.resolve(
        LoadTodos.make({}),
        TodoListMessage.FailedLoadTodos({ reason: "bloqueado" })
      )
      assert.strictEqual(story.model.phase, "failed")
      assert.strictEqual(story.model.notice, "bloqueado")
    }))
})
