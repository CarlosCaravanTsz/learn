/**
 * TodoList.ts — un Component: Model, Message, init, update y view.
 *
 * Effect UI aplica la arquitectura Elm a cada Component, no a la app entera.
 * Este archivo es un programa cerrado:
 *
 * - Model: el estado que `update` cambia (borrador, filtro, lista, fase).
 * - Message: un hecho en pasado (`SubmittedTodo`, `SucceededLoadTodos`).
 *   El nombre dice qué pasó; `update` decide qué significa.
 * - init: el Model inicial. Aquí también arranca el Command de carga.
 * - update: función pura. No llama a `localStorage`. Si hay que guardar,
 *   devuelve el Model nuevo y un Command con `$.run`.
 * - view: pinta el Model. Un click no muta nada: construye un Message.
 *
 * El filtro no se guarda. El Model guarda la lista completa y la vista
 * decide qué filas enseña. Eso es "el Model solo tiene lo que update cambia".
 *
 * Command: `LoadTodos` y `SaveTodos` son `Command.Service`. Su cuerpo corre
 * en el runtime, con `TodoStore` capturado en el Layer. `mode: "queue"` en
 * el guardado hace que dos clics seguidos se escriban en orden, no a la vez.
 */
import { Command, Component, Head, UiSchema, UiStruct } from "@effect/ui"
import { Button } from "@effect/ui-kit"
import { Html } from "@effect/ui/html"
import { Effect, Layer, Schema } from "effect"
import { Todo, nextIdFrom } from "./domain/Todo.ts"
import { TodoStore } from "./services/TodoStore.ts"

export const TodoFilter = Schema.Literals(["all", "active", "done"])
export type TodoFilter = typeof TodoFilter.Type

export const TodoListMessage = UiSchema.TaggedEnum({
  UpdatedDraft: { draft: Schema.String },
  SubmittedTodo: {},
  ClickedToggle: { id: Schema.String },
  ClickedDelete: { id: Schema.String },
  ClickedFilter: { filter: TodoFilter },
  ClickedRetry: {},
  SucceededLoadTodos: { todos: Schema.Array(Todo) },
  FailedLoadTodos: { reason: Schema.String },
  SucceededSaveTodos: {},
  FailedSaveTodos: { reason: Schema.String }
})

const describeStoreError = (error: { readonly message: string }): string =>
  error.message.length > 0 ? error.message : "No se pudo usar el almacén"

export class LoadTodos extends Command.Service<LoadTodos>()(
  "todos/LoadTodos",
  { args: {}, success: TodoListMessage }
) {
  static readonly layer = this.toLayer(
    Effect.gen(function*() {
      const store = yield* TodoStore
      return () =>
        store.load.pipe(
          Effect.match({
            onSuccess: (todos) => TodoListMessage.SucceededLoadTodos({ todos }),
            onFailure: (error) =>
              TodoListMessage.FailedLoadTodos({ reason: describeStoreError(error) })
          })
        )
    })
  )
}

export class SaveTodos extends Command.Service<SaveTodos>()(
  "todos/SaveTodos",
  {
    args: { todos: Schema.Array(Todo) },
    success: TodoListMessage,
    // Un guardado a la vez, en el orden de los clics.
    mode: "queue"
  }
) {
  static readonly layer = this.toLayer(
    Effect.gen(function*() {
      const store = yield* TodoStore
      return ({ todos }) =>
        store.save(todos).pipe(
          Effect.match({
            onSuccess: () => TodoListMessage.SucceededSaveTodos(),
            onFailure: (error) =>
              TodoListMessage.FailedSaveTodos({ reason: describeStoreError(error) })
          })
        )
    })
  )
}

export const TodoListModel = Schema.Struct({
  draft: Schema.String,
  filter: TodoFilter,
  todos: Schema.Array(Todo),
  nextId: Schema.Number,
  phase: Schema.Literals(["loading", "ready", "failed"]),
  notice: Schema.NullOr(Schema.String)
})
export type TodoListModel = typeof TodoListModel.Type

const FILTERS = [
  ["all", "Todas"],
  ["active", "Activas"],
  ["done", "Hechas"]
] as const

const visibleTodos = (model: TodoListModel): ReadonlyArray<Todo> =>
  model.todos.filter((todo) =>
    model.filter === "active"
      ? !todo.completed
      : model.filter === "done"
      ? todo.completed
      : true
  )

const TodoListDef = Html.component({
  name: "TodoList",
  model: TodoListModel,
  message: TodoListMessage
})

const emptyCopy = (filter: TodoFilter): string => {
  if (filter === "active") return "No hay tareas activas."
  if (filter === "done") return "Todavía no hay tareas hechas."
  return "La lista está vacía. Agrega la primera."
}

export const TodoListNoDeps = TodoListDef.make({
  // init puede devolver un paso: Model + Command. Al montar, leemos el almacén.
  init: ($) =>
    $.set({
      draft: "",
      filter: "all",
      todos: [],
      nextId: 1,
      phase: "loading",
      notice: null
    }).run(LoadTodos.make({})),
  update: {
    UpdatedDraft: ($, { draft }) => $.evolve({ draft }),
    SubmittedTodo: ($) => {
      const title = $.model.draft.trim()
      if ($.model.phase !== "ready" || title === "") return $.model
      const todos = [
        ...$.model.todos,
        { id: String($.model.nextId), title, completed: false }
      ]
      return $.evolve({
        draft: "",
        nextId: $.model.nextId + 1,
        todos,
        notice: null
      }).run(SaveTodos.make({ todos }))
    },
    ClickedToggle: ($, { id }) => {
      if ($.model.phase !== "ready") return $.model
      const current = $.model.todos.find((todo) => todo.id === id)
      if (current === undefined) return $.model
      // `UiStruct.evolve` cambia un campo de una fila y deja el resto igual.
      const todos = $.model.todos.map((todo) =>
        todo.id === id
          ? UiStruct.evolve(todo, { completed: (completed) => !completed })
          : todo
      )
      return $.evolve({ todos, notice: null }).run(SaveTodos.make({ todos }))
    },
    ClickedDelete: ($, { id }) => {
      if ($.model.phase !== "ready") return $.model
      if (!$.model.todos.some((todo) => todo.id === id)) return $.model
      const todos = $.model.todos.filter((todo) => todo.id !== id)
      return $.evolve({ todos, notice: null }).run(SaveTodos.make({ todos }))
    },
    // El filtro es estado de vista. No dispara un Command.
    ClickedFilter: ($, { filter }) => $.evolve({ filter }),
    ClickedRetry: ($) =>
      $.evolve({ phase: "loading", notice: null }).run(LoadTodos.make({})),
    SucceededLoadTodos: ($, { todos }) =>
      $.evolve({
        phase: "ready",
        todos,
        nextId: nextIdFrom(todos),
        notice: null
      }),
    FailedLoadTodos: ($, { reason }) =>
      $.evolve({ phase: "failed", notice: reason }),
    SucceededSaveTodos: ($) => $.evolve({ notice: null }),
    FailedSaveTodos: ($, { reason }) => $.evolve({ notice: reason })
  },
  head: () => [Head.title("Tareas · Effect UI")],
  view: (h, model) => {
    const pending = model.todos.filter((todo) => !todo.completed).length
    const visible = visibleTodos(model)
    return h.section.class("panel").children(
      h.header.class("panel-head").children(
        h.h1.children("Tareas"),
        model.phase === "ready" &&
          h.p.class("muted").children(
            pending === 1 ? "1 pendiente" : `${pending} pendientes`
          )
      ),
      model.notice !== null &&
        h.p.attr("role", "alert").class("alert").children(model.notice),
      model.phase === "loading" &&
        h.p.attr("role", "status").children("Cargando tareas…"),
      model.phase === "failed" &&
        Button(h, { onPress: TodoListMessage.ClickedRetry() })
          .class("primary")
          .children("Reintentar"),
      model.phase === "ready" &&
        h.form.attr("aria-label", "Nueva tarea")
          .on("submit", TodoListMessage.SubmittedTodo())
          .class("row")
          .children(
            h.input
              .attr("aria-label", "Nueva tarea")
              .attr("placeholder", "¿Qué hay que hacer?")
              .value(model.draft)
              .on("input", ({ value }) => TodoListMessage.UpdatedDraft({ draft: value })),
            Button(h, {
              props: {
                type: "submit",
                disabled: model.draft.trim() === ""
              }
            }).class("primary").children("Agregar")
          ),
      model.phase === "ready" &&
        h.div.attr("role", "group").attr("aria-label", "Filtro").class("filters")
          .children(
            FILTERS.map(([filter, label]) =>
              Button(h, { onPress: TodoListMessage.ClickedFilter({ filter }) })
                .key(filter)
                .attr("aria-pressed", String(model.filter === filter))
                .class("chip", model.filter === filter && "chip-current")
                .children(label)
            )
          ),
      model.phase === "ready" &&
        (visible.length === 0
          ? h.p.class("muted").children(emptyCopy(model.filter))
          : h.ul.class("todos").children(
            visible.map((todo) =>
              h.li.key(todo.id).class("todo", todo.completed && "todo-done").children(
                Button(h, { onPress: TodoListMessage.ClickedToggle({ id: todo.id }) })
                  .attr(
                    "aria-label",
                    todo.completed
                      ? `Marcar pendiente: ${todo.title}`
                      : `Completar: ${todo.title}`
                  )
                  .class("ghost")
                  .children(todo.completed ? "Hecha" : "Pendiente"),
                h.span.class("todo-title").children(todo.title),
                Button(h, { onPress: TodoListMessage.ClickedDelete({ id: todo.id }) })
                  .attr("aria-label", `Eliminar ${todo.title}`)
                  .class("ghost danger")
                  .children("Eliminar")
              )
            )
          ))
    )
  }
})

/**
 * `Component.provide` es `Effect.provide` para este Component y lo que
 * renderice debajo. Los Commands quedan resueltos. `TodoStore` sigue pidiendo
 * `KeyValueStore`, y eso lo pone quien monta la app (o el test).
 */
export const TodoList = TodoListNoDeps.pipe(
  Component.provide(
    Layer.mergeAll(LoadTodos.layer, SaveTodos.layer).pipe(
      Layer.provide(TodoStore.layer)
    )
  )
)
