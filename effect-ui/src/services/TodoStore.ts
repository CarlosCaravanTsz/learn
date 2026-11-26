/**
 * services/TodoStore.ts — un service de Effect, no `localStorage` en la vista.
 *
 * Un service es un contrato (`load` / `save`) más un Layer que lo cumple.
 * `TodoStore` habla de tareas. Quién persiste —`localStorage` en el navegador,
 * memoria en los tests— es otro service, `KeyValueStore`, que el entry point
 * proporciona. El Component nunca elige el almacén: sus Commands piden
 * `TodoStore`.
 *
 * Es el patrón de `examples/auth`: `SessionStore` sobre `KeyValueStore`, y
 * `main.ts` cierra con `KeyValueStore.layerStorage(() => localStorage)`.
 */
import { Context, Effect, Layer, Option, Schema } from "effect"
import { KeyValueStore } from "effect/persistence"
import { Todo } from "../domain/Todo.ts"

export const TODOS_STORAGE_KEY = "effect-ui-pilot/todos"

export class TodoStore extends Context.Service<TodoStore, {
  readonly load: Effect.Effect<
    ReadonlyArray<Todo>,
    KeyValueStore.KeyValueStoreError | Schema.SchemaError
  >
  readonly save: (
    todos: ReadonlyArray<Todo>
  ) => Effect.Effect<void, KeyValueStore.KeyValueStoreError | Schema.SchemaError>
}>()("todos/TodoStore") {
  static readonly layer = Layer.effect(
    TodoStore,
    Effect.gen(function*() {
      // `toSchemaStore` codifica y decodifica con el Schema. Una lista rota
      // en el almacén llega al Command como error, no como un Model a medias.
      const store = KeyValueStore.toSchemaStore(
        yield* KeyValueStore.KeyValueStore,
        Schema.Array(Todo)
      )
      return TodoStore.of({
        load: store.get(TODOS_STORAGE_KEY).pipe(
          Effect.map(Option.getOrElse(() => []))
        ),
        save: (todos) => store.set(TODOS_STORAGE_KEY, todos)
      })
    })
  )
}
